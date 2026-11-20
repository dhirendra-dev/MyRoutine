/* MyRoutine Task Desk — local deadline and recurring-task companion. */
(function () {
  "use strict";
  if (window.__myRoutineTaskDesk) return;
  window.__myRoutineTaskDesk = true;
  const KEY = "myroutine_task_desk_v1";
  const $ = (s, root) => (root || document).querySelector(s);
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const today = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-"); };
  const shift = (date, days) => { const d = new Date(date + "T12:00:00"); d.setDate(d.getDate()+days); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); };
  function load(){ try { const x=JSON.parse(localStorage.getItem(KEY)||"[]"); return Array.isArray(x)?x:[]; } catch (_) { return []; } }
  function save(items){ localStorage.setItem(KEY,JSON.stringify(items)); }
  let items=load(), filter="active";
  const style=document.createElement("style");
  style.textContent=`
  #mr-task-launch{position:fixed;right:18px;bottom:78px;z-index:9995;border:1px solid #ffffff24;border-radius:999px;padding:12px 16px;background:linear-gradient(135deg,#65d6c1,#329eaa);color:#071b22;font:800 13px system-ui;box-shadow:0 12px 34px #0006;cursor:pointer}
  #mr-task-overlay{position:fixed;inset:0;z-index:100004;display:grid;place-items:center;padding:14px;background:#020710dc;backdrop-filter:blur(15px)}
  #mr-task-overlay[hidden]{display:none}.mr-task-card{width:min(100%,820px);max-height:90vh;overflow:auto;border:1px solid #ffffff20;border-radius:24px;background:#111b2e;color:#edf3ff;box-shadow:0 32px 100px #000a}
  .mr-task-head{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;gap:12px;padding:19px 21px;background:#111b2ef5;border-bottom:1px solid #ffffff16}
  .mr-task-head h2{margin:4px 0;font:760 21px system-ui}.mr-task-head p{margin:0;color:#9eacc4;font:12px system-ui}
  .mr-task-body{padding:17px 21px 22px}.mr-task-form{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px}
  .mr-task-form input,.mr-task-form select,.mr-task-filter{min-width:0;padding:11px;border:1px solid #ffffff20;border-radius:11px;background:#17243b;color:#edf3ff;font:12px system-ui}
  .mr-task-form button,.mr-task-row button,.mr-task-close{border:1px solid #ffffff20;border-radius:11px;padding:10px 12px;background:#ffffff0b;color:#edf3ff;font:700 12px system-ui;cursor:pointer}
  .mr-task-form button{background:#7ce0ca;color:#08221e;border:0}
  .mr-task-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}
  .mr-task-stat{padding:12px;border:1px solid #ffffff15;border-radius:13px;background:#ffffff07}.mr-task-stat strong{display:block;font:800 20px system-ui}.mr-task-stat span{color:#9eacc4;font:11px system-ui}
  .mr-task-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:16px 0 9px}.mr-task-list{display:grid;gap:8px}
  .mr-task-row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;padding:12px;border:1px solid #ffffff16;border-radius:13px;background:#ffffff07}
  .mr-task-row.done{opacity:.58}.mr-task-row.done .mr-task-name{text-decoration:line-through}
  .mr-task-check{width:18px;height:18px;accent-color:#71ddc4}.mr-task-name{font:700 13px system-ui;overflow-wrap:anywhere}.mr-task-meta{margin-top:4px;color:#9eacc4;font:11px system-ui}.mr-task-overdue{color:#ff8996}.mr-task-empty{padding:22px;text-align:center;border:1px dashed #ffffff24;border-radius:13px;color:#9eacc4;font:12px system-ui}
  .mr-task-actions{display:flex;gap:6px}.mr-task-close{font-size:20px;padding:3px 10px}
  @media(max-width:640px){#mr-task-launch{right:12px;bottom:72px}.mr-task-card{border-radius:18px}.mr-task-head,.mr-task-body{padding-left:14px;padding-right:14px}.mr-task-form{grid-template-columns:1fr 1fr}.mr-task-form input:first-child{grid-column:1/-1}.mr-task-form button{grid-column:1/-1}.mr-task-summary{grid-template-columns:repeat(2,1fr)}.mr-task-row{grid-template-columns:auto minmax(0,1fr)}.mr-task-actions{grid-column:2;justify-content:flex-end}}
  `;
  function mount(){
    if(!document.body||$("#mr-task-launch"))return;
    document.head.appendChild(style);
    const launch=document.createElement("button");launch.id="mr-task-launch";launch.type="button";launch.textContent="✓ Task desk";launch.setAttribute("aria-haspopup","dialog");
    const overlay=document.createElement("div");overlay.id="mr-task-overlay";overlay.hidden=true;
    overlay.innerHTML='<section class="mr-task-card" role="dialog" aria-modal="true" aria-labelledby="mr-task-title"><header class="mr-task-head"><div><div style="color:#7ce0ca;font:800 10px system-ui;letter-spacing:.16em">MYROUTINE / TASK DESK</div><h2 id="mr-task-title">Deadlines & recurring tasks</h2><p>Local to this browser · no account or server sync</p></div><button class="mr-task-close" type="button" aria-label="Close">×</button></header><div class="mr-task-body"><form class="mr-task-form" id="mr-task-form"><input name="title" maxlength="100" required placeholder="Task name" aria-label="Task name"><input name="due" type="date" required aria-label="Due date"><select name="repeat" aria-label="Repeat"><option value="none">One-time</option><option value="daily">Daily</option><option value="weekly">Weekly</option></select><select name="priority" aria-label="Priority"><option value="normal">Normal</option><option value="high">High priority</option></select><button type="submit">Add task</button></form><div class="mr-task-summary" id="mr-task-summary"></div><div class="mr-task-toolbar"><strong style="font:700 13px system-ui">Your task list</strong><select class="mr-task-filter" id="mr-task-filter" aria-label="Filter tasks"><option value="active">Active</option><option value="today">Due today</option><option value="overdue">Overdue</option><option value="all">All tasks</option></select></div><div class="mr-task-list" id="mr-task-list"></div></div></section>';
    document.body.append(launch,overlay);
    function render(){
      const t=today(),active=items.filter(x=>!x.done),overdue=active.filter(x=>x.due<t),due=active.filter(x=>x.due===t);
      $("#mr-task-summary",overlay).innerHTML=[[""+active.length,"Active"],[""+due.length,"Due today"],[""+overdue.length,"Overdue"],[""+items.filter(x=>x.repeat!=="none").length,"Recurring"]].map(x=>'<div class="mr-task-stat"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join("");
      let list=items.slice().sort((a,b)=>a.due.localeCompare(b.due));
      if(filter==="active")list=list.filter(x=>!x.done);if(filter==="today")list=list.filter(x=>!x.done&&x.due===t);if(filter==="overdue")list=list.filter(x=>!x.done&&x.due<t);
      $("#mr-task-list",overlay).innerHTML=list.length?list.map(x=>'<article class="mr-task-row '+(x.done?"done":"")+'" data-id="'+esc(x.id)+'"><input class="mr-task-check" type="checkbox" '+(x.done?"checked":"")+' aria-label="Complete '+esc(x.title)+'"><div><div class="mr-task-name">'+esc(x.title)+'</div><div class="mr-task-meta '+(!x.done&&x.due<t?"mr-task-overdue":"")+'">'+(x.due<t&&!x.done?"Overdue · ":"Due ")+esc(x.due)+(x.repeat!=="none"?" · "+esc(x.repeat)+" repeat":"")+(x.priority==="high"?" · High priority":"")+'</div></div><div class="mr-task-actions"><button type="button" data-delete>Delete</button></div></article>').join(""):'<div class="mr-task-empty">Nothing in this view yet. Add a task above to get started.</div>';
    }
    launch.addEventListener("click",()=>{render();overlay.hidden=false;$("#mr-task-form input",overlay).focus();});
    overlay.addEventListener("change",e=>{if(e.target.id==="mr-task-filter"){filter=e.target.value;render();return;}if(!e.target.classList.contains("mr-task-check"))return;const row=e.target.closest("[data-id]"),item=items.find(x=>x.id===row.dataset.id);if(!item)return;if(e.target.checked){if(item.repeat==="daily"){item.due=shift(item.due,1);}else if(item.repeat==="weekly"){item.due=shift(item.due,7);}else{item.done=true;}}save(items);render();});
    overlay.addEventListener("click",e=>{if(e.target===overlay||e.target.closest(".mr-task-close")){overlay.hidden=true;launch.focus();return;}const del=e.target.closest("[data-delete]");if(del){const row=del.closest("[data-id]");items=items.filter(x=>x.id!==row.dataset.id);save(items);render();}});
    $("#mr-task-form",overlay).addEventListener("submit",e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;items.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),title:f.elements.namedItem("title").value.trim(),due:f.elements.namedItem("due").value,repeat:f.elements.namedItem("repeat").value,priority:f.elements.namedItem("priority").value,done:false});save(items);f.reset();f.elements.namedItem("due").value=today();render();f.elements.namedItem("title").focus();});
    $("#mr-task-form [name=due]",overlay).value=today();
    window.addEventListener("keydown",e=>{if(!overlay.hidden&&e.key==="Escape"){overlay.hidden=true;launch.focus();}});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();