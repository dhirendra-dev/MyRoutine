/* MyRoutine install + connectivity enhancement. */
(() => {
  if (window.__myRoutinePwaReady) return;
  window.__myRoutinePwaReady = true;

  let installPrompt = null;
  const announce = (message) => {
    let node = document.getElementById("mr-pwa-status");
    if (!node) {
      node = document.createElement("div");
      node.id = "mr-pwa-status";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      Object.assign(node.style, {
        position: "fixed", left: "16px", right: "16px", bottom: "max(16px,env(safe-area-inset-bottom))",
        zIndex: "99999", maxWidth: "520px", margin: "0 auto", padding: "13px 16px",
        borderRadius: "14px", border: "1px solid rgba(180,199,235,.2)",
        background: "rgba(17,27,46,.96)", color: "#edf3ff",
        boxShadow: "0 18px 50px rgba(0,0,0,.35)", font: "600 13px/1.45 system-ui,sans-serif",
        backdropFilter: "blur(18px)"
      });
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.hidden = false;
    clearTimeout(node.__hideTimer);
    node.__hideTimer = setTimeout(() => { node.hidden = true; }, 4200);
  };

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    document.documentElement.classList.add("mr-install-available");
    document.dispatchEvent(new CustomEvent("myroutine:installavailable"));
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    announce("MyRoutine has been installed.");
  });

  window.MyRoutinePWA = {
    canInstall: () => !!installPrompt,
    install: async () => {
      if (!installPrompt) {
        announce("Use your browser menu and choose Add to Home Screen or Install app.");
        return false;
      }
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      installPrompt = null;
      return result.outcome === "accepted";
    }
  };

  let wasOffline = !navigator.onLine;
  const updateConnection = () => {
    const offline = !navigator.onLine;
    document.documentElement.classList.toggle("mr-offline", offline);
    if (offline) announce("You're offline. Your saved routine data remains on this device.");
    else if (wasOffline) announce("Connection restored.");
    wasOffline = offline;
  };
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  updateConnection();


  const addInstallControl = () => {
    if (document.getElementById("mr-install-control")) return;
    const button = document.createElement("button");
    button.id = "mr-install-control";
    button.type = "button";
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v3h14v-3"/></svg><span>Install app</span>';
    Object.assign(button.style,{position:"fixed",right:"18px",bottom:"max(18px,env(safe-area-inset-bottom))",zIndex:"9998",display:"none",alignItems:"center",gap:"9px",padding:"12px 16px",border:"1px solid rgba(255,255,255,.18)",borderRadius:"999px",background:"linear-gradient(135deg,#7789f5,#5f70db)",color:"#fff",font:"700 13px system-ui,sans-serif",boxShadow:"0 12px 32px rgba(0,0,0,.3)",cursor:"pointer"});
    button.addEventListener("click",() => window.MyRoutinePWA.install());
    document.body.appendChild(button);
    if (installPrompt) button.style.display = "inline-flex";
    window.addEventListener("myroutine:installavailable",() => {button.style.display="inline-flex";});
  };

  const addCommandPalette = () => {
    if (document.getElementById("mr-command-palette")) return;
    const overlay=document.createElement("div");
    overlay.id="mr-command-palette";
    overlay.hidden=true;
    overlay.innerHTML='<div class="mr-cmd-dialog" role="dialog" aria-modal="true" aria-labelledby="mr-cmd-title"><div class="mr-cmd-head"><div><div class="mr-cmd-kicker">MYROUTINE COMMANDS</div><h2 id="mr-cmd-title">What would you like to do?</h2></div><button type="button" class="mr-cmd-close" aria-label="Close command palette">×</button></div><input class="mr-cmd-search" type="search" placeholder="Search actions…" aria-label="Search commands"><div class="mr-cmd-list" role="listbox"></div><div class="mr-cmd-foot"><span>↑ ↓ to navigate</span><span>Enter to open</span><kbd>ESC</kbd></div></div>';
    const style=document.createElement("style");
    style.textContent='#mr-command-palette{position:fixed;inset:0;z-index:100000;display:grid;place-items:start center;padding:12vh 16px 24px;background:rgba(2,7,16,.76);backdrop-filter:blur(14px)}#mr-command-palette[hidden]{display:none}.mr-cmd-dialog{width:min(100%,590px);overflow:hidden;border:1px solid rgba(180,199,235,.18);border-radius:22px;background:#111b2e;color:#edf3ff;box-shadow:0 32px 100px #0009}.mr-cmd-head{display:flex;justify-content:space-between;gap:12px;padding:22px 22px 14px}.mr-cmd-kicker{font:800 10px system-ui;letter-spacing:.16em;color:#9eafff}.mr-cmd-head h2{font:750 21px/1.2 system-ui;letter-spacing:-.04em;margin:7px 0 0}.mr-cmd-close{width:34px;height:34px;border:1px solid #ffffff20;border-radius:10px;background:#ffffff09;color:#edf3ff;font-size:22px}.mr-cmd-search{display:block;width:calc(100% - 32px);margin:0 16px 12px;padding:13px 14px;border:1px solid #ffffff20;border-radius:12px;background:#0b1424;color:#edf3ff;font:14px system-ui;outline:none}.mr-cmd-search:focus{border-color:#8b9cff;box-shadow:0 0 0 3px #8b9cff25}.mr-cmd-list{max-height:min(48vh,430px);overflow:auto;padding:0 10px 10px}.mr-cmd-item{display:flex;width:100%;align-items:center;gap:12px;padding:12px;border:0;border-radius:12px;background:transparent;color:#edf3ff;text-align:left;font:600 13px system-ui;cursor:pointer}.mr-cmd-item:hover,.mr-cmd-item[aria-selected=true]{background:#8293ff20}.mr-cmd-item svg{color:#aab8ff}.mr-cmd-item small{display:block;margin-top:3px;color:#9aaac4;font-weight:400}.mr-cmd-foot{display:flex;gap:15px;justify-content:flex-end;padding:12px 18px;border-top:1px solid #ffffff14;color:#9aaac4;font:11px system-ui}.mr-cmd-foot kbd{padding:2px 6px;border:1px solid #ffffff22;border-radius:5px;color:#edf3ff}@media(max-width:520px){#mr-command-palette{padding-top:7vh}.mr-cmd-dialog{border-radius:18px}.mr-cmd-head{padding:18px 16px 12px}.mr-cmd-head h2{font-size:18px}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    const input=overlay.querySelector(".mr-cmd-search"),list=overlay.querySelector(".mr-cmd-list");
    const actions=[
      ["Create a routine","Start a new timetable or routine","plus","openCreateModal"],
      ["Search routines","Find a routine or item","search","openSearch"],
      ["Open calendar","View your schedule calendar","calendar-days","openCalendar"],
      ["Open analytics","Review productivity insights","chart-no-axes-combined","openAnalytics"],
      ["Edit current routine","Change periods and schedule details","pencil","openEditor"],
      ["View current routine","Open the timetable viewer","eye","openViewer"],
      ["Routine settings","Personalise this routine","settings","openSettings"],
      ["Browse templates","Start from a ready-made template","layout-template","openTemplates"],
      ["Notifications","Manage reminders","bell","openNotifications"],
      ["Backup and restore","Export or restore your data","hard-drive","openBackup"],
      ["Print routine","Prepare a print-friendly timetable","printer","printRoutine"],
      ["Focus timer","Start a distraction-light study or work session","timer","openFocusTimer"]
    ];
    const iconPaths = {
      plus: '<path d="M12 5v14M5 12h14"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      "calendar-days": '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
      "chart-no-axes-combined": '<path d="M3 3v18h18M7 14l4-4 4 4 6-7"/>',
      pencil: '<path d="m16 5 3 3M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/>',
      eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z"/>',
      "layout-template": '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="5" rx="1"/><rect x="13" y="10" width="8" height="11" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/>',
      bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
      "hard-drive": '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 14h18M7 17h.01M11 17h.01"/>',
      printer: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
      timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 5V2"/>'
    };
    let filtered=actions,selected=0;
    const render=()=>{
      filtered=actions.filter(item=>(item[0]+" "+item[1]).toLowerCase().includes(input.value.toLowerCase()));
      selected=Math.min(selected,Math.max(0,filtered.length-1));
      list.innerHTML=filtered.map((item,i)=>'<button type="button" class="mr-cmd-item" role="option" aria-selected="'+(i===selected)+'" data-action="'+item[3]+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">'+iconPaths[item[2]]+'</svg><span>'+item[0]+'<small>'+item[1]+'</small></span></button>').join("")||'<div style="padding:22px;color:#9aaac4;text-align:center;font:13px system-ui">No matching commands</div>';
    };
    const close=()=>{overlay.hidden=true;};
    const run=()=>{const item=filtered[selected];if(!item)return;close();const fn=window[item[3]];if(typeof fn==="function")fn();};
    const open=()=>{overlay.hidden=false;input.value="";selected=0;render();setTimeout(()=>input.focus(),30);};
    input.addEventListener("input",()=>{selected=0;render();});
    list.addEventListener("click",event=>{const button=event.target.closest("[data-action]");if(!button)return;const item=filtered.find(x=>x[3]===button.dataset.action);if(item){selected=filtered.indexOf(item);run();}});
    overlay.querySelector(".mr-cmd-close").addEventListener("click",close);
    overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
    input.addEventListener("keydown",event=>{if(event.key==="ArrowDown"){event.preventDefault();selected=Math.min(selected+1,filtered.length-1);render();}if(event.key==="ArrowUp"){event.preventDefault();selected=Math.max(0,selected-1);render();}if(event.key==="Enter"){event.preventDefault();run();}if(event.key==="Escape")close();});
    window.addEventListener("keydown",event=>{
      const target=event.target;
      const typing=target&&(target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(target.tagName));
      if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open();}
      else if(event.key==="Escape"&&!overlay.hidden)close();
      else if(event.key==="?"&&!typing&&!event.metaKey&&!event.ctrlKey){event.preventDefault();open();}
    });
    window.MyRoutineCommands={open,close};
    render();
  };

  const addFocusTimer = () => {
    if (window.MyRoutineFocusTimer) return;
    const KEY = "myroutine_focus_sessions_v1";
    let duration = 25 * 60;
    let remaining = duration * 1000;
    let deadline = 0;
    let interval = null;
    let running = false;
    let mode = "focus";
    let selectedSubjectId = "";
    const readSessions = () => {
      try {
        const value = JSON.parse(localStorage.getItem(KEY) || "[]");
        return Array.isArray(value) ? value.filter(x => x && Number.isFinite(x.at) && Number.isFinite(x.seconds)) : [];
      } catch (_) { return []; }
    };
    const todaySessions = () => {
      const now = new Date();
      return readSessions().filter(x => {
        const date = new Date(x.at);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
      });
    };
    const format = ms => {
      const total = Math.max(0, Math.ceil(ms / 1000));
      return String(Math.floor(total / 60)).padStart(2,"0") + ":" + String(total % 60).padStart(2,"0");
    };
    let overlay;
    const ensure = () => {
      if (overlay) return overlay;
      overlay = document.createElement("div");
      overlay.id = "mr-focus-timer";
      overlay.hidden = true;
      overlay.innerHTML = '<section class="mr-focus-card" role="dialog" aria-modal="true" aria-labelledby="mr-focus-title"><header><div><div class="mr-focus-kicker">MYROUTINE / FOCUS</div><h2 id="mr-focus-title">Focus session</h2></div><button type="button" class="mr-focus-close" aria-label="Close focus timer">×</button></header><div class="mr-focus-modes"><button type="button" data-minutes="25" class="active">25 min</button><button type="button" data-minutes="50">50 min</button><button type="button" data-minutes="90">90 min</button></div><label class="mr-focus-subject-label">Study subject<select class="mr-focus-subject" aria-label="Study subject"><option value="">General focus (no subject)</option></select></label><div class="mr-focus-clock" role="timer" aria-live="off">25:00</div><p class="mr-focus-caption">One task at a time. Take a break when you need one.</p><div class="mr-focus-actions"><button type="button" class="mr-focus-primary" data-focus-toggle>Start focus</button><button type="button" data-focus-reset>Reset</button></div><div class="mr-focus-stats"><div><strong data-focus-count>0</strong><span>Sessions today</span></div><div><strong data-focus-total>0m</strong><span>Focused today</span></div></div><p class="mr-focus-note" data-focus-note>Timer runs only in this browser. Completed sessions are saved on this device.</p></section>';
      const style = document.createElement("style");
      style.textContent = '#mr-focus-timer{position:fixed;inset:0;z-index:100001;display:grid;place-items:center;padding:18px;background:rgba(2,7,16,.78);backdrop-filter:blur(15px)}#mr-focus-timer[hidden]{display:none}.mr-focus-card{width:min(100%,440px);padding:22px;border:1px solid rgba(180,199,235,.18);border-radius:24px;background:#111b2e;color:#edf3ff;box-shadow:0 32px 100px #0009;text-align:center}.mr-focus-card header{display:flex;align-items:flex-start;justify-content:space-between;text-align:left;gap:12px}.mr-focus-kicker{font:800 10px system-ui;letter-spacing:.16em;color:#9eafff}.mr-focus-card h2{margin:6px 0 0;font:750 21px system-ui;letter-spacing:-.04em}.mr-focus-close{width:35px;height:35px;border:1px solid #ffffff20;border-radius:10px;background:#ffffff09;color:#edf3ff;font-size:22px}.mr-focus-modes{display:flex;justify-content:center;gap:7px;margin:26px 0 12px}.mr-focus-subject-label{display:block;margin:0 auto 12px;max-width:300px;text-align:left;color:#9eacc4;font:11px system-ui}.mr-focus-subject{display:block;width:100%;margin-top:6px;padding:10px 12px;border:1px solid #ffffff20;border-radius:10px;background:#17243b;color:#edf3ff;font:12px system-ui}.mr-focus-modes button,.mr-focus-actions button{border:1px solid #ffffff20;border-radius:11px;background:#ffffff08;color:#dce5ff;padding:10px 14px;font:650 12px system-ui;cursor:pointer}.mr-focus-modes button.active{border-color:#8b9cff80;background:#8b9cff20;color:#fff}.mr-focus-clock{font:750 clamp(58px,16vw,82px)/1 system-ui;letter-spacing:-.07em;font-variant-numeric:tabular-nums;margin:24px 0 10px}.mr-focus-caption{margin:0;color:#aab8d0;font:13px/1.5 system-ui}.mr-focus-actions{display:flex;justify-content:center;gap:9px;margin:24px 0}.mr-focus-actions .mr-focus-primary{min-width:150px;background:linear-gradient(135deg,#7789f5,#5f70db);border-color:transparent;color:white}.mr-focus-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.mr-focus-stats div{padding:13px;border:1px solid #ffffff15;border-radius:14px;background:#ffffff06}.mr-focus-stats strong,.mr-focus-stats span{display:block}.mr-focus-stats strong{font:750 21px system-ui}.mr-focus-stats span{margin-top:4px;color:#9aaac4;font:11px system-ui}.mr-focus-note{margin:14px 0 0;color:#8494af;font:11px/1.5 system-ui} @media(max-width:480px){.mr-focus-card{padding:18px;border-radius:20px}}';
      document.head.appendChild(style);
      document.body.appendChild(overlay);
      const subjectSelect=overlay.querySelector(".mr-focus-subject");
      const activeRoutine=window.MyRoutine&&window.MyRoutine.getActiveRoutine?window.MyRoutine.getActiveRoutine():null;
      const subjectOptions=activeRoutine&&Array.isArray(activeRoutine.subjects)?activeRoutine.subjects:[];
      subjectOptions.forEach(subject=>{const option=document.createElement("option");option.value=String(subject.id);option.textContent=String(subject.name||"Subject");subjectSelect.appendChild(option);});
      subjectSelect.addEventListener("change",()=>{selectedSubjectId=subjectSelect.value;});
      overlay.querySelector(".mr-focus-close").addEventListener("click",close);
      overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
      overlay.querySelectorAll("[data-minutes]").forEach(button=>button.addEventListener("click",()=>{
        if(running)return;
        duration=Number(button.dataset.minutes)*60;
        remaining=duration*1000;
        overlay.querySelectorAll("[data-minutes]").forEach(x=>x.classList.toggle("active",x===button));
        render();
      }));
      overlay.querySelector("[data-focus-toggle]").addEventListener("click",toggle);
      overlay.querySelector("[data-focus-reset]").addEventListener("click",reset);
      overlay.addEventListener("keydown",event=>{if(event.key==="Escape")close();});
      return overlay;
    };
    const render = () => {
      if(!overlay)return;
      overlay.querySelector(".mr-focus-clock").textContent=format(remaining);
      overlay.querySelector("[data-focus-toggle]").textContent=running?"Pause":"Start focus";
      overlay.querySelectorAll("[data-minutes]").forEach(button=>button.disabled=running);
      const sessions=todaySessions();
      overlay.querySelector("[data-focus-count]").textContent=String(sessions.length);
      overlay.querySelector("[data-focus-total]").textContent=Math.round(sessions.reduce((sum,x)=>sum+x.seconds,0)/60)+"m";
    };
    const stopTick = () => { if(interval){clearInterval(interval);interval=null;} };
    const tick = () => {
      remaining=Math.max(0,deadline-Date.now());
      render();
      if(remaining<=0){
        stopTick();running=false;
        if(mode==="focus"){
          const sessions=readSessions();
          const activeRoutine=window.MyRoutine&&window.MyRoutine.getActiveRoutine?window.MyRoutine.getActiveRoutine():null;
          const selectedSubject=activeRoutine&&Array.isArray(activeRoutine.subjects)?activeRoutine.subjects.find(x=>String(x.id)===String(selectedSubjectId)):null;
          const session={at:Date.now(),seconds:duration};
          if(selectedSubject){session.subjectId=String(selectedSubject.id);session.subjectName=String(selectedSubject.name||"Subject");}
          sessions.push(session);
          try{const history=JSON.parse(localStorage.getItem("myroutine_activity_history_v1")||"[]");history.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),type:"focus_completed",at:session.at,seconds:session.seconds,subjectId:session.subjectId||null,subjectName:session.subjectName||null});localStorage.setItem("myroutine_activity_history_v1",JSON.stringify(history.slice(-3000)));}catch(_){}
          try{localStorage.setItem(KEY,JSON.stringify(sessions.slice(-500)));}catch(_){}
          render();
          announce("Focus session complete. Take a short break if you need one.");
          overlay.querySelector("[data-focus-note]").textContent="Session saved on this device. You can start another session whenever you're ready.";
        }
      }
    };
    const toggle = () => {
      if(running){remaining=Math.max(0,deadline-Date.now());running=false;stopTick();render();return;}
      if(remaining<=0)remaining=duration*1000;
      running=true;deadline=Date.now()+remaining;
      overlay.querySelector("[data-focus-note]").textContent="Timer is running. You can pause or close this panel at any time.";
      interval=setInterval(tick,250);render();
    };
    const reset = () => {running=false;stopTick();remaining=duration*1000;render();};
    const close = () => {if(overlay)overlay.hidden=true;};
    const open = () => {const node=ensure();node.hidden=false;render();node.querySelector(".mr-focus-close").focus();};
    window.MyRoutineFocusTimer={open,close,reset};
    window.openFocusTimer=open;
    ensure();
    render();
  };

  const addCommandTrigger = () => {
    const actions=document.querySelector(".top-actions");
    if(!actions||document.getElementById("mr-command-trigger"))return;
    const button=document.createElement("button");
    button.id="mr-command-trigger";button.type="button";button.className="icon-btn";
    button.title="Open command palette (Ctrl or Command + K)";
    button.setAttribute("aria-label","Open command palette");
    button.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
    button.addEventListener("click",()=>window.MyRoutineCommands?.open());
    actions.prepend(button);
  };
  const addFocusTrigger = () => {
    const actions=document.querySelector(".top-actions");
    if(!actions||document.getElementById("mr-focus-trigger"))return;
    const button=document.createElement("button");
    button.id="mr-focus-trigger";button.type="button";button.className="icon-btn";
    button.title="Open focus timer";button.setAttribute("aria-label","Open focus timer");
    button.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 5V2"/></svg>';
    button.addEventListener("click",()=>window.MyRoutineFocusTimer?.open());
    actions.prepend(button);
  };
  const initEnhancements = () => { addInstallControl(); addCommandPalette(); addFocusTimer(); addCommandTrigger(); addFocusTrigger(); };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initEnhancements,{once:true});
  else initEnhancements();

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" })
        .then(registration => {
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            if (!worker) return;
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                announce("A MyRoutine update is ready. Reload to use the latest version.");
              }
            });
          });
        })
        .catch(error => console.warn("MyRoutine offline support:", error));
    });
  }
})();