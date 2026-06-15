export function moodFromGreeting(greeting) {
  const map = {
    "Good Morning": "excited",
    "Good Afternoon": "happy",
    "Good Evening": "thinking",
    "Good Night": "sleepy",
  };
  return map[greeting] || "neutral";
}

export function setMoodOnRoot(root, mood) {
  const avatar = root.querySelector(".avatar");
  if (avatar) avatar.dataset.mood = mood;

  const moodPreview = root.querySelector("#moodPreview");
  if (moodPreview)
    moodPreview.value =
      (mood || "neutral").charAt(0).toUpperCase() +
      (mood || "neutral").slice(1);
}
