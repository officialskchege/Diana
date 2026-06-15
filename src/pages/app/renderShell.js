export function renderShell(root, state) {
  root.innerHTML = "";

  const container = document.createElement("div");
  container.className = "container";

  container.appendChild(renderDianaCard(state));
  container.appendChild(renderMainCard(state));

  root.appendChild(container);
}

function renderDianaCard(state) {
  const card = document.createElement("section");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "cardHeader";
  header.innerHTML = `<h2>Diana</h2><span class="kbd" title="Interactive companion">living</span>`;

  const body = document.createElement("div");
  body.className = "dianaWrap cardBody";
  body.appendChild(renderScene(state));

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function renderScene(state) {
  const scene = document.createElement("div");
  scene.className = "dianaScene";

  const canvas = document.createElement("div");
  canvas.className = "dianaCanvas";

  const avatar = document.createElement("div");
  avatar.className = "avatar isIdle blink";
  avatar.dataset.mood = state.mood || "neutral";

  const bangs = document.createElement("div");
  bangs.className = "bangs";

  const earL = document.createElement("div");
  earL.className = "ear left";

  const earR = document.createElement("div");
  earR.className = "ear right";

  const eyes = document.createElement("div");
  eyes.className = "eyes";
  eyes.innerHTML = `<div class="eye" aria-hidden="true"></div><div class="eye" aria-hidden="true"></div>`;

  const mouth = document.createElement("div");
  mouth.className = "mouth";
  mouth.innerHTML = `<div class="line" aria-hidden="true"></div>`;

  avatar.appendChild(bangs);
  avatar.appendChild(earL);
  avatar.appendChild(earR);
  avatar.appendChild(eyes);
  avatar.appendChild(mouth);

  canvas.appendChild(avatar);

  const bubbles = document.createElement("div");
  bubbles.className = "bubbles";
  bubbles.innerHTML = `<div class="bubble"></div><div class="bubble"></div><div class="bubble"></div>`;

  scene.appendChild(canvas);
  scene.appendChild(bubbles);

  const dialogue = document.createElement("div");
  dialogue.className = "dialogue";
  dialogue.innerHTML = `
    <div class="text">
      <div class="label">Greeting</div>
      <p id="dianaGreeting">${state.greetingText || ""}</p>
    </div>
  `;

  scene.appendChild(dialogue);

  return scene;
}

function renderMainCard(state) {
  const card = document.createElement("section");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "cardHeader";
  header.innerHTML = `<h2>Dashboard</h2><span class="kbd" title="Responsive UI">Phase 1</span>`;

  const body = document.createElement("div");
  body.className = "cardBody";

  body.innerHTML = `
    <div class="col" style="gap:14px">
      <div class="grid2">
        <div class="field">
          <label>Nickname</label>
          <input type="text" id="nicknamePreview" value="${state.profile?.nickname || "Bruce"}" disabled aria-label="Nickname preview" />
        </div>
        <div class="field">
          <label>Time-based mood</label>
          <input type="text" id="moodPreview" value="${state.mood || "Neutral"}" disabled aria-label="Mood preview" />
        </div>
      </div>

      <div id="onboardingMount"></div>
      <div id="settingsMount"></div>

      <div id="clockMount"></div>
      <div id="weatherMount"></div>
      <div id="deviceMount"></div>
      <div id="snakeMount"></div>
      <div id="taskMount"></div>

      <div style="color: var(--muted); font-size: 13px; line-height: 1.4">
        Diana is ready. Phase 2 will add: clock, weather, device/internet, snake, and task helper.
      </div>
    </div>
  `;

  card.appendChild(header);
  card.appendChild(body);
  return card;
}
