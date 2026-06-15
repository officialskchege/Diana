import { getSettings } from "../../services/settingsService.js";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function renderClockPanel(mountEl, state) {
  if (!mountEl) return;

  mountEl.innerHTML = `
    <div class="card">
      <div class="cardHeader">
        <h2>Clock</h2>
        <span class="kbd">now</span>
      </div>
      <div class="cardBody">
        <div class="clockWrap">
          <div class="clockTop">
            <div id="clockAnalog" class="clockAnalog" aria-label="Analog clock"></div>
            <div class="clockDigital">
              <div id="clockDigitalText" class="clockDigitalText">--:--:--</div>
              <div id="clockDayText" class="clockDayText">----</div>
            </div>
          </div>

          <div class="clockTimeline" aria-label="Timeline">
            <div class="clockTimelineTrack"></div>
            <div id="clockTimelineFill" class="clockTimelineFill"></div>
            <div id="clockTimelineLabel" class="clockTimelineLabel">0%</div>
          </div>

          <div class="row" style="justify-content:flex-end;margin-top:10px">
            <div class="field" style="min-width:220px">
              <label>Clock style</label>
              <select id="clockStyleSelect" aria-label="Clock style"></select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const select = mountEl.querySelector("#clockStyleSelect");
  const s = getSettings();

  const styles = [
    { value: "digital", label: "Digital focus" },
    { value: "classic", label: "Classic" },
    { value: "minimal", label: "Minimal" },
  ];

  select.innerHTML = styles
    .map(
      (x) =>
        `<option value="${x.value}" ${s.clockStyle === x.value ? "selected" : ""}>${x.label}</option>`,
    )
    .join("");

  // update tick
  function tick() {
    const d = new Date();
    state.clock.now = d;

    const h = d.getHours();
    const m = d.getMinutes();
    const sec = d.getSeconds();

    // digital
    const text = `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
    const analog = mountEl.querySelector("#clockAnalog");
    const digitalText = mountEl.querySelector("#clockDigitalText");
    const dayText = mountEl.querySelector("#clockDayText");
    const fill = mountEl.querySelector("#clockTimelineFill");
    const label = mountEl.querySelector("#clockTimelineLabel");

    if (digitalText) digitalText.textContent = text;
    if (dayText)
      dayText.textContent = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

    // analog via CSS conic rotation (no canvas)
    if (analog) {
      const hourAngle = (h % 12) * 30 + m * 0.5; // 360/12=30
      const minuteAngle = m * 6 + sec * 0.1; // 360/60
      const secondAngle = sec * 6;

      state.clock.analogAngles = {
        hour: hourAngle,
        minute: minuteAngle,
        second: secondAngle,
      };

      analog.innerHTML = `
        <div class="clockFace">
          <div class="clockHand clockHandHour" style="transform: rotate(${hourAngle}deg);"></div>
          <div class="clockHand clockHandMinute" style="transform: rotate(${minuteAngle}deg);"></div>
          <div class="clockHand clockHandSecond" style="transform: rotate(${secondAngle}deg);"></div>
          <div class="clockCenter"></div>
        </div>
      `;

      // style variants
      const style = getSettings().clockStyle;
      analog.classList.toggle("isMinimal", style === "minimal");
      analog.classList.toggle("isClassic", style === "classic");
    }

    // timeline fill based on day progress
    const total = 24 * 60 * 60;
    const elapsed = h * 3600 + m * 60 + sec;
    const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));

    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${Math.round(pct)}%`;
  }

  tick();
  const id = setInterval(tick, 250);

  // settings wiring (persist)
  select.addEventListener("change", () => {
    const next = { ...getSettings(), clockStyle: select.value };
    // lazy import to avoid circular deps
    import("../../services/settingsService.js").then(({ saveSettings }) => {
      saveSettings(next);
      tick();
    });
  });

  return () => clearInterval(id);
}
