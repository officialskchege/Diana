import { getSettings } from "../../services/settingsService.js";
import { getApproxLocationFromIP } from "../../services/ipService.js";
import {
  getCurrentWeather,
  formatWeather,
} from "../../services/weatherService.js";

export function renderWeatherPanel(mountEl, state) {
  if (!mountEl) return;

  const mountStatus = (text) => {
    const el = mountEl.querySelector("#weatherStatus");
    if (el) el.textContent = text;
  };

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Weather</h2>
        <span class="kbd">live</span>
      </div>
      <div class="cardBody">
        <div id="weatherStatus" style="color:var(--muted);font-size:13px">Loading…</div>
        <div class="weatherGrid" style="margin-top:12px;display:none">
          <div class="field" style="margin-bottom:8px">
            <label>Location</label>
            <div id="weatherLocation" style="font-size:14.5px">—</div>
          </div>

          <div class="weatherMain" style="display:flex;align-items:flex-start;gap:12px">
            <div style="font-size:34px;font-weight:700;line-height:1" id="weatherTemp">--°</div>
            <div style="flex:1">
              <div style="color:var(--muted);font-size:13px" id="weatherCondition">—</div>
              <div style="margin-top:8px;color:var(--muted);font-size:13px" id="weatherWind">—</div>
            </div>
          </div>
        </div>

        <div style="margin-top:10px;color:var(--muted);font-size:12px;line-height:1.4">
          Uses IP geolocation + Open-Meteo (no API key).
        </div>

        <div style="margin-top:10px" class="row">
          <button class="btn" id="weatherRefresh" aria-label="Refresh weather">Refresh</button>
        </div>
      </div>
    </div>
  `;

  const refreshBtn = mountEl.querySelector("#weatherRefresh");

  async function loadWeather() {
    const settings = getSettings();
    const unit = settings.weatherUnit === "f" ? "f" : "c";

    mountStatus("Detecting location…");
    const grid = mountEl.querySelector(".weatherGrid");

    try {
      state.weather.status = "loading";
      state.weather.error = null;
      state.weather.data = null;

      const loc = await getApproxLocationFromIP();
      // Prefer lat/lon returned by IP service (avoid stale values)
      const weather = await getCurrentWeather(loc.latitude, loc.longitude);

      const formatted = formatWeather({ weather, unit });
      state.weather.data = weather;
      state.weather.status = "ok";

      const locationEl = mountEl.querySelector("#weatherLocation");
      const tempEl = mountEl.querySelector("#weatherTemp");
      const condEl = mountEl.querySelector("#weatherCondition");
      const windEl = mountEl.querySelector("#weatherWind");

      if (locationEl) {
        const city = loc.city || loc.region || "";
        const country = loc.country ? `, ${loc.country}` : "";
        locationEl.textContent = `${city || "Unknown"}${country}`;
      }
      if (tempEl) tempEl.textContent = formatted.temp;
      if (condEl) condEl.textContent = formatted.conditionText;
      if (windEl) windEl.textContent = `Wind: ${formatted.wind}`;

      if (grid) grid.style.display = "block";
      mountStatus("Updated just now.");
    } catch (err) {
      state.weather.status = "error";
      state.weather.error = String(err?.message || err);

      if (grid) grid.style.display = "none";
      mountStatus(`Weather unavailable: ${state.weather.error}`);
    }
  }

  // initial load
  loadWeather();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadWeather());
  }

  return () => {
    if (refreshBtn)
      refreshBtn.removeEventListener("click", () => loadWeather());
  };
}
