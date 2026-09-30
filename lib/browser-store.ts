import { CAUSES, validateSession, type Cause, type Session } from './practice';
import { DEFAULT_GOALS, validateGoalPatch, type Goals } from './roadmap';

export const HISTORY_KEY = 'sat-sprint-pages-progress-v1';
export const GOALS_KEY = 'sat-sprint-pages-goals-v1';

function read(key:string):unknown {
  let raw:string|null;
  try { raw=localStorage.getItem(key); }
  catch { throw Error('Browser storage is unavailable. Allow storage for this site to save progress.'); }
  if(raw===null)return null;
  try { return JSON.parse(raw); }
  catch { throw Error('Saved practice data could not be read. It has been left unchanged.'); }
}
function write(key:string,value:unknown) {
  try { localStorage.setItem(key,JSON.stringify(value)); }
  catch { throw Error('Could not save on this device. Browser storage may be blocked or full. Allow storage, then retry.'); }
}
function regrade(value:unknown):Session {
  const session=validateSession(value);
  const time=(value as Session).createdAt;
  if(!Number.isFinite(time)||time<0)throw Error('Invalid saved practice date');
  return {...session,createdAt:time};
}
export function readHistory():Session[] {
  const value=read(HISTORY_KEY);
  if(value===null)return [];
  if(!Array.isArray(value))throw Error('Saved practice history could not be read. It has been left unchanged.');
  const sessions=value.map(regrade);
  if(new Set(sessions.map(s=>s.id)).size!==sessions.length)throw Error('Invalid saved practice history');
  return sessions.sort((a,b)=>b.createdAt-a.createdAt);
}
export function saveSession(value:unknown):Session {
  const session=regrade(value);
  const history=readHistory();
  write(HISTORY_KEY,[session,...history.filter(s=>s.id!==session.id)]);
  return session;
}
export function updateCause(id:string,questionId:string,cause:Cause):Session {
  if(!CAUSES.includes(cause))throw Error('Choose a valid error category.');
  const history=readHistory();const session=history.find(s=>s.id===id);
  const attempt=session?.attempts.find(a=>a.questionId===questionId);
  if(!session||!attempt||attempt.correct)throw Error('This missed question could not be found.');
  const updated={...session,attempts:session.attempts.map(a=>a.questionId===questionId?{...a,cause}:a)};
  write(HISTORY_KEY,history.map(s=>s.id===id?updated:s));return updated;
}
export function progress():Promise<{sessions:Session[]}>;
export function progress(init:RequestInit):Promise<{sessions:Session[];session:Session}>;
export async function progress(init?:RequestInit):Promise<{sessions:Session[];session?:Session}> {
  if(!init)return {sessions:readHistory()};
  const body=JSON.parse(String(init.body));
  const session=init.method==='POST'?saveSession(body):init.method==='PATCH'?updateCause(body.id,body.questionId,body.cause):null;
  if(!session)throw Error('Unsupported practice action');
  return {session,sessions:readHistory()};
}
export function readGoals():Goals {
  const value=read(GOALS_KEY);
  return {...DEFAULT_GOALS,completedTasks:[],...(value===null?{}:validateGoalPatch(value))};
}
export function patchGoals(value:unknown):Goals {
  const goals={...readGoals(),...validateGoalPatch(value)};
  write(GOALS_KEY,goals);return goals;
}
