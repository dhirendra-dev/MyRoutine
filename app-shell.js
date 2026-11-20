(function () {
  "use strict";

  window.MyRoutineIndex = {
    workspaceOpen: false
  };


  function app() {
    return window.MyRoutine || null;
  }


  function routines() {
    const a = app();

    if (!a) return [];

    /*
     * The current core exposes its real data
     * through state.data.routines.
     */
    if (
      a.state &&
      a.state.data &&
      Array.isArray(a.state.data.routines)
    ) {
      return a.state.data.routines;
    }

    if (typeof a.getRoutines === "function") {
      try {
        return a.getRoutines() || [];
      } catch (error) {
        console.error(error);
      }
    }

    if (
      a.data &&
      Array.isArray(a.data.routines)
    ) {
      return a.data.routines;
    }

    return [];
  }


  function activeRoutine() {
    const a = app();

    if (!a) return null;

    if (typeof a.getActiveRoutine === "function") {
      return a.getActiveRoutine();
    }

    const list = routines();

    const id =
      a.state &&
      a.state.activeRoutineId;

    return list.find(function (r) {
      return r.id === id;
    }) || null;
  }


  function notify(message) {
    const toast =
      document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.__myRoutineToast);

    window.__myRoutineToast =
      setTimeout(function () {
        toast.classList.remove("show");
      }, 2300);
  }

  window.notifyMyRoutine = notify;


  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function institutionName(routine) {
    const institution =
      routine.institution ||
      routine.institutionName ||
      (
        routine.settings &&
        routine.settings.institutionName
      );

    if (typeof institution === "object") {
      return institution.name ||
             institution.type ||
             "Personal";
    }

    return institution || "Personal routine";
  }


  function courseName(routine) {
    return (
      routine.course ||
      routine.className ||
      (
        routine.academic &&
        routine.academic.course
      ) ||
      (
        routine.settings &&
        routine.settings.course
      ) ||
      ""
    );
  }


  function renderHomeSummary(data) {
    const count =
      document.getElementById("heroRoutineCount");

    const subjectCount =
      document.getElementById("heroSubjectCount");

    const title =
      document.getElementById("heroRoutineTitle");

    const meta =
      document.getElementById("heroRoutineMeta");

    const totalSubjects =
      data.reduce(function (sum, routine) {
        return sum +
          (
            Array.isArray(routine.subjects)
              ? routine.subjects.length
              : 0
          );
      }, 0);

    if (count) {
      count.textContent = data.length;
    }

    if (subjectCount) {
      subjectCount.textContent = totalSubjects;
    }

    const first = data[0];

    if (first) {
      if (title) {
        title.textContent =
          first.name || "Your routine";
      }

      if (meta) {
        meta.textContent =
          institutionName(first) +
          (
            courseName(first)
              ? " · " + courseName(first)
              : ""
          );
      }
    } else {
      if (title) {
        title.textContent = "Ready when you are.";
      }

      if (meta) {
        meta.textContent =
          "Import your timetable or create a new routine to unlock your dashboard.";
      }
    }
  }


  function renderRoutines() {

    const list =
      document.getElementById("routineList");

    if (!list) return;

    const data = routines();

    renderHomeSummary(data);

    if (!data.length) {

      list.innerHTML =
        '<div class="empty">' +
          '<div class="empty-icon"><i data-lucide="calendar-days"></i></div>' +
          '<strong>No routines yet.</strong><br>' +
          '<span>Create your first routine or import a JSON timetable.</span>' +
          '<div style="margin-top:16px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap">' +
            '<button class="btn primary" onclick="openCreateModal()"><i data-lucide="plus"></i> Create Routine</button>' +
            '<button class="btn" onclick="importRoutine()">Import JSON</button>' +
          '</div>' +
        '</div>';

      return;
    }


    list.innerHTML =
      data.map(function (routine, index) {

        const subjects =
          Array.isArray(routine.subjects)
            ? routine.subjects.length
            : 0;

        const periods =
          Array.isArray(routine.periods)
            ? routine.periods.length
            : 0;

        return (
          '<article class="routine-card">' +

            '<div class="routine-card-top">' +

              '<div class="routine-icon">' +
                escapeHtml(
                  (routine.name || "MR")
                    .trim()
                    .slice(0,2)
                    .toUpperCase()
                ) +
              '</div>' +

              '<span class="status-pill">' +
                '<i class="status-dot"></i>' +
                'Ready' +
              '</span>' +

            '</div>' +

            '<h4>' +
              escapeHtml(
                routine.name ||
                "Untitled Routine"
              ) +
            '</h4>' +

            '<div class="routine-meta">' +
              escapeHtml(
                institutionName(routine)
              ) +

              (
                courseName(routine)
                  ? " · " +
                    escapeHtml(
                      courseName(routine)
                    )
                  : ""
              ) +

              '<br>' +

              subjects +
              ' subjects · ' +
              periods +
              ' periods' +

            '</div>' +

            '<div class="routine-actions">' +

              '<button class="btn primary small" ' +
                'onclick=\'openRoutineWorkspace(' +
                JSON.stringify(routine.id) +
                ')\'>Open workspace</button>' +

              '<button class="btn small" ' +
                'onclick=\'duplicateRoutine(' +
                JSON.stringify(routine.id) +
                ')\'>Duplicate</button>' +

              '<button class="btn small" ' +
                'onclick=\'deleteRoutine(' +
                JSON.stringify(routine.id) +
                ')\'>Delete</button>' +

            '</div>' +

          '</article>'
        );

      }).join("");
  }


  window.refreshHome = function () {
    renderRoutines();
  };


  /* =====================================================
     CREATE / MODAL
     ===================================================== */

  window.openCreateModal = function () {

    const modal =
      document.getElementById("createModal");

    if (!modal) return;

    modal.classList.add("open");

    setTimeout(function () {

      const input =
        document.getElementById("routineName");

      if (input) input.focus();

    }, 80);
  };


  window.closeModal = function (id) {

    const el =
      document.getElementById(id);

    if (el) {
      el.classList.remove("open");
    }
  };


  window.backdropClose = function (event, id) {

    if (event.target.id === id) {
      closeModal(id);
    }
  };


  document
    .getElementById("createForm")
    .addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        const name =
          document
            .getElementById("routineName")
            .value
            .trim();

        if (!name) return;

        const payload = {

          name,

          institutionName:
            document
              .getElementById("institutionName")
              .value
              .trim(),

          institutionType:
            document
              .getElementById("institutionType")
              .value,

          course:
            document
              .getElementById("course")
              .value
              .trim(),

          section:
            document
              .getElementById("section")
              .value
              .trim(),

          session:
            document
              .getElementById("session")
              .value
              .trim(),

          weekStart:
            document
              .getElementById("weekStart")
              .value
        };

        const a = app();

        let created = null;

        try {

          if (
            a &&
            typeof a.createRoutine === "function"
          ) {
            created =
              a.createRoutine(payload);
          }

        } catch (error) {
          console.error(error);
          notify("Could not create the routine.");
        }

        closeModal("createModal");

        renderRoutines();

        if (created && created.id) {

          setTimeout(function () {
            openRoutineWorkspace(
              created.id
            );
          }, 100);

        } else {
          notify("Routine created.");
        }
      }
    );


  /* =====================================================
     IMPORT JSON
     ===================================================== */

  window.importRoutine = function () {

    const a = app();

    if (
      !a ||
      typeof a.importRoutineFile !== "function"
    ) {
      notify(
        "JSON importer is unavailable."
      );
      return;
    }

    const input =
      document.createElement("input");

    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange =
      async function () {

        const file =
          input.files &&
          input.files[0];

        if (!file) return;

        try {

          await a.importRoutineFile(file);

          renderRoutines();

          const current =
            activeRoutine();

          if (current) {
            setTimeout(function () {
              openRoutineWorkspace(
                current.id
              );
            }, 100);
          }

          notify(
            "JSON routine imported successfully."
          );

        } catch (error) {

          console.error(error);

          notify(
            error.message ||
            "Unable to import JSON."
          );
        }
      };

    input.click();
  };


  /* =====================================================
     WORKSPACE DASHBOARD
     ===================================================== */

  function dayKey(date) {
    return [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ][date.getDay()];
  }


  function todayClasses(routine) {

    const day = dayKey(new Date());

    const schedule =
      routine.schedule || {};

    const entries =
      Array.isArray(schedule[day])
        ? schedule[day]
        : Array.isArray(schedule[
            day.charAt(0).toUpperCase() +
            day.slice(1)
          ])
          ? schedule[
              day.charAt(0).toUpperCase() +
              day.slice(1)
            ]
          : [];

    return entries.map(function (entry) {

      const period =
        Array.isArray(routine.periods)
          ? routine.periods.find(
              p => p.id === entry.periodId
            )
          : null;

      const subject =
        Array.isArray(routine.subjects)
          ? routine.subjects.find(
              s => s.id === entry.subjectId
            )
          : null;

      return {
        entry,
        period,
        subject
      };

    });
  }


  function renderDashboard(routine) {

    const panel =
      document.getElementById(
        "workspacePanel"
      );

    if (!panel) return;

    const subjects =
      Array.isArray(routine.subjects)
        ? routine.subjects
        : [];

    const periods =
      Array.isArray(routine.periods)
        ? routine.periods
        : [];

    const classes =
      todayClasses(routine);

    const schedule =
      routine.schedule || {};

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    let totalClasses = 0;

    days.forEach(function (day) {
      const key =
        day.toLowerCase();

      const list =
        Array.isArray(schedule[key])
          ? schedule[key]
          : Array.isArray(schedule[day])
            ? schedule[day]
            : [];

      totalClasses += list.length;
    });


    const todayName =
      new Date().toLocaleDateString(
        "en-US",
        { weekday:"long" }
      );


    const firstClass =
      classes[0] || null;


    let todayHTML = "";

    if (!classes.length) {

      todayHTML =
        '<div class="empty" style="padding:24px">' +
          '<div class="empty-icon">☕</div>' +
          '<strong>No classes scheduled for ' +
          escapeHtml(todayName) +
          '.</strong><br>' +
          '<span>Your timetable is clear today.</span>' +
        '</div>';

    } else {

      todayHTML =
        '<div class="today-list">' +

          classes.map(function (item) {

            const p =
              item.period || {};

            const s =
              item.subject || {};

            const time =
              p.start && p.end
                ? p.start + " – " + p.end
                : "Scheduled";

            return (
              '<div class="class-row">' +

                '<div class="class-time">' +
                  escapeHtml(time) +
                '</div>' +

                '<div>' +
                  '<div class="class-name">' +
                    escapeHtml(
                      s.name ||
                      s.title ||
                      "Class"
                    ) +
                  '</div>' +

                  '<div class="class-sub">' +
                    escapeHtml(
                      s.teacher ||
                      s.faculty ||
                      ""
                    ) +
                  '</div>' +
                '</div>' +

                '<span class="class-badge">' +
                  escapeHtml(
                    p.room ||
                    p.type ||
                    "Class"
                  ) +
                '</span>' +

              '</div>'
            );

          }).join("") +

        '</div>';
    }


    const weekHTML =
      days.map(function (day) {

        const key =
          day.toLowerCase();

        const list =
          Array.isArray(schedule[key])
            ? schedule[key]
            : Array.isArray(schedule[day])
              ? schedule[day]
              : [];

        const width =
          Math.min(
            100,
            Math.max(
              10,
              list.length * 18
            )
          );

        const active =
          day === todayName
            ? " active"
            : "";

        return (
          '<div class="day-card' +
            active +
          '">' +

            '<div class="day-name">' +
              day.slice(0,3) +
            '</div>' +

            '<div class="day-count">' +
              list.length +
              ' classes' +
            '</div>' +

            '<div class="day-bar">' +
              '<i style="width:' +
                width +
              '%"></i>' +
            '</div>' +

          '</div>'
        );

      }).join("");


    panel.innerHTML =

      '<div class="dashboard-shell">' +

        '<div class="dashboard-main">' +

          '<section class="welcome">' +

            '<small>' +
              escapeHtml(
                institutionName(routine)
              ) +
            '</small>' +

            '<h3>' +
              escapeHtml(
                routine.name ||
                "Your routine"
              ) +
            '</h3>' +

            '<p>' +
              escapeHtml(
                courseName(routine) ||
                "Your personal timetable workspace"
              ) +
            '</p>' +

            '<div class="dashboard-actions">' +

              '<button class="btn" onclick="openEditor()"><i data-lucide="pencil"></i> Edit</button>' +
              '<button class="btn" onclick="openViewer()"><i data-lucide="eye"></i> Timetable</button>' +
              '<button class="btn" onclick="openCalendar()"><i data-lucide="calendar-days"></i> Calendar</button>' +
              '<button class="btn" onclick="openAnalytics()"><i data-lucide="chart-no-axes-combined"></i> Analytics</button>' +

            '</div>' +

          '</section>' +


          '<section class="stats-grid">' +

            '<div class="stat-card">' +
              '<span>Subjects</span>' +
              '<strong>' +
                subjects.length +
              '</strong>' +
              '<em>in this routine</em>' +
            '</div>' +

            '<div class="stat-card">' +
              '<span>Periods</span>' +
              '<strong>' +
                periods.length +
              '</strong>' +
              '<em>defined slots</em>' +
            '</div>' +

            '<div class="stat-card">' +
              '<span>Weekly classes</span>' +
              '<strong>' +
                totalClasses +
              '</strong>' +
              '<em>scheduled entries</em>' +
            '</div>' +

            '<div class="stat-card">' +
              '<span>Today</span>' +
              '<strong>' +
                classes.length +
              '</strong>' +
              '<em>' +
                escapeHtml(todayName) +
              '</em>' +
            '</div>' +

          '</section>' +


          '<section class="panel">' +

            '<div class="panel-title">' +
              '<h3>Today</h3>' +
              '<span>' +
                escapeHtml(todayName) +
              '</span>' +
            '</div>' +

            (
              firstClass
                ? '<div class="next-class">' +
                    '<div class="label">NEXT UP</div>' +
                    '<h4>' +
                      escapeHtml(
                        (
                          firstClass.subject || {}
                        ).name ||
                        (
                          firstClass.subject || {}
                        ).title ||
                        "Scheduled class"
                      ) +
                    '</h4>' +
                    '<p>' +
                      escapeHtml(
                        (
                          firstClass.period || {}
                        ).start || ""
                      ) +
                      (
                        (
                          firstClass.period || {}
                        ).end
                          ? " – " +
                            (
                              firstClass.period || {}
                            ).end
                          : ""
                      ) +
                    '</p>' +
                  '</div>'
                : ""
            ) +

            '<div style="margin-top:12px">' +
              todayHTML +
            '</div>' +

          '</section>' +


          '<section class="panel">' +

            '<div class="panel-title">' +
              '<h3>Week overview</h3>' +
              '<span>Classes by day</span>' +
            '</div>' +

            '<div class="week-grid">' +
              weekHTML +
            '</div>' +

          '</section>' +

        '</div>' +


        '<aside class="dashboard-side">' +

          '<section class="panel">' +

            '<div class="panel-title">' +
              '<h3>Quick actions</h3>' +
              '<span>Workspace</span>' +
            '</div>' +

            '<div class="quick-actions">' +

              '<button class="quick-action" onclick="openEditor()">' +
                '<b><i data-lucide="pencil"></i> Edit routine</b>' +
                '<span>Change subjects & periods</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openViewer()">' +
                '<b><i data-lucide="eye"></i> View timetable</b>' +
                '<span>Open the full timetable</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openSearch()">' +
                '<b>🔎 Search</b>' +
                '<span>Find schedule entries</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openTemplates()">' +
                '<b>📋 Templates</b>' +
                '<span>Start from a template</span>' +
              '</button>' +

              '<button class="quick-action" onclick="shareRoutine()">' +
                '<b><i data-lucide="link-2"></i> Share</b>' +
                '<span>Share your routine</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openBackup()">' +
                '<b><i data-lucide="hard-drive"></i> Backup</b>' +
                '<span>Protect your workspace</span>' +
              '</button>' +

            '</div>' +

          '</section>' +


          '<section class="panel">' +

            '<div class="panel-title">' +
              '<h3>Workspace tools</h3>' +
              '<span>More</span>' +
            '</div>' +

            '<div class="quick-actions">' +

              '<button class="quick-action" onclick="openNotifications()">' +
                '<b><i data-lucide="bell"></i> Notifications</b>' +
                '<span>Reminder controls</span>' +
              '</button>' +

              '<button class="quick-action" onclick="printRoutine()">' +
                '<b><i data-lucide="printer"></i> Print</b>' +
                '<span>Printable timetable</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openAnalytics()">' +
                '<b><i data-lucide="chart-no-axes-combined"></i> Analytics</b>' +
                '<span>Schedule insights</span>' +
              '</button>' +

              '<button class="quick-action" onclick="openSettings()">' +
                '<b><i data-lucide="settings"></i> Settings</b>' +
                '<span>Customize workspace</span>' +
              '</button>' +

            '</div>' +

          '</section>' +

        '</aside>' +

      '</div>';


    /* The workspace shell owns this dashboard surface. */
  }


  window.openRoutineWorkspace =
    function (id) {

      const a = app();

      if (!a) {
        notify(
          "Routine engine is still loading."
        );
        return;
      }

      if (a.state) {
        a.state.activeRoutineId = id;
      }

      const routine =
        routines().find(function (r) {
          return r.id === id;
        });

      if (!routine) {
        notify("Routine not found.");
        return;
      }

      window.MyRoutineIndex.workspaceOpen = true;

      document.getElementById(
        "homeApp"
      ).style.display = "none";

      document.getElementById(
        "workspace"
      ).style.display = "block";

      document.getElementById(
        "workspaceName"
      ).textContent =
        routine.name || "MyRoutine";

      document.getElementById(
        "workspaceMeta"
      ).textContent =
        institutionName(routine) +
        (
          courseName(routine)
            ? " · " + courseName(routine)
            : ""
        );

      renderDashboard(routine);
    };


  window.closeWorkspace =
    function () {

      window.MyRoutineIndex.workspaceOpen = false;

      document.getElementById(
        "workspace"
      ).style.display = "none";

      document.getElementById(
        "homeApp"
      ).style.display = "block";

      renderRoutines();
    };


  /* =====================================================
     MODULE BRIDGES
     ===================================================== */

  function callModule(
    objectName,
    method,
    args,
    message
  ) {

    const object =
      window[objectName];

    if (
      object &&
      typeof object[method] === "function"
    ) {

      try {

        return object[method].apply(
          object,
          args || []
        );

      } catch (error) {

        console.error(
          objectName + "." + method,
          error
        );

        notify(
          message ||
          "This feature needs a little more setup."
        );
      }
    }

    notify(
      message ||
      "This feature is unavailable."
    );

    return null;
  }


  window.openEditor = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    callModule(
      "MyRoutineEditor",
      "open",
      [r.id],
      "Editor module is unavailable."
    );
  };


  window.openModuleTool = function (id) {
    const allowed = new Set([
      "mr-task-launch",
      "mr-daily-launch",
      "mr-smart-launch",
      "mr-command-launch",
      "mr-analytics-launch"
    ]);
    if (!allowed.has(id)) return;
    const launch = document.getElementById(id);
    if (launch && typeof launch.click === "function") {
      launch.click();
      return;
    }
    notify("This tool is still loading. Please try again in a moment.");
  };


  window.openOverview = function () {
    const routine = activeRoutine();
    if (!routine) return;
    renderDashboard(routine);
    const panel = document.getElementById("workspacePanel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  window.openViewer = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    callModule(
      "MyRoutineViewer",
      "open",
      [r.id],
      "Viewer module is unavailable."
    );
  };


  window.openSettings = function () {

    const r = activeRoutine();

    callModule(
      "MyRoutineSettings",
      "open",
      r ? [r.id] : [],
      "Settings module is unavailable."
    );
  };


  window.openCalendar = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    callModule(
      "MyRoutineCalendar",
      "open",
      [r.id],
      "Calendar module is unavailable."
    );
  };


  window.openSearch = function () {

    callModule(
      "MyRoutineSearch",
      "open",
      [],
      "Search module is unavailable."
    );
  };


  window.openTemplates = function () {

    callModule(
      "MyRoutineTemplates",
      "open",
      [],
      "Template module is unavailable."
    );
  };


  window.openAnalytics = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    if (
      window.MyRoutineAnalytics &&
      typeof window.MyRoutineAnalytics.generateReport === "function"
    ) {

      try {

        const report =
          window.MyRoutineAnalytics.generateReport();

        if (report) {

          alert(
            "Analytics\n\n" +
            "Subjects: " +
            report.basic.subjects +
            "\nPeriods: " +
            report.basic.periods +
            "\nWeekly classes: " +
            report.basic.scheduledClasses +
            "\nTeachers: " +
            report.basic.teachers +
            "\nRooms: " +
            report.basic.rooms +
            "\nSchedule usage: " +
            report.scheduleDensity.percentage +
            "%"
          );

          return;
        }

      } catch (error) {
        console.error(error);
      }
    }

    callModule(
      "MyRoutineAnalytics",
      "open",
      [r.id],
      "Analytics module is unavailable."
    );
  };


  window.shareRoutine = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    callModule(
      "MyRoutineShare",
      "open",
      [r.id],
      "Share module is unavailable."
    );
  };


  window.printRoutine = function () {

    const r = activeRoutine();

    if (!r) {
      notify("Select a routine first.");
      return;
    }

    callModule(
      "MyRoutinePrint",
      "open",
      [r.id],
      "Print module is unavailable."
    );
  };


  window.openNotifications = function () {

    callModule(
      "MyRoutineNotifications",
      "open",
      [],
      "Notification module is unavailable."
    );
  };


  window.openBackup = function () {

    callModule(
      "MyRoutineBackup",
      "open",
      [],
      "Backup module is unavailable."
    );
  };


  window.deleteRoutine = function (id) {

    const routine =
      routines().find(function (r) {
        return r.id === id;
      });

    if (!routine) return;

    if (
      !confirm(
        'Delete "' +
        (routine.name || "this routine") +
        '"?'
      )
    ) {
      return;
    }

    const a = app();

    if (
      a &&
      typeof a.deleteRoutine === "function"
    ) {

      a.deleteRoutine(id);

      renderRoutines();

      notify("Routine deleted.");

      return;
    }

    notify(
      "Delete function is unavailable."
    );
  };


  window.duplicateRoutine = function (id) {

    const a = app();

    if (
      a &&
      typeof a.duplicateRoutine === "function"
    ) {

      a.duplicateRoutine(id);

      renderRoutines();

      notify("Routine duplicated.");

      return;
    }

    notify(
      "Duplicate function is unavailable."
    );
  };


  /* Keep the workspace navigation's current tool discoverable. */
  document.addEventListener("click", function (event) {
    const item = event.target && event.target.closest
      ? event.target.closest("[data-mr-nav]")
      : null;
    if (!item) return;
    document.querySelectorAll(".workspace-nav-item[aria-current='page']")
      .forEach(function (node) { node.removeAttribute("aria-current"); });
    item.setAttribute("aria-current", "page");
  });

  /* =====================================================
     EVENTS / INITIALIZATION
     ===================================================== */

  function initialize() {

    renderRoutines();

    document.addEventListener(
      "myroutine:ready",
      function () {

        renderRoutines();

        const current =
          activeRoutine();

        if (
          window.MyRoutineIndex.workspaceOpen &&
          current
        ) {
          renderDashboard(current);
        }

      }
    );


    [
      "myroutine:changed",
      "myroutine:updated",
      "myroutine:saved"
    ].forEach(function (eventName) {

      document.addEventListener(
        eventName,
        function () {

          renderRoutines();

          if (
            window.MyRoutineIndex.workspaceOpen
          ) {

            const current =
              activeRoutine();

            if (current) {
              renderDashboard(current);
            }
          }

        }
      );

    });


    /*
     * The core loads asynchronously.
     * These short retries make the UI resilient
     * to script-loading order and cached pages.
     */
    let attempts = 0;

    const sync =
      setInterval(function () {

        renderRoutines();

        attempts++;

        if (
          routines().length > 0 ||
          attempts >= 20
        ) {
          clearInterval(sync);
        }

      }, 500);


    window.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          document
            .querySelectorAll(
              ".modal-backdrop.open"
            )
            .forEach(function (modal) {
              modal.classList.remove("open");
            });
        }

        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "n"
        ) {

          event.preventDefault();

          openCreateModal();
        }

      }
    );
  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();
