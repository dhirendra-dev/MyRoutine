(function () {
"use strict";
let filter="upcoming",editing=null;
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=n=>String(n).padStart(2,"0");
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
const dateLabel=v=>new Date(v+"T00:00:00").toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short",year:"numeric"});
const routine=()=>window.MyRoutine?.getActiveRoutine?.()||null;
const events=()=>{const r=routine(),c=window.MyRoutineCalendar;return r&&c?c.getEvents(r).filter(e=>e.type==="exam"):[];};
const left=v=>Math.round((new Date(v+"T00:00:00")-new Date(today()+"T00:00:00"))/86400000);
function close(){const el=$("#mr-exam-overlay");if(el)el.remove();document.body.style.overflow="";}
function open(){
 if(!routine()){window.notifyMyRoutine?.("Open a routine before adding exams.");return;}
 close();const el=document.createElement("div");el.id="mr-exam-overlay";el.className="mr-exam-overlay";
 el.innerHTML='<section class="mr-exam-modal" role="dialog" aria-modal="true" aria-labelledby="mr-exam-title"><header class="mr-exam-header"><div><span class="mr-exam-kicker">MYROUTINE · ACADEMIC PLANNER</span><h2 id="mr-exam-title">Exam routine</h2><p>Every exam date, time and venue in one place.</p></div><button class="mr-exam-close" data-close aria-label="Close">×</button></header><main class="mr-exam-content"><div class="mr-exam-summary" id="mr-exam-summary"></div><div class="mr-exam-toolbar"><div><h3>Your exams</h3><p id="mr-exam-subtitle">Upcoming exams</p></div><button class="mr-exam-add" id="mr-exam-new">＋ Add exam</button></div><div class="mr-exam-filters"><button data-filter="upcoming">Upcoming</button><button data-filter="all">All exams</button><button data-filter="past">Past</button></div><div id="mr-exam-list" class="mr-exam-list"></div><form id="mr-exam-form" class="mr-exam-form" hidden><div class="mr-exam-form-head"><h3 id="mr-exam-form-title">Add an exam</h3><button type="button" data-cancel aria-label="Close form">×</button></div><label>Exam / subject name<input name="title" maxlength="100" required placeholder="e.g. Physics — Unit Test"></label><div class="mr-exam-form-grid"><label>Exam date<input type="date" name="date" required></label><label>Start time<input type="time" name="startTime"></label><label>End time<input type="time" name="endTime"></label><label>Venue / room<input name="location" maxlength="120" placeholder="Optional"></label></div><label>Notes / syllabus<textarea name="description" rows="3" maxlength="1000" placeholder="Chapters, syllabus or instructions…"></textarea></label><div class="mr-exam-form-actions"><button type="button" class="mr-exam-cancel" data-cancel>Cancel</button><button type="submit" class="mr-exam-save">Save exam</button></div></form></main></section>';
 document.body.appendChild(el);document.body.style.overflow="hidden";
 el.addEventListener("click",e=>{
  if(e.target===el||e.target.closest("[data-close]")){close();return;}
  const f=e.target.closest("[data-filter]");if(f){filter=f.dataset.filter;render();return;}
  if(e.target.closest("#mr-exam-new")||e.target.closest("#mr-exam-empty-add")){showForm();return;}
  if(e.target.closest("[data-cancel]")){hideForm();return;}
  const ed=e.target.closest("[data-edit]");if(ed){showForm(ed.dataset.edit);return;}
  const del=e.target.closest("[data-delete]");if(del)remove(del.dataset.delete);
 });
 el.addEventListener("submit",e=>{if(e.target.id==="mr-exam-form"){e.preventDefault();save(e.target);}});
 render();
}
function render(){
 const root=$("#mr-exam-overlay");if(!root)return;
 const list=events().slice().sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.startTime||"").localeCompare(b.startTime||""));
 const up=list.filter(e=>e.date>=today()),past=list.filter(e=>e.date<today());
 $("#mr-exam-summary").innerHTML='<div><b>'+up.length+'</b><span>Upcoming</span></div><div><b>'+past.length+'</b><span>Past dates</span></div><div><b>'+list.length+'</b><span>Total exams</span></div>';
 root.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter===filter));
 $("#mr-exam-subtitle").textContent=filter==="all"?"All scheduled exams":filter==="past"?"Previously scheduled exams":"Upcoming exams for this routine";
 const visible=filter==="all"?list:filter==="past"?past:up;
 $("#mr-exam-list").innerHTML=visible.length?visible.map(e=>{const n=left(e.date),status=n===0?"Today":n===1?"Tomorrow":n>1?n+" days left":"Past";return '<article class="mr-exam-card"><div class="mr-exam-date"><b>'+esc(new Date(e.date+"T00:00:00").getDate())+'</b><span>'+esc(new Date(e.date+"T00:00:00").toLocaleDateString(undefined,{month:"short"}))+'</span></div><div class="mr-exam-details"><small>'+esc(status)+'</small><h4>'+esc(e.title)+'</h4><p>'+esc(dateLabel(e.date))+(e.startTime?" · "+esc(e.startTime):"")+(e.endTime?"–"+esc(e.endTime):"")+'</p>'+(e.location?'<p>⌖ '+esc(e.location)+'</p>':"")+(e.description?'<p class="mr-exam-note">'+esc(e.description)+'</p>':"")+'</div><div class="mr-exam-actions"><button data-edit="'+esc(e.id)+'">Edit</button><button data-delete="'+esc(e.id)+'">Delete</button></div></article>';}).join(""):'<div class="mr-exam-empty"><span>▦</span><h4>'+(filter==="past"?"No past exams":"No exams added yet")+'</h4><p>Add an exam to build your exam timetable.</p><button id="mr-exam-empty-add">＋ Add exam</button></div>';
}
function showForm(id){
 const f=$("#mr-exam-form"),e=id?events().find(x=>x.id===id):null;if(!f)return;
 editing=id||null;f.reset();f.hidden=false;f.elements.title.value=e?.title||"";f.elements.date.value=e?.date||today();f.elements.startTime.value=e?.startTime||"";f.elements.endTime.value=e?.endTime||"";f.elements.location.value=e?.location||"";f.elements.description.value=e?.description||"";
 $("#mr-exam-form-title").textContent=e?"Edit exam":"Add an exam";f.scrollIntoView({behavior:"smooth",block:"nearest"});f.elements.title.focus();
}
function hideForm(){const f=$("#mr-exam-form");if(f)f.hidden=true;editing=null;}
function save(f){
 const r=routine(),c=window.MyRoutineCalendar;if(!r||!c)return;
 const d={title:f.elements.title.value.trim(),date:f.elements.date.value,type:"exam",startTime:f.elements.startTime.value,endTime:f.elements.endTime.value,location:f.elements.location.value.trim(),description:f.elements.description.value.trim(),allDay:!f.elements.startTime.value};
 if(!d.title||!d.date)return;
 if(d.startTime&&d.endTime&&d.endTime<=d.startTime){f.elements.endTime.setCustomValidity("End time must be after start time.");f.elements.endTime.reportValidity();f.elements.endTime.setCustomValidity("");return;}
 const wasEditing=!!editing;if(editing)c.updateEvent(r.id,editing,d);else c.addEvent(r.id,d);hideForm();render();window.notifyMyRoutine?.(wasEditing?"Exam updated.":"Exam added.");
}
function remove(id){const e=events().find(x=>x.id===id);if(!e||!confirm('Delete "'+e.title+'"?'))return;window.MyRoutineCalendar.removeEvent(routine().id,id);render();}
window.openExamRoutine=open;
document.addEventListener("myroutine:calendar-changed",()=>{if($("#mr-exam-overlay"))render();});
})();