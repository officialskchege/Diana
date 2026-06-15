const KEY = "diana:profile";

export function loadUserProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    return {
      fullName: parsed.fullName || "Bruce",
      nickname: parsed.nickname || "Bruce",
    };
  } catch {
    return null;
  }
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}
