import { getSettings } from "../../services/settingsService.js";
import { addAchievement, loadTasks } from "../../services/taskService.js";

function msToHMS(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}\u003e${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function formatDueLabel(date) {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
}

export function renderTaskHelperPanel(mountEl, state) {
  if (!mountEl) return;

  const mountAch = () => mountEl.querySelector("#achievementsList");

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Task Helper</h2>
        <span class="kbd">timer</span>
      </div>
      <div class="cardBody">
        <div id="taskStatus" style="color:var(--muted);font-size:13px">Ready</div>

        <div class="col" style="gap:12px">
          <div class="field">
            <label>Objective</label>
            <input id="taskObjective" type="text" placeholder="e.g. Draft outline" aria-label="Task objective" />
          </div>

          <div class="grid2">
            <div class="field">
              <label>Due time</label>
              <input id="taskDue" type="datetime-local" aria-label="Due time" />
            </div>
            <div class="field">
              <label>Timer</label>
              <div style="padding:10px 12px;border:1px solid var(--border);border-radius:12px;font-size:14.5px" id="taskTimer">00:00</div>
            </div>
          </div>

          <div class="row" style="justify-content:flex-end">
            <button class="btn" id="taskStart">Start</button>
            <button class="btn" id="taskStop" disabled>Stop</button>
          </div>

          <div class="field">
            <label>Remarks (optional)</label>
            <input id="taskRemarks" type="text" placeholder="What went well?" aria-label="Task remarks" />
          </div>

          <div style="display:flex;gap:10px;align-items:center;justify-content:space-between">
            <div style="color:var(--muted);font-size:12px;line-height:1.4">
              Achievements are stored in localStorage.
            </div>
            <div style="color:var(--muted);font-size:12px" id="dueLabel">Due: —</div>
          </div>

          <div style="margin-top:8px">
            <div style="color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:0.25px">Recent achievements</div>
            <div id="achievementsList" style="margin-top:8px" class="col"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const objectiveEl = mountEl.querySelector("#taskObjective");
  const dueEl = mountEl.querySelector("#taskDue");
  const timerEl = mountEl.querySelector("#taskTimer");
  const startBtn = mountEl.querySelector("#taskStart");
  const stopBtn = mountEl.querySelector("#taskStop");
  const remarksEl = mountEl.querySelector("#taskRemarks");
  const statusEl = mountEl.querySelector("#taskStatus");
  const dueLabelEl = mountEl.querySelector("#dueLabel");

  let intervalId = null;

  function setRunning(running) {
    state.task.running = running;
    if (startBtn) startBtn.disabled = running;
    if (stopBtn) stopBtn.disabled = !running;
  }

  function syncTimer() {
    const elapsedMs = state.task.elapsedMs;
    const h = Math.floor(elapsedMs / 3600000);
    const m = Math.floor((elapsedMs % 3600000) / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);
    timerEl.textContent =
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderAchievements() {
    const achievements = loadTasks().achievements;
    const list = mountAch();
    if (!list) return;

    list.innerHTML = "";
    if (!achievements.length) {
      const empty = document.createElement("div");
      empty.style.color = "var(--muted)";
      empty.style.fontSize = "13px";
      empty.textContent = "No achievements yet.";
      list.appendChild(empty);
      return;
    }

    achievements.slice(0, 5).forEach((a) => {
      const row = document.createElement("div");
      row.style.padding = "10px 12px";
      row.style.border = "1px solid var(--border)";
      row.style.borderRadius = "12px";
      row.style.background = "rgba(255,255,255,0.03)";

      row.innerHTML = `
        <div style="font-weight:650">${a.title}</div>
        <div style="color:var(--muted);font-size:12px;margin-top:2px">${a.objective}</div>
        <div style="color:var(--muted);font-size:12px;margin-top:6px">${Math.round(a.durationMs / 60000)} min • ${formatDueLabel(a.dueTime)}</div>
      `;
      list.appendChild(row);
    });
  }

  function setDueLabel(dueTime) {
    if (!dueLabelEl) return;
    dueLabelEl.textContent = `Due: ${formatDueLabel(dueTime)}`;
  }

  function parseDueValue() {
    const v = dueEl?.value;
    if (!v) return null;
    // datetime-local returns local time without TZ; convert to Date
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d.toISOString() : null;
  }

  function maybeTriggerReminder() {
    // lightweight: compare now to dueTime and show banner if within 1 minute
    const dueTimeIso = parseDueValue();
    if (!dueTimeIso) return;

    const dueMs = new Date(dueTimeIso).getTime();
    const nowMs = Date.now();
    const diff = dueMs - nowMs;

    if (diff <= 60000 && diff >= -60000) {
      const settings = getSettings();
      const style = settings.reminderStyle || "banner";

      const msg = `Due now: ${objectiveEl?.value?.trim() || "your task"}`;
      if (style === "notification" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Diana Task Reminder", { body: msg });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((p) => {
            if (p === "granted")
              new Notification("Diana Task Reminder", { body: msg });
          });
        }
      } else {
        // banner
        const banner = mountEl.querySelector("#taskReminderBanner");
        if (banner) banner.remove();
        const el = document.createElement("div");
        el.id = "taskReminderBanner";
        el.style.marginTop = "12px";
        el.style.padding = "12px";
        el.style.border = "1px solid var(--border)";
        el.style.borderRadius = "12px";
        el.style.background = "rgba(124,92,255,0.10)";
        el.style.color = "var(--text)";
        el.style.fontSize = "13px";
        el.textContent = msg;
        mountEl.querySelector(".cardBody").prepend(el);

        setTimeout(() => {
          try {
            el.remove();
          } catch {}
        }, 8000);
      }
    }
  }

  startBtn?.addEventListener("click", () => {
    const objective = objectiveEl?.value?.trim() || "(no objective)";
    const dueIso = parseDueValue();

    state.task.objective = objective;
    state.task.dueTime = dueIso ? new Date(dueIso) : null;
    state.task.startedAt = new Date();
    state.task.elapsedMs = 0;
    state.task.running = true;

    setDueLabel(dueIso);
    syncTimer();

    setRunning(true);
    if (statusEl) statusEl.textContent = "Working…";

    intervalId = setInterval(() => {
      state.task.elapsedMs = Date.now() - state.task.startedAt.getTime();
      syncTimer();
      maybeTriggerReminder();
    }, 250);
  });

  stopBtn?.addEventListener("click", () => {
    if (!state.task.running) return;

    state.task.running = false;
    if (intervalId) clearInterval(intervalId);
    intervalId = null;

    const endedAt = new Date();
    const elapsedMs = state.task.startedAt
      ? endedAt.getTime() - state.task.startedAt.getTime()
      : 0;

    state.task.elapsedMs = Math.max(0, elapsedMs);
    setRunning(false);

    const remarks = remarksEl?.value?.trim() || "";
    if (statusEl)
      statusEl.textContent = `Done. ${Math.round(elapsedMs / 60000)} min saved.`;

    // persist achievement
    const entry = addAchievement({
      objective: state.task.objective,
      durationMs: elapsedMs,
      dueTime: state.task.dueTime,
    });

    // reset timer UI but keep due label
    syncTimer();
    renderAchievements();

    // Optional: mild Diana mood trigger could be added later.
    // Store remarks in tasks log would be a Phase 2 extension.
  });

  dueEl?.addEventListener("change", () => {
    const dueIso = parseDueValue();
    setDueLabel(dueIso);
  });

  renderAchievements();

  // initial due label
  setDueLabel(parseDueValue());

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}
