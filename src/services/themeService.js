import { getSettings } from "./settingsService.js";

export function ensureThemeApplied() {
  const s = getSettings();
  setTheme(s.theme);
}

export function setTheme(theme) {
  const root = document.documentElement;
  const t = theme === "light" ? "light" : "dark";
  root.setAttribute("data-theme", t);

  // optional: update meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#f5f7ff" : "#0b1020");
}
