# Diana - Implementation TODO

## Current state (Phase 1)

- [x] theme management (light/dark) + persist in localStorage
- [x] settings panel scaffolding (theme + sound alerts)
- [x] user profile onboarding (full name + nickname, default "Bruce") persisted in localStorage
- [x] greeting system (time-based) sets Diana mood (mood mapping scaffolding)
- [x] responsive layout scaffolding
- [x] basic Diana UI card renders greeting and mood preview

## Phase 2 (Missing features to implement)

### A. Diana animation & interaction

- [ ] Mouse-follow pointer (avatar position/eyes follow pointer)
- [ ] Lively moods (CSS class + behavior changes over time)
- [ ] Ensure Diana stays responsive on all screen sizes

### B. Clock & timeline

- [ ] Clock panel: analog + digital + timeline + seconds
- [ ] Clock style selection list (persist in settings)

### C. Weather

- [ ] Weather service using Open-Meteo (no API key), IP geolocation
- [ ] Weather panel displays current conditions

### D. Device + network

- [ ] Device info panel (browser/device details)
- [ ] Internet connectivity status (navigator.onLine + lightweight fetch check)

### E. Snake game

- [ ] Integrate keyboard-arrow snake game (canvas) into dashboard
- [ ] Responsive canvas sizing

### F. Task helper + reminders + achievements

- [ ] Task helper panel:
  - [ ] Collect objective + due time (and "by what time")
  - [ ] Start task: timer
  - [ ] Stop task: duration + remarks
  - [ ] Persist achievements (localStorage)
- [ ] Reminder system (in-page notification/banner, optional Notification API)

## Implementation checklist

- [ ] Add new modules (services/panels/components) as needed
- [ ] Update `renderShell.js` to mount all panels
- [ ] Update `settingsPanel.js` to support clock style / weather units / reminder options
- [ ] Update CSS to support new panels, animations, and themes
