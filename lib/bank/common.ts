import type { Question, Skill } from '../questions';
// Correct choice is authored first; deterministic rotation distributes answer letters.
export type Row = [string,string,string,string,string,string,string,string,string,string,('Medium'|'Hard')?];
export const WORD='Which choice completes the text with the most logical and precise word or phrase?';
export const GRAMMAR='Which choice completes the text so that it conforms to the conventions of Standard English?';
export const TRANSITION='Which choice completes the text with the most logical transition?';
export function make(skill:Skill,rows:Row[],startIndex=0):Question[]{return rows.map((r,rowIndex)=>{const index=rowIndex+startIndex;
  const order=[0,1,2,3];const offsets:Record<Skill,number>={vocabulary:0,purpose:1,inference:2,evidence:3,boundaries:1,form:2,transitions:3,synthesis:0,mathLinear:0,mathSystems:1,mathQuadratics:2,mathFunctions:3,mathRatios:1,mathData:2,mathGeometry:3,mathTrig:0};const position=(index+offsets[skill])%4;[order[0],order[position]]=[order[position],order[0]];
  return {id:`extra-${skill}-${String(index+1).padStart(2,'0')}`,skill,passage:r[0],prompt:r[1],options:order.map(i=>[r[2],r[3],r[4],r[5]][i]),answer:position,explanations:order.map(i=>[r[6],r[7],r[8],r[9]][i]),difficulty:r[10]??'Hard'};
});}
