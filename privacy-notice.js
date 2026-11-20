/* MyRoutine privacy notice — informational, non-blocking and non-coercive. */
(() => {
  "use strict";
  const KEY = "myroutine_privacy_notice_seen_v1";
  const mount = () => {
    if (document.getElementById("mr-privacy-notice")) return;
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch (_) {}
    if (seen) return;

    const panel = document.createElement("aside");
    panel.id = "mr-privacy-notice";
    panel.className = "mr-privacy-notice";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", "mr-privacy-title");
    panel.innerHTML = `
      <div class="mr-privacy-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div class="mr-privacy-copy">
        <strong id="mr-privacy-title">A quick note about your privacy</strong>
        <p>Your routines, tasks and focus history are primarily saved in this browser. Hosting and external assets may process basic technical request data. Read the policy to understand storage, backups and your choices.</p>
        <div class="mr-privacy-actions">
          <a href="/legal.html#privacy">Read privacy policy <span aria-hidden="true">↗</span></a>
          <button type="button" id="mr-privacy-dismiss">Got it</button>
        </div>
      </div>
      <button class="mr-privacy-close" type="button" aria-label="Dismiss privacy notice" title="Dismiss">×</button>`;
    document.body.appendChild(panel);

    const dismiss = () => {
      try { localStorage.setItem(KEY, "1"); } catch (_) {}
      panel.classList.add("is-closing");
      window.setTimeout(() => panel.remove(), 180);
    };
    panel.querySelector("#mr-privacy-dismiss").addEventListener("click", dismiss);
    panel.querySelector(".mr-privacy-close").addEventListener("click", dismiss);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();