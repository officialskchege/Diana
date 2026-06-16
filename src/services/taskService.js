const KEY = "diana:tasks";

export function loadTasks() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { achievements: [], tasks: [] };
    const parsed = JSON.parse(raw);
    return {
      achievements: Array.isArray(parsed?.achievements)
        ? parsed.achievements
        : [],
      tasks: Array.isArray(parsed?.tasks) ? parsed.tasks : [],
    };
  } catch {
    return { achievements: [], tasks: [] };
  }
}

export function saveTasks(next) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        achievements: next?.achievements || [],
        tasks: next?.tasks || [],
      }),
    );
  } catch {
    // ignore
  }
}

export function addAchievement({ objective, durationMs, dueTime }) {
  const achievements = loadTasks().achievements;

  const mins = Math.max(0, Math.round(durationMs / 60000));
  const title =
    mins >= 60
      ? "Deep Work"
      : mins >= 25
        ? "Focus Sprint"
        : mins >= 5
          ? "Getting Started"
          : "Quick Check";

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const entry = {
    id,
    title,
    objective: objective || "(no objective)",
    durationMs: durationMs || 0,
    mins,
    dueTime: dueTime ? new Date(dueTime).toISOString() : null,
    at: new Date().toISOString(),
  };

  const next = {
    achievements: [entry, ...achievements].slice(0, 50),
    tasks: loadTasks().tasks,
  };

  saveTasks(next);
  return entry;
}
