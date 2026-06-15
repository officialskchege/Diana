const KEY = "diana:settings";

const defaults = {
  theme: "dark",
  soundAlerts: false,

  // Phase 2
  clockStyle: "digital", // "digital"|"classic"|"minimal"
  weatherUnit: "c", // "c"|"f"
  reminderStyle: "banner", // "banner"|"notification"
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}
