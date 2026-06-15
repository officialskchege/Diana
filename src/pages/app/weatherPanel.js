export function renderWeatherPanel(mountEl, state) {
  if (!mountEl) return;

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Weather</h2>
        <span class="kbd">soon</span>
      </div>
      <div class="cardBody">
        <div id="weatherStatus" style="color:var(--muted);font-size:13px">Not implemented yet.</div>
      </div>
    </div>
  `;
}
