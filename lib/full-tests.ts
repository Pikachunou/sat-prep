import { BY_ID, QUESTIONS, SKILLS, type Skill } from './questions';
import type { Attempt, Draft, Session } from './practice';
export type FullTestId='sprint-test-1'|'sprint-test-2';
export type TestModule={name:string;section:'Reading & Writing'|'Math';seconds:number;ids:string[]};
export type FullTest={id:FullTestId;name:string;modules:TestModule[]};
export type TestRun={testId:FullTestId;moduleIndex:number;stage:'module'|'transition'|'break';completed:Attempt[];anyExpired:boolean};
const blueprints:Partial<Record<Skill,number>>[]=[
  {vocabulary:4,purpose:4,inference:4,evidence:3,boundaries:4,form:3,transitions:3,synthesis:2},
  {vocabulary:4,purpose:3,inference:3,evidence:4,boundaries:3,form:4,transitions:3,synthesis:3},
  {mathLinear:4,mathSystems:4,mathQuadratics:4,mathFunctions:4,mathRatios:2,mathData:1,mathGeometry:2,mathTrig:1},
  {mathLinear:4,mathSystems:3,mathQuadratics:4,mathFunctions:3,mathRatios:2,mathData:2,mathGeometry:2,mathTrig:2},
];
// Fixed forms drawn from the original bank. Cursors prevent overlap between forms.
const cursor:Partial<Record<Skill,number>>={};
export const FULL_TESTS:FullTest[]=([1,2] as const).map(n=>({id:`sprint-test-${n}`,name:`Practice Test ${n}`,modules:blueprints.map((blueprint,index)=>{
  const ids=Object.entries(blueprint).flatMap(([s,count])=>{const skill=s as Skill;const start=cursor[skill]??0;const pool=QUESTIONS.filter(q=>q.skill===skill&&q.id.startsWith('extra-'));const chosen=pool.slice(start,start+count!);if(chosen.length!==count)throw Error(`Not enough questions for ${skill}`);cursor[skill]=start+count!;return chosen.map(q=>q.id);});
  // Group Reading & Writing skills; put medium Math items before hard items.
  if(index>=2)ids.sort((a,b)=>Number(BY_ID[a].difficulty==='Hard')-Number(BY_ID[b].difficulty==='Hard'));
  return {name:`${index<2?'Reading & Writing':'Math'} · Module ${index%2+1}`,section:index<2?'Reading & Writing':'Math',seconds:index<2?32*60:35*60,ids};
})}));
export function getFullTest(id:unknown):FullTest {const test=FULL_TESTS.find(t=>t.id===id);if(!test)throw Error('Unknown practice test');return test;}
export function newFullTest(id:FullTestId,now=Date.now(),sessionId=crypto.randomUUID()):Draft {
  const test=getFullTest(id);return {id:sessionId,mode:test.name,ids:[...test.modules[0].ids],answers:{},spent:{},index:0,timed:true,deadline:now+test.modules[0].seconds*1000,startedAt:now,viewedAt:now,checked:[],exam:{testId:id,moduleIndex:0,stage:'module',completed:[],anyExpired:false}};
}
function gradeModule(d:Draft,expired:boolean,now:number):Attempt[] {
  const end=Math.min(now,d.deadline??now);const current=d.ids[d.index];const spent={...d.spent,[current]:(d.spent[current]??0)+Math.max(0,(end-d.viewedAt)/1000)};
  return d.ids.map(questionId=>{const q=BY_ID[questionId];const selected=d.answers[questionId]??null;return {questionId,selected,seconds:Math.round(spent[questionId]??0),correct:selected===q.answer,cause:selected===null&&expired?'Time pressure':'Not sure yet'};});
}
export function closeTestModule(d:Draft,expired:boolean,now=Date.now()):{draft:Draft|null;session:Session|null} {
  if(!d.exam)throw Error('No full test is active');
  if(d.exam.stage==='break'){if(now<(d.deadline??Infinity))throw Error('The break is still running');return {draft:{...d,deadline:null,exam:{...d.exam,stage:'transition'}},session:null};}
  if(d.exam.stage!=='module')throw Error('Continue to the next module first');
  const completed=[...d.exam.completed,...gradeModule(d,expired,now)];const anyExpired=d.exam.anyExpired||expired;
  if(d.exam.moduleIndex===3)return {draft:null,session:{id:d.id,mode:getFullTest(d.exam.testId).name,fullTestId:d.exam.testId,createdAt:now,timed:true,expired:anyExpired,attempts:completed}};
  const takingBreak=d.exam.moduleIndex===1;
  return {draft:{...d,deadline:takingBreak?now+10*60*1000:null,exam:{...d.exam,completed,anyExpired,stage:takingBreak?'break':'transition'}},session:null};
}
export function continueTest(d:Draft,now=Date.now()):Draft {
  if(!d.exam||d.exam.stage!=='transition'||d.exam.moduleIndex>=3)throw Error('The next module is not ready');
  const index=d.exam.moduleIndex+1;const module=getFullTest(d.exam.testId).modules[index];
  return {...d,ids:[...module.ids],answers:{},spent:{},index:0,deadline:now+module.seconds*1000,viewedAt:now,checked:[],exam:{...d.exam,moduleIndex:index,stage:'module'}};
}
export function recoverDraft(value:unknown):Draft|null {
  if(!value||typeof value!=='object')return null;const d=value as Draft;
  if(typeof d.id!=='string'||typeof d.mode!=='string'||!Array.isArray(d.ids)||!d.ids.length||d.ids.some(id=>!BY_ID[id])||new Set(d.ids).size!==d.ids.length||!Number.isInteger(d.index)||d.index<0||d.index>=d.ids.length||typeof d.timed!=='boolean'||!Number.isFinite(d.startedAt)||!Number.isFinite(d.viewedAt)||!d.answers||!d.spent||!Array.isArray(d.checked))return null;
  if(Object.entries(d.answers).some(([id,a])=>!d.ids.includes(id)||!Number.isInteger(a)||a<0||a>3)||Object.entries(d.spent).some(([id,t])=>!d.ids.includes(id)||!Number.isFinite(t)||t<0)||d.checked.some(id=>!d.ids.includes(id)))return null;
  if(!d.exam)return (!d.timed||Number.isFinite(d.deadline))&&d.ids.length<=32?d:null;
  try{const e=d.exam;const test=getFullTest(e.testId);if(!d.timed||!Number.isInteger(e.moduleIndex)||e.moduleIndex<0||e.moduleIndex>3||!['module','transition','break'].includes(e.stage)||typeof e.anyExpired!=='boolean')return null;
    if((e.stage==='break'&&e.moduleIndex!==1)||(e.stage!=='module'&&e.moduleIndex===3)||(e.stage==='transition'?d.deadline!==null:!Number.isFinite(d.deadline)))return null;
    const module=test.modules[e.moduleIndex];if(JSON.stringify(d.ids)!==JSON.stringify(module.ids))return null;
    const previous=test.modules.slice(0,e.moduleIndex+(e.stage==='module'?0:1)).flatMap(m=>m.ids);
    if(!Array.isArray(e.completed)||e.completed.length!==previous.length||e.completed.some((a,i)=>a.questionId!==previous[i]||(a.selected!==null&&(!Number.isInteger(a.selected)||a.selected<0||a.selected>3))||!Number.isFinite(a.seconds)||a.seconds<0))return null;
    return d;
  }catch{return null;}
}
export function testSummary(s:Session) {
  const groups=[{name:'Reading & Writing',attempts:s.attempts.filter(a=>SKILLS[BY_ID[a.questionId].skill].section!=='Math')},{name:'Math',attempts:s.attempts.filter(a=>SKILLS[BY_ID[a.questionId].skill].section==='Math')}];
  return groups.map(g=>({...g,total:g.attempts.length,correct:g.attempts.filter(a=>a.correct).length,unanswered:g.attempts.filter(a=>a.selected===null).length}));
}
