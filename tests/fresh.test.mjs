import { strict as assert } from 'node:assert';
import { QUESTIONS,BY_ID,SKILLS,chooseQuestions,validateSession } from '../.test-build/practice-bundle.mjs';
const fresh=QUESTIONS.filter(q=>q.id.startsWith('fresh-'));assert.equal(fresh.length,48);
for(const skill of Object.keys(SKILLS))assert.equal(fresh.filter(q=>q.skill===skill).length,3);
const expected={mathLinear:[String((60-5*8)/4),'3','F(t) = (27/5)t + 14'],mathSystems:[String(5*14-13),String(4-14),String(170+(10-3)*(330-170)/(7-3))],mathQuadratics:[String((8/4)*9-8),String((8-2)/2+((8+2)/2)**2),'4'],mathFunctions:['√14','4x² − 2x',String((1-.8**3)*100)],mathRatios:['A 4.8% decrease','40/3',String(40/(2.5**2))],mathData:[String((12*80+18*90)/30),String(3*5),'8/15'],mathGeometry:['(x − 4)² + (y + 5)² = 36','12√6π',String(8*Math.sqrt(100-64))],mathTrig:['3/4','60/13','27 + 9√3']};
for(const [skill,answers] of Object.entries(expected))answers.forEach((answer,i)=>{const q=BY_ID[`fresh-${skill}-${i+1}`];let actual=q.options[q.answer].replaceAll('−','-').replaceAll('$','');if(q.id==='fresh-mathFunctions-3')actual=actual.replace('%','');if(Number.isFinite(Number(answer)))assert(Math.abs(Number(actual)-Number(answer))<1e-9,q.id);else assert.equal(actual,answer.replaceAll('−','-'),q.id);});
assert.equal(3*14+2*13,68);assert.equal(2*14+5*13,93);
const x=Math.sqrt(14);assert(Math.abs(Math.sqrt(2*x+15)-(x+1))<1e-10);assert(-x+1<0);
assert.equal([...Array(8)].map((_,i)=>i-3).filter(x=>(x*x-4)*(x-3)>0).length,4);
assert(Math.abs((.3*20+.6*(40/3))/(20+40/3)-.42)<1e-10);
assert(Math.abs((6/10*4/9+4/10*6/9)-8/15)<1e-10);
// Reach every new item through regular practice, without altering the two fixed tests.
for(const mode of ['Mixed','Math']){
 let history=[];const seen=new Set();const standard=QUESTIONS.filter(q=>q.difficulty!=='Challenge'&&(SKILLS[q.skill].section==='Math')===(mode==='Math'));
 while(seen.size<standard.length){const ids=chooseQuestions(mode,history,undefined,[],4);for(const id of ids)seen.add(id);history.push(validateSession({id:`fresh-coverage-${history.length}`,mode,timed:true,expired:false,attempts:ids.map(questionId=>({questionId,selected:BY_ID[questionId].answer,seconds:50,cause:'Not sure yet'}))}));assert(history.length<=100,'selection must reach all questions');}
 assert(fresh.filter(q=>(SKILLS[q.skill].section==='Math')===(mode==='Math')).every(q=>seen.has(q.id)));
}
console.log('PASS: 48 additional questions, three per skill; all 24 new Math keys independently calculated; substitution, inequalities, mixture, probability checks; entire enlarged standard bank reachable through timed practice.');
