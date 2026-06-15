import {
  loadUserProfile,
  saveUserProfile,
} from "../../services/userProfileService.js";
import { getSettings, saveSettings } from "../../services/settingsService.js";
import { setTheme } from "../../services/themeService.js";
import { moodFromGreeting, setMoodOnRoot } from "./moodEngine.js";

export function renderSettingsPanel(root, state) {
  const mount = root.querySelector("#settingsMount");
  if (!mount) return;

  const s = getSettings();
  mount.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Settings</h2>
        <span class="kbd">local</span>
      </div>
      <div class="cardBody">
        <div class="col" style="gap:14px">
          <div class="grid2">
            <div class="field">
              <label>Theme</label>
              <select id="themeSelect" aria-label="Theme">
                <option value="dark" ${s.theme === "dark" ? "selected" : ""}>Dark</option>
                <option value="light" ${s.theme === "light" ? "selected" : ""}>Light</option>
              </select>
            </div>
            <div class="field">
              <label>Sound alerts</label>
              <select id="soundSelect" aria-label="Sound alerts">
                <option value="on" ${s.soundAlerts ? "selected" : ""}>On</option>
                <option value="off" ${!s.soundAlerts ? "selected" : ""}>Off</option>
              </select>
            </div>
          </div>

          <div class="grid2">
            <div class="field">
              <label>Full Name</label>
              <input type="text" id="fullName" value="${state.profile?.fullName || "Bruce"}" />
            </div>
            <div class="field">
              <label>Nickname</label>
              <input type="text" id="nickname" value="${state.profile?.nickname || "Bruce"}" />
            </div>
          </div>

          <div class="row" style="justify-content:flex-end">
            <button class="btn btnPrimary" id="saveSettings">Save</button>
          </div>

          <div style="color: var(--muted); font-size: 13px; line-height: 1.4">
            Diana persists profile + settings using localStorage.
          </div>
        </div>
      </div>
    </div>
  `;
}

export function wireSettings(root, state) {
  const themeSelect = root.querySelector("#themeSelect");
  const soundSelect = root.querySelector("#soundSelect");
  const saveBtn = root.querySelector("#saveSettings");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const fullName =
        root.querySelector("#fullName")?.value?.trim() || "Bruce";
      const nickname =
        root.querySelector("#nickname")?.value?.trim() || "Bruce";

      state.profile = { fullName, nickname };
      saveUserProfile(state.profile);

      const next = getSettings();
      next.theme = themeSelect?.value || next.theme;
      next.soundAlerts = (soundSelect?.value || "on") === "on";

      saveSettings(next);
      setTheme(next.theme);

      // Update greeting
      const greet = root.querySelector("#dianaGreeting");
      const greeting = getGreetingForTime(new Date());
      const greetingText = `${greeting}, ${nickname}!`;
      if (greet) greet.textContent = greetingText;

      // Update nickname preview (dashboard)
      const nickPreview = root.querySelector("#nicknamePreview");
      if (nickPreview) nickPreview.value = nickname;

      // Mood follows greeting
      const mood = moodFromGreeting(greeting);
      state.mood = mood;
      setMoodOnRoot(root, mood);
    });
  }
}

function getGreetingForTime(date) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}
