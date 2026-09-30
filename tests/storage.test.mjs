import {strict as assert} from 'node:assert';
import {BY_ID, chooseQuestions, newFullTest, closeTestModule, continueTest} from '../.test-build/practice-bundle.mjs';
import {HISTORY_KEY, GOALS_KEY, readHistory, saveSession, updateCause, readGoals, patchGoals, progress} from '../.test-build/browser-store.mjs';
const values=new Map();
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
assert.deepEqual(readHistory(),[]);
const ids=chooseQuestions('Math',[],undefined,[],4);
const value={id:'pages-test-session-01',createdAt:1000,mode:'Math',timed:true,expired:false,attempts:ids.map((id,i)=>({questionId:id,selected:i===0?(BY_ID[id].answer+1)%4:BY_ID[id].answer,seconds:15,correct:true,cause:'Not sure yet'}))};
let saved=saveSession(value);assert.equal(saved.attempts.filter(a=>a.correct).length,3);assert.equal(saved.createdAt,1000);
assert.equal(readHistory().length,1);assert.equal((await progress()).sessions.length,1);
saved=updateCause(saved.id,ids[0],'Calculation slip');assert.equal(readHistory()[0].attempts[0].cause,'Calculation slip');
saveSession(saved);assert.equal(readHistory().length,1,'retrying a save cannot duplicate the session');
assert.throws(()=>updateCause(saved.id,ids[1],'Concept gap'));
const goals=patchGoals({dailyMinutes:45,accuracyTarget:100,mathFocus:'mathSystems',completedTasks:['2026-09-30-review']});
assert.deepEqual(readGoals(),goals);assert.throws(()=>patchGoals({dailyMinutes:-1}));
// Simulate a new browser/device. No practice or goals are shared across stores.
const other=new Map();globalThis.localStorage={getItem:key=>other.get(key)??null,setItem:(key,value)=>other.set(key,value)};
assert.equal(readHistory().length,0);assert.equal(readGoals().dailyMinutes,75);
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
assert.equal(readHistory().length,1);assert.equal(readGoals().dailyMinutes,45);
// Both complete test forms grade and persist all 98 answers.
for(const testId of ['sprint-test-1','sprint-test-2']){
  let now=10000;let draft=newFullTest(testId,now,`pages-${testId}-grade`);let session;
  for(let module=0;module<4;module++){
    draft.answers=Object.fromEntries(draft.ids.map(id=>[id,BY_ID[id].answer]));
    const end=closeTestModule(draft,false,now+=1000);
    if(end.session){session=end.session;break;}
    draft=end.draft;
    if(draft.exam.stage==='break'){now=draft.deadline;draft=closeTestModule(draft,true,now).draft;}
    draft=continueTest(draft,now+=1000);
  }
  const graded=saveSession({...session,attempts:session.attempts.map(a=>({...a,correct:false}))});
  assert.equal(graded.attempts.length,98);assert(graded.attempts.every(a=>a.correct));
  assert.equal(readHistory().find(s=>s.fullTestId===testId).attempts.length,98);
}
// Failed writes are reported and leave the previous saved results untouched.
const before=values.get(HISTORY_KEY);
globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:()=>{throw Error('quota');}};
assert.throws(()=>saveSession({...value,id:'pages-test-failed-save'}),/Could not save/);assert.equal(values.get(HISTORY_KEY),before);
assert.throws(()=>patchGoals({dailyMinutes:75}),/Could not save/);
globalThis.localStorage={getItem:()=>'{bad json',setItem:()=>{assert.fail('corrupt data must not be overwritten');}};
assert.throws(()=>readHistory(),/could not be read/);assert.throws(()=>readGoals(),/could not be read/);
assert.throws(()=>saveSession(value),/could not be read/);
globalThis.localStorage={getItem:()=>{throw Error('blocked');}};assert.throws(()=>readHistory(),/unavailable/);
delete globalThis.localStorage;
console.log('PASS: browser persistence, answer-key grading, error categorization, goals, distinct devices, two complete 98-answer tests, duplicate-save prevention, storage failures, and corrupt-data protection.');
