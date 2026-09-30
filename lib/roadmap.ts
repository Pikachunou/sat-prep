import { BY_ID, SKILLS, type Skill } from './questions';
import { stats, type Session, type Attempt } from './practice';
export type Goals = { accuracyTarget:number; minimumQuestions:number; dailyMinutes:number; rwFocus:Skill|null; mathFocus:Skill|null; completedTasks:string[] };
export const DEFAULT_GOALS:Goals={accuracyTarget:90,minimumQuestions:8,dailyMinutes:75,rwFocus:null,mathFocus:null,completedTasks:[]};
export const DATES=['2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-03'];
export const TASK_KEYS=['rw','math','review','drill','desmos','official','setup','rest','warmup','arrive'];
export function validateGoalPatch(value:unknown):Partial<Goals> {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid goals');
  const v=value as Record<string,unknown>; const p:Partial<Goals>={};
  if(!Object.keys(v).length||Object.keys(v).some(k=>!Object.hasOwn(DEFAULT_GOALS,k)))throw Error('Invalid goals');
  for(const k of ['accuracyTarget','minimumQuestions','dailyMinutes'] as const){if(k in v){const options=k==='accuracyTarget'?[80,90,100]:k==='minimumQuestions'?[4,6,8]:[45,75,180];if(!options.includes(v[k] as number))throw Error('Invalid target');p[k]=v[k] as number;}}
  for(const k of ['rwFocus','mathFocus'] as const){if(k in v){const s=v[k];if(s!==null&&(typeof s!=='string'||!Object.hasOwn(SKILLS,s)||(SKILLS[s as Skill].section==='Math')!==(k==='mathFocus')))throw Error('Invalid focus');p[k]=s as Skill|null;}}
  if('completedTasks' in v){const a=v.completedTasks;if(!Array.isArray(a)||a.length>50||a.some(id=>typeof id!=='string'||!DATES.some(d=>TASK_KEYS.some(k=>id===`${d}-${k}`))))throw Error('Invalid checklist');p.completedTasks=[...new Set(a)] as string[];}
  return p;
}
export function focusFor(history:Session[],math:boolean,manual:Skill|null):Skill {
  if(manual)return manual;
  return stats(history).filter(s=>(SKILLS[s.skill].section==='Math')===math)[0].skill;
}
export function freshGoal(history:Session[],skill:Skill,goals:Goals) {
  const seen=new Set<string>(); const fresh:Attempt[]=[];
  for(const s of [...history].sort((a,b)=>a.createdAt-b.createdAt))for(const a of s.attempts){if(BY_ID[a.questionId]?.skill===skill&&!seen.has(a.questionId)){seen.add(a.questionId);fresh.push(a);}}
  const sample=fresh.slice(-goals.minimumQuestions);const correct=sample.filter(a=>a.correct).length;
  const required=Math.ceil(goals.minimumQuestions*goals.accuracyTarget/100);
  return {total:sample.length,correct,required,met:sample.length===goals.minimumQuestions&&correct>=required,accuracy:sample.length?Math.round(correct/sample.length*100):null};
}
export function pacificDate(timestamp:number) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(timestamp));
  return ['year','month','day'].map(k=>parts.find(p=>p.type===k)!.value).join('-');
}
export type Task={key:string;title:string;detail:string;minutes:number;action?:'rw'|'math'|'rwDrill'|'mathDrill';href?:string;auto?:'rw'|'math'|'rwDrill'|'mathDrill'};
export function dailyPlan(date:string,minutes:number):{title:string;tasks:Task[]} {
  const rw:Task={key:'rw',title:'Timed Reading & Writing set',detail:'Finish 8 questions. Mark uncertainty and review the evidence or rule behind every miss.',minutes:10,action:'rw',auto:'rw'};
  const math:Task={key:'math',title:'Timed Math refresh',detail:'Finish 8 questions across all four domains. Separate forgotten concepts from calculation slips.',minutes:13,action:'math',auto:'math'};
  const review:Task={key:'review',title:'Review every miss',detail:'Read each explanation, name the error cause, and write one rule you can apply next time.',minutes:minutes===45?12:20};
  const drill:Task={key:'drill',title:'Repair your Reading & Writing focus',detail:'Do 3 fresh follow-ups. Explain why each wrong option fails before checking.',minutes:minutes===45?10:15,action:'rwDrill',auto:'rwDrill'};
  if(date===DATES[0])return {title:'Diagnose the rust',tasks:[rw,math,review,{...drill,title:'Start one focused repair'}]};
  if(date===DATES[1]&&minutes===180)return {title:'Check the full-test picture',tasks:[{key:'official',title:'Take one official Bluebook practice test',detail:'Use the actual timing and break. Treat it as a diagnostic; log your misses by skill.',minutes:150,href:'https://satsuite.collegeboard.org/practice/practice-tests/bluebook'},{...review,minutes:30,title:'Review the official test',detail:'Compare the two section scores. Keep R&W first unless Math shows a real gap; choose one focus in each section.'}]};
  if(date===DATES[1])return {title:'Repair the two biggest gaps',tasks:[{...drill,title:'Two R&W focus drills',detail:'Run two 3-question drills. Check reasoning after each answer and write the rule for each miss.',minutes:minutes===45?15:25}, {...math,key:'math',title:'Math focus drill',detail:'Run 3 fresh questions on your Math focus. Use algebra first, then verify with the calculator.',minutes:10,action:'mathDrill',auto:'mathDrill'},{key:'desmos',title:'Practice the graphing calculator',detail:'Graph two lines and find their intersection; graph a quadratic and locate its roots and vertex.',minutes:10,href:'https://www.desmos.com/testing/collegeboard/graphing'},{...review,minutes:minutes===45?10:20}]};
  if(date===DATES[2])return {title:'Apply the fixes under time',tasks:[rw,math,review,{...drill,title:'Check your fresh-question goal',detail:'Drill your focus, then check the goal cards. Accuracy on new questions matters more than repeating a solved one.'}]};
  if(date===DATES[3])return {title:'Keep it light; get ready',tasks:[{key:'review',title:'Review your short error list',detail:'Revisit your most useful R&W rules and Math formulas. Explain one past mistake in each section.',minutes:15},{key:'drill',title:'One short Math confidence drill',detail:'Try 3 questions on your Math focus, then stop. Use this to refresh your method, not to chase a practice score.',minutes:10,action:'mathDrill',auto:'mathDrill'},{key:'setup',title:'Complete Bluebook exam setup',detail:'On your testing device, complete exam setup and get your admission ticket. Check required items, charge your device, and confirm travel.',minutes:10,href:'https://satsuite.collegeboard.org/sat/what-to-bring-do'},{key:'rest',title:'Protect your rest',detail:'End intensive practice early. Choose your bedtime and morning plan; avoid a late full-length test.',minutes:0}]};
  return {title:'Show up ready',tasks:[{key:'warmup',title:'Optional familiar warm-up',detail:'Spend up to 5 minutes reviewing a few familiar formulas and reading rules. Skip it if it adds stress.',minutes:5},{key:'arrive',title:'Follow your admission ticket and test-day checklist',detail:'Eat, bring your required items, and arrive at the time shown in your official instructions. Follow the test’s timing and breaks.',minutes:0,href:'https://satsuite.collegeboard.org/sat/what-to-bring-do'}]};
}
export function taskCompleted(history:Session[],date:string,task:Task):boolean {
  const day=history.filter(s=>pacificDate(s.createdAt)===date);
  if(task.auto==='rwDrill'||task.auto==='mathDrill')return day.filter(s=>!s.timed&&s.attempts.every(a=>a.selected!==null&&(SKILLS[BY_ID[a.questionId]?.skill]?.section==='Math')===(task.auto==='mathDrill'))).reduce((n,s)=>n+s.attempts.filter(a=>a.selected!==null).length,0)>=(date===DATES[1]&&task.auto==='rwDrill'?6:3);
  if(task.auto==='rw'||task.auto==='math')return day.some(s=>s.timed&&s.attempts.length>=8&&s.attempts.every(a=>a.selected!==null&&(SKILLS[BY_ID[a.questionId]?.skill]?.section==='Math')===(task.auto==='math')));
  return false;
}
