import { ensureThemeApplied } from "../../services/themeService.js";
import {
  loadUserProfile,
  saveUserProfile,
} from "../../services/userProfileService.js";
import { createAppState, getGreetingForTime } from "../../utils/appState.js";
import { renderShell } from "./renderShell.js";
import { moodFromGreeting, setMoodOnRoot } from "./moodEngine.js";
import { getOrAskUserProfile } from "./userOnboarding.js";
import { renderSettingsPanel, wireSettings } from "./settingsPanel.js";
import { renderClockPanel } from "./clockPanel.js";
import { renderWeatherPanel } from "./weatherPanel.js";
import { renderDevicePanel } from "./devicePanel.js";
import { renderSnakePanel } from "./snakePanel.js";
import { renderTaskHelperPanel } from "./taskHelperPanel.js";
import { wireDianaPointerFollow } from "./dianaPointerFollow.js";

export function mountApp(root) {
  if (!root) return;

  ensureThemeApplied();

  const state = createAppState();

  // Load user profile (or onboard if missing)
  const profile = loadUserProfile();
  state.profile = profile;

  const initialProfilePromise = getOrAskUserProfile({
    profile,
    onSave: (next) => {
      state.profile = next;
      saveUserProfile(next);
    },
  });

  Promise.resolve(initialProfilePromise).then(() => {
    const greeting = getGreetingForTime(new Date());
    const nickname = state.profile?.nickname || "Bruce";
    state.greetingText = `${greeting}, ${nickname}!`;

    state.mood = moodFromGreeting(greeting);

    renderShell(root, state);
    setMoodOnRoot(root, state.mood);

    // Settings
    renderSettingsPanel(root, state);
    wireSettings(root, state);

    // Phase 2 panels
    renderClockPanel(root.querySelector("#clockMount"), state);
    renderWeatherPanel(root.querySelector("#weatherMount"), state);
    renderDevicePanel(root.querySelector("#deviceMount"), state);
    renderSnakePanel(root.querySelector("#snakeMount"), state);
    renderTaskHelperPanel(root.querySelector("#taskMount"), state);

    // Diana mouse-follow pointer
    wireDianaPointerFollow(root);

    // Accessibility: simple focus management

    const firstFocusable = root.querySelector("input,select,button");
    if (firstFocusable) firstFocusable.focus({ preventScroll: true });
  });
}
