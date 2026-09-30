import { strict as assert } from 'node:assert';
import { QUESTIONS, BY_ID, SKILLS, budget, secondsLeft, stats, chooseQuestions, validateSession, DEFAULT_GOALS, validateGoalPatch, freshGoal, dailyPlan, pacificDate, taskCompleted } from '../.test-build/practice-bundle.mjs';
assert.equal(QUESTIONS.length,300);
assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,300);
for(const q of QUESTIONS){assert.equal(q.options.length,4);assert.equal(q.explanations.length,4);assert(q.explanations.every(e=>e.length>25));assert(q.answer>=0&&q.answer<=3);assert(SKILLS[q.skill]);}
for(const skill of Object.keys(SKILLS)) assert.equal(QUESTIONS.filter(q=>q.skill===skill).length,SKILLS[skill].section==='Math'?({mathLinear:16,mathSystems:14,mathQuadratics:16,mathFunctions:14}[skill]??8):26);
assert.equal(budget(8),569);assert.equal(budget(6),427);
assert.equal(secondsLeft(10000,9001),1);assert.equal(secondsLeft(10000,10001),0);
const mixed=chooseQuestions('Mixed',[]);assert.equal(mixed.length,8);assert.equal(new Set(mixed.map(id=>BY_ID[id].skill)).size,8);
for(const section of ['Reading','Writing']){const ids=chooseQuestions(section,[]);assert.equal(ids.length,6);assert.equal(new Set(ids.map(id=>BY_ID[id].skill)).size,4);assert(ids.every(id=>SKILLS[BY_ID[id].skill].section===section));}
const session=validateSession({id:'test-session-0001',mode:'Mixed',timed:true,expired:true,attempts:mixed.map((id,i)=>({questionId:id,selected:i===0?null:BY_ID[id].answer,seconds:40,correct:false,cause:i===0?'Time pressure':'Not sure yet'}))});
assert.equal(session.attempts.filter(a=>a.correct).length,7,'grader must recompute correctness');
const weak=stats([session]);assert.equal(weak[0].skill,'vocabulary');assert.equal(weak[0].missed,1);assert.equal(weak[0].accuracy,0);
const follow=chooseQuestions('Drill',[session],'vocabulary',mixed);assert.equal(follow.length,3);assert(follow.every(id=>BY_ID[id].skill==='vocabulary'&&!mixed.includes(id)));
const next=chooseQuestions('Mixed',[session]);assert(next.every(id=>!mixed.includes(id)),'mixed sets must prefer unseen questions');
assert.throws(()=>validateSession({...session,attempts:[{...session.attempts[0],selected:4}]}));
assert.throws(()=>validateSession({...session,attempts:[session.attempts[0],session.attempts[0]]}));
assert.throws(()=>validateSession({...session,attempts:[{...session.attempts[0],cause:'Made up'}]}));
assert.throws(()=>validateSession({...session,attempts:[{...session.attempts[0],questionId:'not-real'}]}));
assert.throws(()=>validateSession({...session,attempts:[{...session.attempts[0],seconds:-1}]}));
assert.equal(stats([]).every(s=>s.accuracy===null),true);
// Every new question is reachable; balanced mixed sets consume the full bank before repeats.
let simulated=[];const visited=new Set();
for(let i=0;i<26;i++){
  const ids=chooseQuestions('Mixed',simulated);
  assert.equal(new Set(ids).size,8);
  for(const id of ids){assert(!visited.has(id),`premature repeat: ${id}`);visited.add(id);}
  const completed=validateSession({id:`coverage-session-${i}`,mode:'Mixed',timed:true,expired:false,attempts:ids.map(id=>({questionId:id,selected:BY_ID[id].answer,seconds:30,correct:false,cause:'Not sure yet'}))});
  assert(completed.attempts.every(a=>a.correct));simulated.push(completed);
  if(i>=4)assert.equal(new Set(ids.map(id=>BY_ID[id].answer)).size,4,'new mixed sets must vary correct-answer letters');
}
assert.equal(visited.size,208);
const originalIds=['v','p','i','e','b','f','t','s'].flatMap(prefix=>[1,2,3,4].map(n=>`${prefix}${n}`));
for(const id of originalIds)assert(BY_ID[id],`legacy question missing: ${id}`);
const textSeen=new Set();
for(const q of QUESTIONS){
  assert(q.options.every(o=>o.trim().length>0));assert.equal(new Set(q.options).size,4);
  assert(q.passage.length>=(SKILLS[q.skill].section==='Math'?20:35)&&q.prompt.length>=20);
  const normalized=q.passage.toLowerCase().replace(/[^a-z0-9]/g,'');assert(!textSeen.has(normalized),`duplicate passage: ${q.id}`);textSeen.add(normalized);
  if(q.id.startsWith('extra-')&&['vocabulary','boundaries','form','transitions'].includes(q.skill))assert.equal(q.passage.split('_____').length-1,1,`invalid blank count: ${q.id}`);
}
for(const skill of Object.keys(SKILLS)){
  const drill=chooseQuestions('Drill',simulated,skill);
  assert.equal(drill.length,3);assert(drill.every(id=>BY_ID[id].skill===skill));
}
console.log('PASS: 300-question integrity; timing and expiration; balanced sets; fresh targeted follow-ups; answer-key grading; weakness ranking; invalid inputs; 26 mixed sets without repeats; legacy IDs; no duplicate passages or choices; balanced answer letters.');

assert.equal(budget(8,'Math'),764);
let mathHistory=[];const mathVisited=new Set();
for(let i=0;i<8;i++){const ids=chooseQuestions('Math',mathHistory);assert.equal(ids.length,8);assert.equal(new Set(ids.map(id=>BY_ID[id].skill)).size,8);for(const id of ids){assert(SKILLS[BY_ID[id].skill].section==='Math');assert(!mathVisited.has(id));mathVisited.add(id);}mathHistory.push(validateSession({id:`math-coverage-${i}`,mode:'Math',timed:true,expired:false,attempts:ids.map(id=>({questionId:id,selected:BY_ID[id].answer,seconds:50,cause:'Not sure yet'}))}));}assert.equal(mathVisited.size,64);

const focus='mathLinear', focusIds=QUESTIONS.filter(q=>q.skill===focus).map(q=>q.id);
const goalSession=(ids,correct,time)=>({id:'goal-'+time,mode:'Drill',createdAt:time,timed:false,expired:false,attempts:ids.map(questionId=>({questionId,selected:correct?BY_ID[questionId].answer:null,correct,seconds:10,cause:'Not sure yet'}))});
const goal={...DEFAULT_GOALS,accuracyTarget:80,minimumQuestions:4};
const h=[goalSession(focusIds.slice(0,4),false,1),goalSession(focusIds.slice(0,4),true,2)];
assert.equal(freshGoal(h,focus,goal).correct,0,'repeating viewed answers cannot inflate the goal');
h.push(goalSession(focusIds.slice(4),true,3));assert.equal(freshGoal(h,focus,goal).met,true);
assert.equal(freshGoal([],focus,goal).met,false);assert.equal(freshGoal([goalSession(focusIds.slice(0,3),true,1)],focus,goal).met,false);
assert.deepEqual(validateGoalPatch({rwFocus:'vocabulary',mathFocus:focus,dailyMinutes:45}),{rwFocus:'vocabulary',mathFocus:focus,dailyMinutes:45});
for(const bad of [{accuracyTarget:1600},{minimumQuestions:100},{mathFocus:'vocabulary'},{rwFocus:focus},{completedTasks:['fake']},{userId:'other'},{}])assert.throws(()=>validateGoalPatch(bad));
assert.equal(pacificDate(Date.parse('2026-09-30T02:00:00Z')),'2026-09-29');
assert.equal(dailyPlan('2026-09-30',180).tasks[0].key,'official');assert(dailyPlan('2026-10-02',180).tasks.reduce((n,t)=>n+t.minutes,0)<=40);
const dayHistory=[{...goalSession(focusIds.slice(0,3),true,1),createdAt:Date.parse('2026-09-30T12:00:00-07:00')}];
assert.equal(taskCompleted(dayHistory,'2026-09-30',{auto:'rwDrill'}),false,'Math practice cannot satisfy a R&W objective');
assert.equal(taskCompleted(dayHistory,'2026-09-30',{auto:'mathDrill'}),true);
assert.equal(taskCompleted(dayHistory,'2026-09-29',{auto:'mathDrill'}),false);
console.log('PASS: 64 Math questions without premature repeats; Math timing; first-attempt goal scoring; goal validation; Pacific study dates; section-specific task completion; light final-day plan.');

assert.equal(taskCompleted([{...dayHistory[0],attempts:dayHistory[0].attempts.map(a=>({...a,selected:null}))}],'2026-09-30',{auto:'mathDrill'}),false,'unanswered questions cannot complete a daily objective');
