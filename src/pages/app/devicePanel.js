import { getDeviceInfo } from "../../services/deviceService.js";
import { checkInternet } from "../../services/internetService.js";

export function renderDevicePanel(mountEl, state) {
  if (!mountEl) return;

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Device</h2>
        <span class="kbd">live</span>
      </div>
      <div class="cardBody">
        <div id="deviceStatus" style="color:var(--muted);font-size:13px">Loading…</div>

        <div class="deviceGrid" style="margin-top:12px;display:none">
          <div class="field" style="margin-bottom:10px">
            <label>Summary</label>
            <div id="deviceSummary" style="font-size:14.5px">—</div>
          </div>

          <div class="grid2">
            <div class="field">
              <label>Language</label>
              <div id="deviceLang" style="font-size:14.5px">—</div>
            </div>
            <div class="field">
              <label>Timezone</label>
              <div id="deviceTz" style="font-size:14.5px">—</div>
            </div>
          </div>

          <div class="grid2" style="margin-top:12px">
            <div class="field">
              <label>Memory</label>
              <div id="deviceMem" style="font-size:14.5px">—</div>
            </div>
            <div class="field">
              <label>Screen</label>
              <div id="deviceScreen" style="font-size:14.5px">—</div>
            </div>
          </div>

          <div class="field" style="margin-top:12px">
            <label>Internet connectivity</label>
            <div id="internetStatus" style="color:var(--muted);font-size:14.5px">—</div>
          </div>

          <div class="row" style="margin-top:10px">
            <button class="btn" id="internetRefresh" aria-label="Recheck internet">Recheck</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const statusEl = mountEl.querySelector("#deviceStatus");
  const gridEl = mountEl.querySelector(".deviceGrid");
  const refreshBtn = mountEl.querySelector("#internetRefresh");

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setInternetText(online, reachable) {
    const internetEl = mountEl.querySelector("#internetStatus");
    if (!internetEl) return;

    if (online === false && reachable === false) {
      internetEl.textContent = "Offline";
      internetEl.style.color = "var(--danger)";
      return;
    }

    if (online === true && reachable === true) {
      internetEl.textContent = "Online";
      internetEl.style.color = "var(--ok)";
      return;
    }

    // ambiguous
    internetEl.textContent = "No internet (online false/unknown)";
    internetEl.style.color = "var(--muted)";
  }

  async function load() {
    setStatus("Detecting device…");
    const info = getDeviceInfo();

    if (mountEl.querySelector("#deviceSummary")) {
      const summary = [info.platform, info.isMobile ? "Mobile" : "Desktop"]
        .filter(Boolean)
        .join(" · ");
      mountEl.querySelector("#deviceSummary").textContent =
        summary || "Unknown device";
    }

    if (mountEl.querySelector("#deviceLang"))
      mountEl.querySelector("#deviceLang").textContent = info.language || "—";
    if (mountEl.querySelector("#deviceTz"))
      mountEl.querySelector("#deviceTz").textContent = info.timezone || "—";
    if (mountEl.querySelector("#deviceMem"))
      mountEl.querySelector("#deviceMem").textContent = info.deviceMemory
        ? `${info.deviceMemory} GB`
        : "—";
    if (mountEl.querySelector("#deviceScreen"))
      mountEl.querySelector("#deviceScreen").textContent = info.screen || "—";

    if (gridEl) gridEl.style.display = "block";
    setStatus("Checking internet…");

    const net = await checkInternet();
    setInternetText(net.online, net.reachable);
    setStatus("");
  }

  load();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => load());
  }

  return () => {
    if (refreshBtn) refreshBtn.onclick = null;
  };
}
