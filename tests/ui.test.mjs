import {strict as assert} from 'node:assert';
import {Window} from 'happy-dom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';

const window=new Window({url:'http://localhost/sat-sprint/'});
for(const key of ['window','document','navigator','HTMLElement','HTMLInputElement','HTMLButtonElement','HTMLFormElement','HTMLLabelElement','HTMLSelectElement','HTMLTextAreaElement','HTMLOptionElement','SVGElement','DOMRect','NodeFilter','Element','Node','Document','DocumentFragment','MutationObserver','ResizeObserver','CustomEvent','Event','KeyboardEvent','MouseEvent','PointerEvent','getComputedStyle','sessionStorage','localStorage','requestAnimationFrame','cancelAnimationFrame']){
  if(window[key])Object.defineProperty(globalThis,key,{value:typeof window[key]==='function'&&['getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].includes(key)?window[key].bind(window):window[key],configurable:true,writable:true});
}
globalThis.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=()=>{};
let networkCalls=0;globalThis.fetch=async()=>{networkCalls++;throw Error('This static app must not request a server API.');};
const tools=new Map();document.modelContext={registerTool:(tool,{signal})=>{tools.set(tool.name,tool);signal.addEventListener('abort',()=>tools.delete(tool.name));}};
const {default:Dashboard}=await import('../.test-build/ui-bundle.mjs');
const element=document.createElement('div');document.body.append(element);let root=createRoot(element);
const flush=()=>act(async()=>{await new Promise(r=>setTimeout(r,25));});
const click=async(control)=>{assert(control,'control must exist');await act(async()=>{control.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}));control.click();});await flush();};
const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
const render=async()=>{await act(async()=>root.render(React.createElement(Dashboard)));await flush();};
const remount=async()=>{await act(async()=>root.unmount());root=createRoot(element);await render();};
const key='sat-sprint-pages-active-v1';const historyKey='sat-sprint-pages-progress-v1';
try{
  await render();assert(button('Start timed set'));assert(!button('Start timed set').disabled);assert.equal(tools.size,5);
  // A selected-size Math set uses Math timing and survives reload.
  await click(document.querySelector('[role=radio][value="Math"]'));
  await act(async()=>document.getElementById('question-count').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));await flush();
  await click([...document.querySelectorAll('[role=option]')].find(o=>o.textContent.includes('4 questions')));
  await click(button('Start timed set'));
  assert(element.textContent.includes('Question 1 / 4'));assert(element.textContent.includes('6:22')||element.textContent.includes('6:21'));
  await click(document.querySelector('[role=radio][value="0"]'));await click(button('Next question'));await click(button('Previous'));
  assert.equal(document.querySelectorAll('.answer-choice.selected').length,1);
  await remount();assert.equal(document.querySelectorAll('.answer-choice.selected').length,1);
  await click(button('Finish set (3 unanswered)'));assert(element.textContent.includes('Progress saved on this device'));
  assert.equal(JSON.parse(localStorage.getItem(historyKey))[0].attempts.length,4);
  await act(async()=>document.querySelector('.cause-select').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));await flush();
  await click([...document.querySelectorAll('[role=option]')].find(o=>o.textContent.includes('Misread the question')));
  assert(JSON.parse(localStorage.getItem(historyKey))[0].attempts.some(a=>a.cause==='Misread the question'));
  // Categorization and fresh follow-ups remain available after a reload.
  await click(button('Practice 3 follow-ups'));assert(element.textContent.includes('TARGETED DRILL'));assert(element.textContent.includes('Untimed'));
  await click(document.querySelector('[role=radio][value="0"]'));await click(button('Check answer'));
  assert(document.querySelector('.answer-explanations'));assert(document.querySelector('[role=radio][value="0"]').disabled);
  await click(button('Finish set (2 unanswered)'));await click(button('Close'));await remount();
  assert(element.textContent.includes('2 sets'));
  // Goals can be edited and survive a roadmap remount without an API call.
  await click(button('Roadmap & goals'));assert(element.textContent.includes('Set your objectives'));assert(element.textContent.includes('Saved on this device'));
  const target=document.getElementById('goal-dailyMinutes');
  await act(async()=>target.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})));await flush();
  const option=[...document.querySelectorAll('[role=option]')].find(o=>o.textContent.includes('45 minutes'));
  await click(option);assert.equal(JSON.parse(localStorage.getItem('sat-sprint-pages-goals-v1')).dailyMinutes,45);
  await click(button('Practice'));await click(button('Roadmap & goals'));
  assert(document.getElementById('goal-dailyMinutes').textContent.includes('45 minutes'));
  // Full tests lock modules, preserve the break after reload, and auto-grade.
  await click(button('Full tests'));assert(element.textContent.includes('Practice Test 1'));assert(element.textContent.includes('Practice Test 2'));
  await click(button('Start practice test 1'));assert(element.textContent.includes('Question 1 / 27'));
  await click(button('Submit module (27 unanswered)'));assert(element.textContent.includes('MODULE SUBMITTED'));assert(!element.querySelector('.answer-explanations'));
  await click(button('Start next module'));await click(button('Submit module (27 unanswered)'));
  assert(element.textContent.includes('10-MINUTE SECTION BREAK'));assert(button('Math unlocks after the break').disabled);
  const breakDeadline=JSON.parse(sessionStorage.getItem(key)).deadline;
  await remount();assert(element.textContent.includes('10-MINUTE SECTION BREAK'));
  const realNow=Date.now;Date.now=()=>breakDeadline+1000;
  try{await act(async()=>{await new Promise(r=>setTimeout(r,600));});await flush();}finally{Date.now=realNow;}
  assert(button('Start next module'));await click(button('Start next module'));assert(element.textContent.includes('Question 1 / 22'));
  await click(button('Submit module (22 unanswered)'));await click(button('Start next module'));await click(button('Finish & grade test (22 unanswered)'));
  assert(element.textContent.includes('0 / 98'));assert(element.textContent.includes('Progress saved on this device'));
  const full=JSON.parse(localStorage.getItem(historyKey)).find(s=>s.fullTestId);assert.equal(full.attempts.length,98);assert(full.attempts.every(a=>!a.correct&&a.selected===null));
  await remount();assert(element.textContent.includes('3 sets'));assert.equal(networkCalls,0);
  console.log('PASS: static UI selection, Math timing, navigation, reload recovery, local saving, immediate explanations, targeted drills, editable persistent goals, full-test module locks, break recovery, 98-answer grading, and zero server API requests (simulated DOM).');
}finally{
  await act(async()=>root.unmount());await window.happyDOM.abort();
}
