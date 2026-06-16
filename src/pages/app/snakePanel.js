export function renderSnakePanel(mountEl, state) {
  if (!mountEl) return;

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Snake</h2>
        <span class="kbd">play</span>
      </div>
      <div class="cardBody">
        <div style="color:var(--muted);font-size:12px;line-height:1.4;margin-bottom:10px">
          Use <b>Arrow Keys</b> to steer. Press <b>Space</b> to pause/resume.
        </div>

        <div class="snakeBoardWrap" style="width:100%">
          <canvas id="snakeCanvas" style="width:100%;height:260px;border-radius:12px;display:block;border:1px solid var(--border);background:rgba(255,255,255,0.02)" aria-label="Snake game" role="img"></canvas>
        </div>

        <div class="row" style="justify-content:space-between;margin-top:10px">
          <div style="color:var(--muted);font-size:13px">Score: <b id="snakeScore">0</b></div>
          <div class="row" style="gap:10px">
            <button class="btn" id="snakeStart">Start</button>
            <button class="btn" id="snakePause" disabled>Pause</button>
          </div>
        </div>

        <div style="color:var(--muted);font-size:12px;margin-top:10px">
          Responsive: canvas scales to container width.
        </div>
      </div>
    </div>
  `;

  const canvas = mountEl.querySelector("#snakeCanvas");
  const scoreEl = mountEl.querySelector("#snakeScore");
  const startBtn = mountEl.querySelector("#snakeStart");
  const pauseBtn = mountEl.querySelector("#snakePause");

  const ctx = canvas.getContext("2d");

  // Game configuration
  const CELL_MIN = 10;
  const SPEED_BASE_MS = 95; // lower is faster

  let rafId = null;
  let tickTimeoutId = null;

  let running = false;
  let paused = false;

  let grid = { cols: 24, rows: 18, cell: 12, w: 0, h: 0 };

  let snake = [];
  let dir = { x: 1, y: 0 };
  let queuedDir = null;
  let food = { x: 10, y: 8 };
  let score = 0;
  let lastTickAt = 0;
  let tickMs = SPEED_BASE_MS;

  const COLORS = {
    bg: "rgba(255,255,255,0.02)",
    grid: "rgba(255,255,255,0.04)",
    snake: "rgba(124,92,255,0.95)",
    snakeGlow: "rgba(124,92,255,0.25)",
    food: "rgba(33,212,253,0.95)",
    foodGlow: "rgba(33,212,253,0.22)",
    text: "var(--text)",
  };

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function resize() {
    // Convert CSS pixels to device pixels
    const rect = canvas.getBoundingClientRect();
    const cssW = Math.max(280, rect.width);
    const cssH = Math.max(220, rect.height);

    // Determine cell size so grid fits nicely
    const cell = clamp(Math.floor(Math.min(cssW, cssH) / 20), CELL_MIN, 16);
    const cols = Math.max(14, Math.floor(cssW / cell));
    const rows = Math.max(12, Math.floor(cssH / cell));

    grid = {
      cols,
      rows,
      cell,
      w: cols * cell,
      h: rows * cell,
    };

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(grid.w * dpr);
    canvas.height = Math.floor(grid.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetGame() {
    resize();

    // start centered
    const cx = Math.floor(grid.cols / 2);
    const cy = Math.floor(grid.rows / 2);

    snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];

    dir = { x: 1, y: 0 };
    queuedDir = null;

    score = 0;
    tickMs = SPEED_BASE_MS;
    scoreEl.textContent = String(score);

    // random food not on snake
    placeFood();

    state.snake.running = false;
    state.snake.score = score;
    running = false;
    paused = false;

    if (pauseBtn) {
      pauseBtn.disabled = true;
      pauseBtn.textContent = "Pause";
    }
  }

  function placeFood() {
    // naive random with collision check
    const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));

    for (let tries = 0; tries < 2000; tries++) {
      const x = Math.floor(Math.random() * grid.cols);
      const y = Math.floor(Math.random() * grid.rows);
      if (!occupied.has(`${x},${y}`)) {
        food = { x, y };
        return;
      }
    }

    // fallback
    food = { x: 0, y: 0 };
  }

  function drawGrid() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, grid.w, grid.h);

    // subtle grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let x = 0; x <= grid.cols; x++) {
      const px = x * grid.cell;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, grid.h);
      ctx.stroke();
    }
    for (let y = 0; y <= grid.rows; y++) {
      const py = y * grid.cell;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(grid.w, py);
      ctx.stroke();
    }
  }

  function drawFood() {
    const s = grid.cell;
    const x = food.x * s;
    const y = food.y * s;

    // glow
    ctx.fillStyle = COLORS.foodGlow;
    ctx.fillRect(x + 2, y + 2, s - 4, s - 4);

    // core
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
  }

  function drawSnake() {
    const s = grid.cell;

    snake.forEach((p, idx) => {
      const x = p.x * s;
      const y = p.y * s;

      // glow
      ctx.fillStyle = COLORS.snakeGlow;
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

      // body
      ctx.fillStyle = COLORS.snake;
      const pad = idx === 0 ? 3 : 4;
      ctx.fillRect(x + pad, y + pad, s - pad * 2, s - pad * 2);
    });
  }

  function draw() {
    drawGrid();
    drawFood();
    drawSnake();
  }

  function step() {
    if (!running || paused) return;

    if (queuedDir) {
      dir = queuedDir;
      queuedDir = null;
    }

    const head = snake[0];
    const next = { x: head.x + dir.x, y: head.y + dir.y };

    // collisions (walls)
    if (
      next.x < 0 ||
      next.x >= grid.cols ||
      next.y < 0 ||
      next.y >= grid.rows
    ) {
      gameOver();
      return;
    }

    // collisions (self)
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === next.x && snake[i].y === next.y) {
        gameOver();
        return;
      }
    }

    snake.unshift(next);

    const ate = next.x === food.x && next.y === food.y;
    if (ate) {
      score += 1;
      state.snake.score = score;
      scoreEl.textContent = String(score);

      // speed up slightly
      tickMs = Math.max(
        45,
        Math.floor(SPEED_BASE_MS * 0.97 ** Math.min(50, score)),
      );

      placeFood();

      state.snake.running = true;
    } else {
      snake.pop();
    }
  }

  function gameOver() {
    running = false;
    paused = false;
    state.snake.running = false;

    if (pauseBtn) {
      pauseBtn.disabled = true;
      pauseBtn.textContent = "Pause";
    }

    if (startBtn) startBtn.disabled = false;

    // show simple status using score element
    scoreEl.textContent = `× ${score}`;
  }

  function scheduleLoop() {
    const loop = (ts) => {
      if (!running) return;
      // use time-based stepping for smoothness
      if (!lastTickAt) lastTickAt = ts;
      const elapsed = ts - lastTickAt;
      if (elapsed >= tickMs) {
        // potentially catch up
        const steps = Math.floor(elapsed / tickMs);
        for (let i = 0; i < steps; i++) step();
        lastTickAt = ts;
      }
      draw();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    resetGame();

    running = true;
    paused = false;
    state.snake.running = true;

    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) {
      pauseBtn.disabled = false;
      pauseBtn.textContent = "Pause";
    }

    lastTickAt = 0;
    scheduleLoop();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    state.snake.running = !paused;
    if (pauseBtn) pauseBtn.textContent = paused ? "Resume" : "Pause";
    if (!paused) {
      lastTickAt = 0; // prevent big catch-up
      scheduleLoop();
    }
  }

  function setDir(nx, ny) {
    // avoid reversing
    if (!running) return;
    if (nx === -dir.x && ny === -dir.y) return;
    queuedDir = { x: nx, y: ny };
  }

  function onKeyDown(e) {
    const key = e.key;

    if (key === " " || key === "Spacebar" || key === "Space") {
      e.preventDefault();
      togglePause();
      return;
    }

    if (key === "ArrowUp") {
      e.preventDefault();
      setDir(0, -1);
    } else if (key === "ArrowDown") {
      e.preventDefault();
      setDir(0, 1);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      setDir(-1, 0);
    } else if (key === "ArrowRight") {
      e.preventDefault();
      setDir(1, 0);
    }
  }

  const onResize = () => {
    // Keep game playable by resizing + restarting.
    if (running) {
      // Soft restart
      resetGame();
      running = true;
      paused = false;
      state.snake.running = true;
      if (startBtn) startBtn.disabled = true;
      if (pauseBtn) pauseBtn.disabled = false;
      lastTickAt = 0;
      scheduleLoop();
    } else {
      draw();
    }
  };

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown, { passive: false });

  startBtn?.addEventListener("click", start);
  pauseBtn?.addEventListener("click", togglePause);

  // initial render
  resize();
  resetGame();
  draw();

  return () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown);
    if (rafId) cancelAnimationFrame(rafId);
    if (tickTimeoutId) clearTimeout(tickTimeoutId);

    if (startBtn) startBtn.onclick = null;
    if (pauseBtn) pauseBtn.onclick = null;

    running = false;
    paused = false;
  };
}
