import { strict as assert } from 'node:assert';
import { BY_ID } from '../.test-build/practice-bundle.mjs';
// Independently solve the numerical items and check the selected answer text.
const expected={
 mathLinear:['33/4','x < −2',String(4-12),String(185-3*(365-185)/4),String(5*(11-2)/3-11),String(Math.floor((2400-1000)/35)),'a = 3, b = 8',String(7-2)],
 mathSystems:[String(5+3),'4',String((1140-80*12)/(18-12)),'1','−6',String((3.2-10*.2)/.3).replace('4.000000000000001','4'),'7','3'],
 mathQuadratics:[String(31-25),String(64/4),String(5-3),String(4*9),String(-16*4+64*2+5),'10',String(2*(1+2)*(1-6)),'x + 3'],
 mathFunctions:['4x + 2','8%','3',String(Math.log2(32)-1),String(45*3**2),'9',String(3*(2**2+1)-2),String(3*Math.log2(80/10))],
 mathRatios:[String(96/(1.25*.8)),String(420/(150/5)),String(96*3/8),String((80-68)/80*100)+'%',String(18*25*.6),String(56000/1.12).replace('49999.99999999999','50000'),String(7*4**2),String(1/(1/6+1/3))],
 mathData:[String(6*16-5*14),'5/8','Its mean increases by 5, and its standard deviation stays the same.','All students enrolled at that school','Evaluating whether the program caused the difference in scores','59%','8','2/15'],
 mathGeometry:[String(Math.sqrt(49)),String(Math.sqrt(4**2+3**2)),String(3**2*8)+'π',String(40*(3/2)**3),String(2*12*60/360)+'π',String(2*Math.sqrt(81))+'π',String(Math.hypot(8,6)/2),String(7*10)],
 mathTrig:['3/5','7/25',String(18/2),String(10*9/6),'12/13',String(47+68)+' degrees',String(5*180/6)+' degrees','16√3']
};
for(const [skill,answers] of Object.entries(expected))answers.forEach((answer,i)=>{const q=BY_ID[`extra-${skill}-${String(i+1).padStart(2,'0')}`];assert.equal(q.options[q.answer].replaceAll('−','-').replaceAll(',',''),answer.replaceAll('−','-').replaceAll(',',''),q.id);});
// Substitute key algebraic candidates into their original equations.
assert.equal(3*(2*8.25-5)-4,2*(8.25+7));
assert.equal(Math.sqrt(3+6),3);assert.notEqual(Math.sqrt(-2+6),-2);
assert.equal(2*5+3*3,19);assert.equal(5-3,2);
assert.equal(.5*4+.2*6,3.2);assert(Math.abs(1.12*50000-56000)<1e-8);
console.log('PASS: independently calculated answers for all 64 Math items; substitution checks for equations, systems, mixture, and extraneous roots.');

const extension={
 mathLinear:['68/7',String(6-(-11)),'2 < x ≤ 6','5','4',String((180-120)/(11-7)),String(21-5),'−22'],
 mathSystems:['3','3',String(3*8),'2.00','5x − 2y = −13','6'],
 mathQuadratics:[String(5-2),String(8/4),String(10-10),'−3','3',String(3*9+5),String(6*(-2)),'−3'],
 mathFunctions:['9/4',String(4*Math.log2(4000/500)),String(16**1.5),'1 + √10','x² + 4x − 1',String((1-Math.sqrt(128/200))*100).replace('19.999999999999996','20')+'%']
};
for(const [skill,answers] of Object.entries(extension))answers.forEach((answer,i)=>{const q=BY_ID[`extra-${skill}-${String(i+9).padStart(2,'0')}`];assert.equal(q.options[q.answer].replaceAll('−','-'),answer.replaceAll('−','-'),q.id);});
assert.equal(2*1+5*3,17);assert.equal(4*1-3*3,-5);
assert(Math.abs(3*1.2+2*2-7.6)<1e-10);assert(Math.abs(2*1.2+5*2-12.4)<1e-10);
const root=1+Math.sqrt(10);assert(Math.abs(Math.sqrt(2*root+9)-root)<1e-10);
console.log('PASS: all 28 new Math answers independently checked, with substitution for systems, prices, and radicals.');
