# Phase 2 Implementation Plan (DIANA)

## Information gathered

- `weatherPanel.js`, `devicePanel.js`, `snakePanel.js`, `taskHelperPanel.js` are placeholders.
- `settingsService.js` already defines `clockStyle`, `weatherUnit`, `reminderStyle`.
- `clockPanel.js` exists and renders analog/digital/timeline and persists clock style.
- `renderShell.js` already mounts `#weatherMount`, `#deviceMount`, `#snakeMount`, `#taskMount`.

## Plan

1. Weather
   - Create `services/ipService.js` to fetch approximate geolocation from an IP endpoint.
   - Create `services/weatherService.js` to call Open-Meteo current weather.
   - Implement `renderWeatherPanel` UI: location, temp, conditions, units toggle (from settings), loading/error states.
2. Device + network
   - Implement `renderDevicePanel`: user agent, platform, language, device memory (where available).
   - Implement `internet status` widget: `navigator.onLine` plus a lightweight fetch (e.g., `https://www.google.com/generate_204`) with timeout.
3. Snake game
   - Implement `snakePanel.js` as canvas-based snake game with arrow keys.
   - Add responsive canvas sizing based on mount width.
4. Task helper + reminders + achievements
   - Implement task helper UI: objective + due time (time input), start/stop, remarks.
   - Persist tasks/achievements in `localStorage` via a new `services/taskService.js`.
   - Implement reminder system using in-page banner and optional Notification API (based on settings).
5. Settings + wiring + CSS
   - Update `settingsPanel.js` to include `weatherUnit` and reminder options (if currently absent).
   - Add CSS rules for the new panel layouts and components.
6. Verification
   - Syntax check modules, then run the app and manually verify:
     - Weather loads and displays.
     - Device/network status updates.
     - Snake runs and is responsive.
     - Task helper starts/stops, persists achievements, reminders appear.
