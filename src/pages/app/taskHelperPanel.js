export function renderTaskHelperPanel(mountEl, state) {
  if (!mountEl) return;

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Task Helper</h2>
        <span class="kbd">soon</span>
      </div>
      <div class="cardBody">
        <div style="color:var(--muted);font-size:13px">Not implemented yet.</div>
      </div>
    </div>
  `;
}
