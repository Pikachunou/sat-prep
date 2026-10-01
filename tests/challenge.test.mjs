import { strict as assert } from 'node:assert';
import { QUESTIONS,BY_ID,SKILLS,chooseQuestions,setLengths,validateSession,masteryReport,DOMAIN_WEIGHTS } from '../.test-build/practice-bundle.mjs';
const bank=QUESTIONS.filter(q=>q.difficulty==='Challenge');assert.equal(bank.length,32);
for(const skill of Object.keys(SKILLS))assert.equal(bank.filter(q=>q.skill===skill).length,2);
function session(ids,timed=true,time=1,right=true){return {id:`challenge-session-${time}`,createdAt:time,mode:'Mixed',timed,expired:false,attempts:ids.map(id=>({questionId:id,selected:right?BY_ID[id].answer:null,correct:!right,seconds:60,cause:'Not sure yet'}))};}
for(const mode of ['Mixed','Reading','Writing','Math']){
 const counts=setLengths(mode,'Challenge');assert(counts.length);let h=[];const seen=new Set();
 const pool=bank.filter(q=>mode==='Mixed'?SKILLS[q.skill].section!=='Math':SKILLS[q.skill].section===mode);
 for(let n=0;n<pool.length/4;n++){const ids=chooseQuestions(mode,h,undefined,[],4,'Challenge');assert.equal(ids.length,4);for(const id of ids){assert(!seen.has(id));assert.equal(BY_ID[id].difficulty,'Challenge');seen.add(id);}h.push(session(ids,true,n));}
 assert.equal(seen.size,pool.length);
 for(const count of counts)assert.equal(chooseQuestions(mode,[],undefined,[],count,'Challenge').length,count);
 assert.throws(()=>chooseQuestions(mode,[],undefined,[],27,'Challenge'));
 assert(chooseQuestions(mode,[]).every(id=>BY_ID[id].difficulty!=='Challenge'));
}
assert.throws(()=>chooseQuestions('Math',[],undefined,[],4,'Fake'));
assert(validateSession(session(bank.slice(0,8).map(q=>q.id))).attempts.every(a=>a.correct));
// Independent numerical solutions, rather than checking stored correctness flags.
const expected={mathLinear:[String(12/3-2*(12/3)),String(10*((13-7)/10)-3)],mathSystems:[String(6*6/9),String(2*(1+2*6/7)+3*6/7)],mathQuadratics:[String(((10+4)/2)*((10-4)/2)),String(Math.sqrt(4*2*18)/(2*2))],mathFunctions:[String(72/(243/72)**(2/3)),'g(x) = x + 1, x ≠ 5'],mathRatios:[String(.125*30/(.2-.125)),String(200*6*.75*.92)],mathData:['3/4',String(5*(6+2)-(2+4+6+8))],mathGeometry:['(x − 1)² + (y + 3)² = 36',String(40*(27/8)**(2/3))],mathTrig:['2√13',String(12*25/12)]};
for(const [skill,answers] of Object.entries(expected))answers.forEach((answer,i)=>{const q=BY_ID[`challenge-${skill}-${i+1}`];const actual=q.options[q.answer].replaceAll('−','-');if(Number.isFinite(Number(answer)))assert(Math.abs(Number(actual)-Number(answer))<1e-9,q.id);else assert.equal(actual,answer.replaceAll('−','-'),q.id);});
// Empty, repeated, exposed-in-drill, uncalibrated challenge and uneven samples cannot create a score.
assert.equal(masteryReport([]).combined,null);
assert.equal(masteryReport([session(bank.map(q=>q.id))]).combined,null);
const standard=QUESTIONS.filter(q=>q.difficulty!=='Challenge');
const keys=Object.keys(SKILLS);
const ids=n=>keys.flatMap(skill=>standard.filter(q=>q.skill===skill).slice(0,n).map(q=>q.id));
let report=masteryReport([session(ids(3))]);assert(report.reading.ready&&report.math.ready);assert.deepEqual(report.combined,[1440,1600]);assert.equal(report.skills.filter(s=>s.mastered).length,0);
report=masteryReport([session(ids(6))]);assert.equal(report.skills.filter(s=>s.mastered).length,16);assert.equal(report.math.center,800);
const repeated=Array.from({length:20},(_,i)=>session(ids(1),true,i));assert.equal(masteryReport(repeated).combined,null);assert.equal(masteryReport(repeated).skills[0].total,1);
report=masteryReport([session(ids(6),false,1),session(ids(6),true,2)]);assert.equal(report.freshCount,0);assert.equal(report.combined,null);
report=masteryReport([session(ids(6),true,1,false)]);assert.equal(report.skills.filter(s=>s.mastered).length,0);assert.deepEqual(report.combined,[400,560]);
const uneven=ids(3).filter(id=>BY_ID[id].skill!=='mathTrig');assert.equal(masteryReport([session(uneven)]).combined,null);
const weighted=session(ids(3));for(const a of weighted.attempts)if(BY_ID[a.questionId].skill==='mathLinear')a.selected=null;
report=masteryReport([weighted]);assert(Math.abs(report.math.weighted-(1-DOMAIN_WEIGHTS.Algebra/2))<1e-10);assert.equal(report.reading.center,800);
const latest=keys.flatMap(skill=>standard.filter(q=>q.skill===skill).slice(6,9).map(q=>q.id));report=masteryReport([session(ids(6),true,1),session(latest,true,2,false)]);assert(report.skills.every(s=>s.total===8&&!s.mastered));
assert.deepEqual(masteryReport([session(ids(6),true,2),session(ids(1),false,1)]).skills.map(s=>s.total),Array(16).fill(5),'chronological first exposure wins');
console.log('PASS: 32 stretch items across 16 skills; all new math keys independently solved; difficulty/count/coverage selection; answer-key grading; mastery gates, exposure, repeats, recent windows, weights and bounded estimates.');
