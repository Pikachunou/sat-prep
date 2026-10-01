import { BY_ID, SKILLS, type Skill } from './questions';
import type { Attempt, Session } from './practice';
export const DOMAIN_WEIGHTS:Record<string,number>={'Craft and Structure':.28,'Information and Ideas':.26,'Standard English Conventions':.26,'Expression of Ideas':.20,'Algebra':.35,'Advanced Math':.35,'Problem-Solving and Data Analysis':.15,'Geometry and Trigonometry':.15};
export function masteryReport(history:Session[]){
  const seen=new Set<string>();const fresh:Attempt[]=[];
  // Once a question has been seen in a completed drill or set, its later answers cannot prove fresh mastery.
  for(const s of [...history].sort((a,b)=>a.createdAt-b.createdAt||a.id.localeCompare(b.id)))for(const a of s.attempts){
    const q=BY_ID[a.questionId];if(!q||seen.has(q.id))continue;seen.add(q.id);
    if(s.timed)fresh.push({...a,correct:a.selected===q.answer});
  }
  const skills=(Object.keys(SKILLS) as Skill[]).map(skill=>{
    const all=fresh.filter(a=>BY_ID[a.questionId].skill===skill);
    const standard=all.filter(a=>BY_ID[a.questionId].difficulty!=='Challenge').slice(-8);
    const stretch=all.filter(a=>BY_ID[a.questionId].difficulty==='Challenge');
    const correct=standard.filter(a=>a.correct).length;
    const accuracy=standard.length?correct/standard.length:null;
    return {skill,total:standard.length,correct,accuracy,mastered:standard.length>=6&&accuracy!>=.9,stretchTotal:stretch.length,stretchCorrect:stretch.filter(a=>a.correct).length};
  });
  const section=(math:boolean)=>{
    const rows=skills.filter(s=>(SKILLS[s.skill].section==='Math')===math);
    const domains=[...new Set(rows.map(s=>SKILLS[s.skill].domain))];
    const total=rows.reduce((n,s)=>n+s.total,0);const ready=total>=24&&rows.every(s=>s.total>=3);
    // Equal weight within each domain avoids letting one repeatedly practiced skill dominate its domain.
    const weighted=ready?domains.reduce((sum,d)=>sum+DOMAIN_WEIGHTS[d]*rows.filter(s=>SKILLS[s.skill].domain===d).reduce((n,s)=>n+s.accuracy!,0)/rows.filter(s=>SKILLS[s.skill].domain===d).length,0):null;
    const center=weighted===null?null:Math.max(200,Math.min(800,Math.round((200+600*weighted)/10)*10));
    const range=center===null?null:[Math.max(200,center-80),Math.min(800,center+80)];
    return {name:math?'Math':'Reading & Writing',rows,total,ready,weighted,center,range,mastered:rows.filter(s=>s.mastered).length};
  };
  const reading=section(false),math=section(true);
  const combined=reading.range&&math.range?[reading.range[0]+math.range[0],reading.range[1]+math.range[1]]:null;
  return {skills,reading,math,combined,freshCount:fresh.length};
}
