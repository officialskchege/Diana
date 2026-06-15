export function createAppState() {
  return {
    profile: null,
    greetingText: "",
    mood: "neutral",

    // Phase 2 state scaffolding
    clock: {
      now: new Date(),
      analogAngles: { hour: 0, minute: 0, second: 0 },
    },

    weather: {
      status: "idle", // idle|loading|ok|error
      error: null,
      data: null,
    },

    device: {
      info: null,
      online: null,
      verified: null,
    },

    task: {
      objective: "",
      dueTime: null, // Date
      startedAt: null, // Date
      elapsedMs: 0,
      running: false,
      achievements: [],
    },

    snake: {
      running: false,
      score: 0,
    },
  };
}

export function getGreetingForTime(date) {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}
