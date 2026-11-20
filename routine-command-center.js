/* MyRoutine Command Center — one glance at today's routine, tasks and focus. */
(function(){
"use strict";
if(window.__myRoutineCommandCenter)return;window.__myRoutineCommandCenter=true;
const TASK_KEY="myroutine_task_desk_v1",FOCUS_KEY="myroutine_focus_sessions_v1",DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const $=(s,r)=>(r||document).querySelector(s),esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
function read(k){try{const x=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(x)?x:[];}catch(_){return [];}}
function active(){return window.MyRoutine&&window.MyRoutine.getActiveRoutine?window.MyRoutine.getActiveRoutine():null;}
function mins(n){n=Math.max(0,Math.round(n||0));return Math.floor(n/60)+"h "+String(n%60).padStart(2,"0")+"m";}
function mount(){
if(!document.body||$("#mr-command-launch"))return;
const style=document.createElement("style");style.textContent=`
#mr-command-launch{position:fixed;left:50%;transform:translateX(-50%);bottom:max(18px,env(safe-area-inset-bottom));z-index:9994;border:1px solid #ffffff25;border-radius:999px;padding:12px 18px;background:linear-gradient(135deg,#d3c2ff,#8b9cff);color:#11162b;font:800 13px system-ui;box-shadow:0 14px 36px #0007;cursor:pointer}
#mr-command-overlay{position:fixed;inset:0;z-index:100005;display:grid;place-items:center;padding:14px;background:#020710df;backdrop-filter:blur(16px)}#mr-command-overlay[hidden]{display:none}
.mr-command-card{width:min(100%,900px);max-height:91vh;overflow:auto;border:1px solid #ffffff20;border-radius:25px;background:#0e192b;color:#edf3ff;box-shadow:0 32px 100px #000a}
.mr-command-head{position:sticky;top:0;z-index:3;display:flex;justify-content:space-between;gap:12px;padding:20px 22px;background:#0e192bf5;border-bottom:1px solid #ffffff16}
.mr-command-head h2{margin:5px 0;font:780 23px system-ui;letter-spacing:-.04em}.mr-command-head p{margin:0;color:#9eacc4;font:12px system-ui}
.mr-command-body{padding:18px 22px 24px}.mr-command-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.mr-command-stat,.mr-command-panel{border:1px solid #ffffff16;border-radius:16px;background:#ffffff07;padding:14px}.mr-command-stat strong{display:block;font:800 24px system-ui}.mr-command-stat span{color:#9eacc4;font:11px system-ui}
.mr-command-columns{display:grid;grid-template-columns:1.25fr .75fr;gap:12px;margin-top:12px}.mr-command-panel h3{margin:0 0 12px;font:750 14px system-ui}
.mr-command-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid #ffffff10}.mr-command-row:first-of-type{border-top:0}
.mr-command-row strong{font:650 12px system-ui}.mr-command-row small{display:block;margin-top:3px;color:#9eacc4;font:11px system-ui}.mr-command-chip{flex:0 0 auto;padding:5px 8px;border-radius:99px;background:#ffffff0c;color:#b9c7e3;font:10px system-ui}
.mr-command-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.mr-command-actions button,.mr-command-close{border:1px solid #ffffff20;border-radius:11px;padding:10px 13px;background:#ffffff0b;color:#edf3ff;font:700 12px system-ui;cursor:pointer}
.mr-command-actions button.primary{background:#8799ff;color:#0b1327;border:0}.mr-command-empty{padding:15px;border:1px dashed #ffffff20;border-radius:12px;color:#9eacc4;font:12px/1.5 system-ui}.mr-command-alert{color:#ffbd8a}.mr-command-close{font-size:20px;padding:3px 10px}
@media(max-width:650px){#mr-command-launch{bottom:max(16px,env(safe-area-inset-bottom));padding:11px 15px}.mr-command-card{border-radius:19px}.mr-command-head,.mr-command-body{padding-left:14px;padding-right:14px}.mr-command-grid{grid-template-columns:repeat(2,1fr)}.mr-command-columns{grid-template-columns:1fr}.mr-command-stat strong{font-size:21px}}
`;document.head.appendChild(style);
const launch=document.createElement("button");launch.id="mr-command-launch";launch.type="button";launch.textContent="▦ Command center";launch.setAttribute("aria-haspopup","dialog");
const overlay=document.createElement("div");overlay.id="mr-command-overlay";overlay.hidden=true;overlay.innerHTML='<section class="mr-command-card" role="dialog" aria-modal="true" aria-labelledby="mr-command-title"><header class="mr-command-head"><div><div style="color:#aab8ff;font:800 10px system-ui;letter-spacing:.16em">MYROUTINE / OVERVIEW</div><h2 id="mr-command-title">Your day, in one place</h2><p id="mr-command-date"></p></div><button type="button" class="mr-command-close" aria-label="Close">×</button></header><div class="mr-command-body" id="mr-command-content"></div></section>';document.body.append(launch,overlay);
function render(){
const r=active(),tasks=read(TASK_KEY),focus=read(FOCUS_KEY),date=iso(),day=DAYS[new Date().getDay()],activeTasks=tasks.filter(x=>!x.done),due=activeTasks.filter(x=>x.due===date),late=activeTasks.filter(x=>x.due<date),done=tasks.filter(x=>x.done);
const sessions=focus.filter(x=>String(x.date||x.completedAt||x.timestamp||"").slice(0,10)===date),focused=sessions.reduce((n,x)=>n+(Number(x.minutes)||Number(x.duration)||0),0);
const entries=r&&r.schedule&&(Array.isArray(r.schedule[day])?r.schedule[day]:r.schedule[day.toLowerCase()])||[],periods=r&&Array.isArray(r.periods)?r.periods:[],schedule=entries.map(e=>({e,p:periods.find(x=>String(x.id)===String(e.periodId))})).filter(x=>x.p).sort((a,b)=>String(a.p.startTime||a.p.start||"").localeCompare(String(b.p.startTime||b.p.start||"")));
$("#mr-command-date",overlay).textContent=new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
const cards=[[r? schedule.filter(x=>x.e.subjectId).length:0,"Today's assigned slots"],[due.length,"Tasks due today"],[late.length,"Overdue tasks"],[mins(focused),"Focus recorded today"]];
let html='<div class="mr-command-grid">'+cards.map(c=>'<div class="mr-command-stat"><strong>'+esc(c[0])+'</strong><span>'+esc(c[1])+'</span></div>').join("")+'</div><div class="mr-command-columns"><section class="mr-command-panel"><h3>Today\'s timetable · '+esc(day)+'</h3>';
if(!r)html+='<div class="mr-command-empty">Open a routine to see today\'s timetable here.</div>';else if(!schedule.length)html+='<div class="mr-command-empty">No periods configured for today.</div>';
else html+=schedule.map(({e,p})=>{const s=(r.subjects||[]).find(x=>String(x.id)===String(e.subjectId));return '<div class="mr-command-row"><div><strong>'+esc((p.name||"Period")+" · "+(s&&s.name||"Open study slot"))+'</strong><small>'+esc((p.startTime||p.start||"Time not set")+" – "+(p.endTime||p.end||""))+'</small></div><span class="mr-command-chip">'+(e.subjectId?"Scheduled":"Open")+'</span></div>';}).join("");
html+='<div class="mr-command-actions"><button data-action="editor">Edit timetable</button><button data-action="daily">Daily plan</button><button data-action="smart">Smart review</button></div></section><section class="mr-command-panel"><h3>Task priorities</h3>';
const urgent=activeTasks.filter(x=>x.due<=date).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,5);
if(!urgent.length)html+='<div class="mr-command-empty">No tasks due or overdue. Nice clear runway.</div>';else html+=urgent.map(x=>'<div class="mr-command-row"><div><strong>'+esc(x.title)+'</strong><small class="'+(x.due<date?"mr-command-alert":"")+'">'+(x.due<date?"Overdue · ":"Due today · ")+esc(x.due)+'</small></div><span class="mr-command-chip">'+esc(x.priority||"normal")+'</span></div>').join("");
html+='<div class="mr-command-actions"><button data-action="tasks" class="primary">Open Task Desk</button><button data-action="focus">Focus timer</button></div></section></div><section class="mr-command-panel" style="margin-top:12px"><h3>Progress snapshot</h3><div class="mr-command-row"><div><strong>'+done.length+' tasks completed</strong><small>'+activeTasks.length+' still active · '+tasks.length+' total in Task Desk</small></div><span class="mr-command-chip">'+(tasks.length?Math.round(done.length/tasks.length*100):0)+'% complete</span></div><div class="mr-command-row"><div><strong>'+sessions.length+' focus session(s) logged</strong><small>Focus totals use locally recorded session data.</small></div><span class="mr-command-chip">'+mins(focused)+'</span></div></section>';
$("#mr-command-content",overlay).innerHTML=html;
}
function close(){overlay.hidden=true;launch.focus();}
launch.addEventListener("click",()=>{render();overlay.hidden=false;$(".mr-command-close",overlay).focus();});
overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest(".mr-command-close")){close();return;}const b=e.target.closest("[data-action]");if(!b)return;const action=b.dataset.action;close();const ids={editor:"",daily:"#mr-daily-launch",smart:"#mr-smart-launch",tasks:"#mr-task-launch"};if(action==="editor"){if(window.openEditor)window.openEditor();return;}if(ids[action])$(ids[action])?.click();if(action==="focus")$("#mr-focus-launch")?.click();});
window.addEventListener("keydown",e=>{if(!overlay.hidden&&e.key==="Escape")close();});
["myroutine:ready","myroutine:changed","myroutine:updated","myroutine:saved"].forEach(n=>document.addEventListener(n,()=>{if(!overlay.hidden)render();}));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();