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

  const updateConnection = () => {
    document.documentElement.classList.toggle("mr-offline", !navigator.onLine);
    if (!navigator.onLine) announce("You're offline. Your saved routine data remains on this device.");
    else if (document.documentElement.classList.contains("mr-offline")) announce("Connection restored.");
  };
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  updateConnection();

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