/* MyRoutine Analytics Studio — transparent local insights, not inferred study time. */
(function(){
"use strict";
if(window.__myRoutineAnalyticsStudio)return;window.__myRoutineAnalyticsStudio=true;
const TASK_KEY="myroutine_task_desk_v1",FOCUS_KEY="myroutine_focus_sessions_v1",HISTORY_KEY="myroutine_activity_history_v1",DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const $=(s,r)=>(r||document).querySelector(s),esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(v)?v:[];}catch(_){return [];}};
const dayKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const fmt=n=>{n=Math.max(0,Math.round(n));return Math.floor(n/60)+"h "+String(n%60).padStart(2,"0")+"m";};
const routine=()=>window.MyRoutine&&window.MyRoutine.getActiveRoutine?window.MyRoutine.getActiveRoutine():null;
function mount(){
if(!document.body||$("#mr-analytics-launch"))return;
const style=document.createElement("style");style.textContent=`
#mr-analytics-launch{position:fixed;left:18px;bottom:78px;z-index:9993;border:1px solid #ffffff24;border-radius:999px;padding:12px 16px;background:linear-gradient(135deg,#f4c98b,#d89c65);color:#26180d;font:800 13px system-ui;box-shadow:0 12px 34px #0006;cursor:pointer}
#mr-analytics-overlay{position:fixed;inset:0;z-index:100006;display:grid;place-items:center;padding:14px;background:#020710e5;backdrop-filter:blur(16px)}#mr-analytics-overlay[hidden]{display:none}
.mr-analytics-card{width:min(100%,980px);max-height:92vh;overflow:auto;border:1px solid #ffffff20;border-radius:24px;background:#0d192b;color:#edf3ff;box-shadow:0 32px 100px #000b}
.mr-analytics-head{position:sticky;top:0;z-index:4;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:20px 22px;background:#0d192bf5;border-bottom:1px solid #ffffff15}
.mr-analytics-head h2{margin:5px 0;font:780 23px system-ui;letter-spacing:-.04em}.mr-analytics-head p{margin:0;color:#9eacc4;font:12px system-ui}.mr-analytics-kicker{color:#f1c58c;font:800 10px system-ui;letter-spacing:.16em}
.mr-analytics-close{border:1px solid #ffffff22;border-radius:10px;background:#ffffff08;color:#fff;font-size:21px;padding:3px 10px;cursor:pointer}
.mr-analytics-body{padding:18px 22px 24px}.mr-analytics-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:13px}
.mr-analytics-tabs{display:flex;gap:6px}.mr-analytics-tabs button,.mr-analytics-refresh{border:1px solid #ffffff20;border-radius:10px;background:#ffffff08;color:#dce5ff;padding:9px 12px;font:700 11px system-ui;cursor:pointer}
.mr-analytics-tabs button[aria-pressed=true]{background:#f1c58c;color:#21170f;border-color:transparent}
.mr-analytics-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.mr-analytics-stat,.mr-analytics-panel{border:1px solid #ffffff16;border-radius:15px;background:#ffffff07;padding:14px;min-width:0}
.mr-analytics-stat strong{display:block;font:800 23px system-ui;font-variant-numeric:tabular-nums}.mr-analytics-stat span{display:block;margin-top:4px;color:#9eacc4;font:11px system-ui}
.mr-analytics-panels{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:11px}.mr-analytics-panel h3{margin:0 0 13px;font:750 14px system-ui}.mr-analytics-muted{color:#9eacc4;font:11px/1.5 system-ui}
.mr-analytics-bars{display:grid;gap:10px}.mr-analytics-barrow{display:grid;grid-template-columns:minmax(70px,100px) minmax(40px,1fr) auto;gap:9px;align-items:center}
.mr-analytics-barlabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c8d4e9;font:11px system-ui}.mr-analytics-track{height:9px;border-radius:99px;background:#ffffff0c;overflow:hidden}.mr-analytics-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#8e9cff,#6bd4c0);min-width:0}
.mr-analytics-value{color:#aab8d0;font:10px system-ui;font-variant-numeric:tabular-nums}.mr-analytics-trend{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:end;height:160px;padding-top:8px}
.mr-analytics-day{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;height:100%;min-width:0}.mr-analytics-daybar{width:min(100%,26px);min-height:3px;border-radius:7px 7px 3px 3px;background:linear-gradient(180deg,#a5b2ff,#6bd4c0)}.mr-analytics-day small{color:#9eacc4;font:10px system-ui}.mr-analytics-day b{color:#cbd6ea;font:9px system-ui}
.mr-analytics-note{margin-top:11px;padding:11px 12px;border:1px dashed #ffffff20;border-radius:12px;color:#9eacc4;font:11px/1.5 system-ui}.mr-analytics-empty{padding:18px;border:1px dashed #ffffff20;border-radius:12px;color:#9eacc4;font:12px/1.5 system-ui}
@media(max-width:650px){#mr-analytics-launch{left:12px;bottom:72px;padding:11px 13px}.mr-analytics-card{border-radius:18px}.mr-analytics-head,.mr-analytics-body{padding-left:14px;padding-right:14px}.mr-analytics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mr-analytics-panels{grid-template-columns:1fr}.mr-analytics-stat strong{font-size:21px}.mr-analytics-barrow{grid-template-columns:75px minmax(30px,1fr) auto}}
`;document.head.appendChild(style);
const launch=document.createElement("button");launch.id="mr-analytics-launch";launch.type="button";launch.textContent="▥ Analytics";launch.setAttribute("aria-haspopup","dialog");
const overlay=document.createElement("div");overlay.id="mr-analytics-overlay";overlay.hidden=true;overlay.innerHTML='<section class="mr-analytics-card" role="dialog" aria-modal="true" aria-labelledby="mr-analytics-title"><header class="mr-analytics-head"><div><div class="mr-analytics-kicker">MYROUTINE / INSIGHTS</div><h2 id="mr-analytics-title">Analytics Studio</h2><p id="mr-analytics-subtitle">A clear view of your recent activity</p></div><button class="mr-analytics-close" type="button" aria-label="Close">×</button></header><div class="mr-analytics-body" id="mr-analytics-content"></div></section>';document.body.append(launch,overlay);
let range=7;
function render(){
const now=new Date(),start=new Date(now);start.setHours(0,0,0,0);start.setDate(start.getDate()-range+1);
const sessions=read(FOCUS_KEY).filter(x=>Number.isFinite(Number(x.at))&&Number.isFinite(Number(x.seconds))&&Number(x.seconds)>0);
const tasks=read(TASK_KEY),active=tasks.filter(x=>!x.done),completed=tasks.filter(x=>x.done),history=read(HISTORY_KEY),taskEvents=history.filter(x=>x&&x.type==="task_completed"&&Number.isFinite(Number(x.at))&&Number(x.at)>=start.getTime()),taskByDay={},focusByDay={},focusBySubject={};
for(let i=0;i<range;i++){const d=new Date(start);d.setDate(start.getDate()+i);focusByDay[dayKey(d)]=0;taskByDay[dayKey(d)]=0;}
taskEvents.forEach(x=>{const k=dayKey(new Date(Number(x.at)));if(Object.prototype.hasOwnProperty.call(taskByDay,k))taskByDay[k]++;});
sessions.forEach(x=>{const k=dayKey(new Date(Number(x.at)));if(Object.prototype.hasOwnProperty.call(focusByDay,k))focusByDay[k]+=Number(x.seconds)/60;const label=String(x.subjectName||"General focus");focusBySubject[label]=(focusBySubject[label]||0)+Number(x.seconds)/60;});
const totalFocus=Object.values(focusByDay).reduce((a,b)=>a+b,0),daysWithFocus=Object.values(focusByDay).filter(x=>x>0).length,avg=daysWithFocus?totalFocus/daysWithFocus:0;
const r=routine(),subjects={};let weeklyPeriods=0,weeklyMinutes=0;
if(r){const subjectList=Array.isArray(r.subjects)?r.subjects:[],periods=Array.isArray(r.periods)?r.periods:[];
subjectList.forEach(s=>subjects[String(s.id)]={name:s.name||"Unnamed subject",count:0,minutes:0});
DAYS.forEach(day=>{const entries=r.schedule&&(r.schedule[day]||r.schedule[day.toLowerCase()]);if(!Array.isArray(entries))return;entries.forEach(e=>{if(!e.subjectId||!subjects[String(e.subjectId)])return;const p=periods.find(q=>String(q.id)===String(e.periodId));if(!p)return;const parse=v=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(v||""));return m&&+m[1]<24&&+m[2]<60?+m[1]*60+ +m[2]:null;};const a=parse(p.startTime||p.start),b=parse(p.endTime||p.end),dur=a!=null&&b!=null&&b>a?b-a:0;subjects[String(e.subjectId)].count++;subjects[String(e.subjectId)].minutes+=dur;weeklyPeriods++;weeklyMinutes+=dur;});});}
const ordered=Object.values(subjects).sort((a,b)=>b.minutes-a.minutes),maxSubject=Math.max(1,...ordered.map(x=>x.minutes));
const overdue=active.filter(x=>x.due&&x.due<dayKey(now)).length,taskRate=tasks.length?Math.round(completed.length/tasks.length*100):0;
$("#mr-analytics-subtitle",overlay).textContent="Last "+range+" days · data stored in this browser";
const cards=[[fmt(totalFocus),"Recorded focus time"],[daysWithFocus+" / "+range,"Days with focus sessions"],[taskEvents.length,"Tasks completed in period"],[taskRate+"%","Current task completion"]];
let html='<div class="mr-analytics-toolbar"><div class="mr-analytics-tabs" role="group" aria-label="Analytics date range"><button type="button" data-range="7" aria-pressed="'+(range===7)+'">7 days</button><button type="button" data-range="30" aria-pressed="'+(range===30)+'">30 days</button></div><button class="mr-analytics-refresh" type="button" data-refresh>Refresh data</button></div><div class="mr-analytics-grid">'+cards.map(c=>'<div class="mr-analytics-stat"><strong>'+esc(c[0])+'</strong><span>'+esc(c[1])+'</span></div>').join("")+'</div><div class="mr-analytics-panels"><section class="mr-analytics-panel"><h3>Focus activity · daily</h3>';
const rawVals=Object.entries(focusByDay),vals=range===30?Array.from({length:5},(_,i)=>{const part=rawVals.slice(i*6,(i+1)*6);return ["W"+(i+1),part.reduce((n,x)=>n+x[1],0)];}):rawVals,maxFocus=Math.max(1,...vals.map(x=>x[1]));
if(totalFocus<=0)html+='<div class="mr-analytics-empty">No completed focus sessions in this period yet. Completed sessions from the Focus Timer will appear here.</div>';
else html+='<div class="mr-analytics-trend">'+vals.map(([k,v])=>{const d=new Date(k+"T12:00:00");return '<div class="mr-analytics-day"><b>'+Math.round(v)+'m</b><div class="mr-analytics-daybar" style="height:'+Math.max(3,v/maxFocus*100)+'%"></div><small>'+(range===30?k:d.toLocaleDateString(undefined,{weekday:"short"}).slice(0,2))+'</small></div>';}).join("")+'</div><p class="mr-analytics-muted">Average on active days: '+fmt(avg)+'</p>';
html+='</section><section class="mr-analytics-panel"><h3>Subject distribution · weekly plan</h3>';
if(!r||!ordered.length)html+='<div class="mr-analytics-empty">Open a routine with subjects and periods to see its planned weekly distribution.</div>';
else if(!weeklyMinutes)html+='<div class="mr-analytics-empty">No timed subject periods were found in the active weekly routine.</div>';
else html+='<div class="mr-analytics-bars">'+ordered.filter(x=>x.minutes>0).map(x=>'<div class="mr-analytics-barrow"><span class="mr-analytics-barlabel" title="'+esc(x.name)+'">'+esc(x.name)+'</span><div class="mr-analytics-track"><div class="mr-analytics-fill" style="width:'+(x.minutes/maxSubject*100)+'%"></div></div><span class="mr-analytics-value">'+fmt(x.minutes)+'</span></div>').join("")+'</div><p class="mr-analytics-muted">'+weeklyPeriods+' assigned periods · '+fmt(weeklyMinutes)+' scheduled per week</p>';
html+='</section><section class="mr-analytics-panel"><h3>Task completions · history</h3>';
const taskVals=Object.entries(taskByDay),maxTasks=Math.max(1,...taskVals.map(x=>x[1]));
if(!taskEvents.length)html+='<div class="mr-analytics-empty">No task completion events recorded in this period yet. New check-offs will appear here.</div>';
else html+='<div class="mr-analytics-trend">'+(range===30?Array.from({length:5},(_,i)=>{const part=taskVals.slice(i*6,(i+1)*6);return ["W"+(i+1),part.reduce((n,x)=>n+x[1],0)];}):taskVals).map(([k,v])=>'<div class="mr-analytics-day"><b>'+v+'</b><div class="mr-analytics-daybar" style="height:'+Math.max(3,v/maxTasks*100)+'%"></div><small>'+esc(k.slice(5))+'</small></div>').join("")+'</div>';
html+='</section><section class="mr-analytics-panel"><h3>Actual focus by subject</h3>';
const subjectRows=Object.entries(focusBySubject).sort((x,y)=>y[1]-x[1]),maxSubjectFocus=Math.max(1,...subjectRows.map(x=>x[1]));
if(!subjectRows.length)html+='<div class="mr-analytics-empty">Choose a subject in the Focus Timer. Future completed sessions will be attributed here. Older sessions remain included as General focus.</div>';
else html+='<div class="mr-analytics-bars">'+subjectRows.map(x=>'<div class="mr-analytics-barrow"><span class="mr-analytics-barlabel">'+esc(x[0])+'</span><div class="mr-analytics-track"><div class="mr-analytics-fill" style="width:'+(x[1]/maxSubjectFocus*100)+'%"></div></div><span class="mr-analytics-value">'+fmt(x[1])+'</span></div>').join("")+'</div>';
html+='</section><section class="mr-analytics-panel"><h3>Current task snapshot</h3><p class="mr-analytics-muted">Active: '+active.length+'<br>Completed one-time tasks: '+completed.length+'<br>Overdue: '+overdue+'<br>Completion rate: '+taskRate+'%</p></section></div>';
<div class="mr-analytics-note">Historical task counts begin when this update is installed; earlier completions cannot be reconstructed. Focus by subject is recorded for new sessions when you select a subject. Subject timetable bars represent planned time, not actual study time.</div>';
$("#mr-analytics-content",overlay).innerHTML=html;
}
function close(){overlay.hidden=true;launch.focus();}
launch.addEventListener("click",()=>{render();overlay.hidden=false;$(".mr-analytics-close",overlay).focus();});
overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest(".mr-analytics-close")){close();return;}const b=e.target.closest("[data-range],[data-refresh]");if(!b)return;if(b.dataset.range)range=Number(b.dataset.range);render();});
window.addEventListener("keydown",e=>{if(!overlay.hidden&&e.key==="Escape")close();});
["myroutine:ready","myroutine:changed","myroutine:updated","myroutine:saved"].forEach(n=>document.addEventListener(n,()=>{if(!overlay.hidden)render();}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();