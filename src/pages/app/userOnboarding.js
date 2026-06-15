import { renderOnboardingForm } from "./userOnboardingUI.js";

export function getOrAskUserProfile({ profile, onSave }) {
  if (profile && profile.nickname) return;

  // Render onboarding in-place
  const mount = document.getElementById("onboardingMount");
  if (!mount) return;

  renderOnboardingForm(mount, {
    onSubmit: (next) => {
      onSave(next);
    },
  });

  return new Promise((resolve) => {
    mount.addEventListener("profile:submitted", () => resolve(), {
      once: true,
    });
  });
}
