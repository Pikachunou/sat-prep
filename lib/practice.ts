import { getFullTest, type FullTestId, type TestRun } from './full-tests';
import { BY_ID, QUESTIONS, SKILLS, type Skill } from './questions';
export const CAUSES = ['Not sure yet', 'Concept gap', 'Calculation slip', 'Misread the question', 'Eliminated the right answer', 'Time pressure'] as const;
export type Cause = typeof CAUSES[number];
export type Attempt = { questionId:string; selected:number|null; seconds:number; correct:boolean; cause:Cause };
export type Session = { id:string; mode:string; createdAt:number; timed:boolean; expired:boolean; fullTestId?:FullTestId; attempts:Attempt[] };
export type Draft = { id:string; mode:string; ids:string[]; answers:Record<string,number>; spent:Record<string,number>; index:number; timed:boolean; deadline:number|null; startedAt:number; viewedAt:number; checked:string[]; exam?:TestRun };
export const budget = (n:number,mode='Mixed') => Math.round(n * (mode==='Math'?70*60/44:64*60/54));
export function secondsLeft(deadline:number, now=Date.now()) { return Math.max(0, Math.ceil((deadline-now)/1000)); }
export function stats(history:Session[]) {
  return (Object.keys(SKILLS) as Skill[]).map(skill=>{
    const attempts=history.flatMap(s=>s.attempts).filter(a=>BY_ID[a.questionId]?.skill===skill);
    const correct=attempts.filter(a=>a.correct).length;
    return { skill, total:attempts.length, correct, missed:attempts.length-correct, accuracy:attempts.length?Math.round(correct/attempts.length*100):null };
  }).sort((a,b)=>b.missed-a.missed || (a.accuracy??101)-(b.accuracy??101));
}
export type PracticeLevel = 'Standard'|'Challenge';
export function setLengths(mode:string,level:PracticeLevel='Standard'){const max=QUESTIONS.filter(q=>(q.difficulty==='Challenge')===(level==='Challenge')&&(mode==='Math'?SKILLS[q.skill].section==='Math':mode==='Mixed'?SKILLS[q.skill].section!=='Math':SKILLS[q.skill].section===mode)).length;return (mode==='Math'?[4,6,8,10,15,20,22]:[4,6,8,10,15,20,27]).filter(n=>n<=max);}
export function chooseQuestions(mode:string,history:Session[],target?:Skill,excluded:string[]=[],count?:number,level:PracticeLevel='Standard') {
  if(!['Standard','Challenge'].includes(level))throw Error('Invalid practice level');
  const seen=new Map<string,number>();for(const a of history.flatMap(s=>s.attempts))seen.set(a.questionId,(seen.get(a.questionId)??0)+1);
  const ordered=QUESTIONS.filter(q=>!excluded.includes(q.id)).sort((a,b)=>(seen.get(a.id)??0)-(seen.get(b.id)??0));
  if(target){const fresh=ordered.filter(q=>q.skill===target);const fallback=QUESTIONS.filter(q=>q.skill===target&&excluded.includes(q.id));return [...fresh,...fallback].slice(0,3).map(q=>q.id);}
  if(!['Mixed','Reading','Writing','Math'].includes(mode))throw Error('Invalid practice mode');
  const n=count??(mode==='Reading'||mode==='Writing'?6:8);if(!setLengths(mode,level).includes(n))throw Error('Invalid question count');
  const pool=ordered.filter(q=>(q.difficulty==='Challenge')===(level==='Challenge')).filter(q=>mode==='Math'?SKILLS[q.skill].section==='Math':mode==='Reading'||mode==='Writing'?SKILLS[q.skill].section===mode:SKILLS[q.skill].section!=='Math');
  const picks:string[]=[];const skillCount:Partial<Record<Skill,number>>={};const practiced:Partial<Record<Skill,number>>={};
  for(const a of history.flatMap(s=>s.attempts)){const skill=BY_ID[a.questionId]?.skill;if(skill)practiced[skill]=(practiced[skill]??0)+1;}
  for(let i=0;i<n;i++){const remaining=pool.filter(q=>!picks.includes(q.id));remaining.sort((a,b)=>(seen.get(a.id)??0)-(seen.get(b.id)??0)||(skillCount[a.skill]??0)-(skillCount[b.skill]??0)||(practiced[a.skill]??0)-(practiced[b.skill]??0));const next=remaining[0];if(!next)throw Error('Not enough questions');picks.push(next.id);skillCount[next.skill]=(skillCount[next.skill]??0)+1;}
  return picks;
}
export function validateSession(value:unknown):Session {
  if(!value || typeof value!=='object') throw new Error('Invalid session');
  const v=value as Session;const full=v.fullTestId===undefined?null:getFullTest(v.fullTestId);
  if(typeof v.id!=='string' || !/^[a-zA-Z0-9-]{10,80}$/.test(v.id) || typeof v.mode!=='string' || v.mode.length>80 || !Array.isArray(v.attempts) || v.attempts.length<1 || v.attempts.length>(full?98:32) || typeof v.timed!=='boolean' || typeof v.expired!=='boolean') throw new Error('Invalid session');
  if(full&&(v.attempts.length!==98||!v.timed||JSON.stringify(v.attempts.map(a=>a.questionId))!==JSON.stringify(full.modules.flatMap(m=>m.ids))))throw Error('Invalid full test');
  const used=new Set<string>();
  const attempts=v.attempts.map(a=>{
    const q=BY_ID[a.questionId];
    if(!q || used.has(q.id) || (a.selected!==null && (!Number.isInteger(a.selected) || a.selected<0 || a.selected>3)) || !Number.isFinite(a.seconds) || a.seconds<0 || a.seconds>86400 || !CAUSES.includes(a.cause)) throw new Error('Invalid attempt');
    used.add(q.id);
    return {questionId:q.id, selected:a.selected, seconds:Math.round(a.seconds), correct:a.selected===q.answer, cause:a.selected===q.answer?'Not sure yet' as Cause:a.cause};
  });
  return {id:v.id,mode:full?full.name:v.mode,...(full?{fullTestId:full.id}:{}),createdAt:Date.now(),timed:v.timed,expired:v.expired,attempts};
}
