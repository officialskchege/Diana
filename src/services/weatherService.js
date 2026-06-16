const DEFAULT_TIMEOUT_MS = 4500;

function cToF(c) {
  return c * (9 / 5) + 32;
}

function formatTemp(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value)))
    return "--";
  return `${Math.round(Number(value))}°`;
}

// Open-Meteo current weather.
// Returns: { temperatureC, temperatureF, windKph, windMph, weatherCode }
export async function getCurrentWeather(
  lat,
  lon,
  { timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set(
      "current",
      "temperature_2m,wind_speed_10m,weather_code",
    );
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`weatherService: HTTP ${res.status}`);
    const data = await res.json();

    const current = data?.current;
    const temperatureC = Number(current?.temperature_2m);
    const windKph = Number(current?.wind_speed_10m);
    const weatherCode = current?.weather_code;

    const temperatureF = Number.isFinite(temperatureC)
      ? cToF(temperatureC)
      : null;
    const windMph = Number.isFinite(windKph) ? windKph * 0.621371 : null;

    return {
      temperatureC: Number.isFinite(temperatureC) ? temperatureC : null,
      temperatureF,
      windKph: Number.isFinite(windKph) ? windKph : null,
      windMph,
      weatherCode: Number.isFinite(Number(weatherCode))
        ? Number(weatherCode)
        : null,
      raw: data,
    };
  } finally {
    clearTimeout(t);
  }
}

export function weatherCodeToText(code) {
  // Open-Meteo weather codes: https://open-meteo.com/en/docs
  const c = Number(code);
  if (!Number.isFinite(c)) return "Unknown";

  if (c === 0) return "Clear";
  if (c === 1 || c === 2) return "Mainly clear";
  if (c === 3) return "Overcast";
  if (c === 45 || c === 48) return "Fog";
  if (c >= 51 && c <= 57) return "Drizzle";
  if (c >= 61 && c <= 65) return "Rain";
  if (c >= 66 && c <= 67) return "Freezing rain";
  if (c >= 71 && c <= 77) return "Snow";
  if (c >= 80 && c <= 82) return "Rain showers";
  if (c >= 85 && c <= 86) return "Snow showers";
  if (c >= 95) return "Thunderstorm";
  return "Weather";
}

export function formatWeather({ weather, unit }) {
  const temp =
    unit === "f"
      ? formatTemp(weather?.temperatureF)
      : formatTemp(weather?.temperatureC);
  const wind =
    unit === "f"
      ? `${Math.round(weather?.windMph ?? NaN)} mph`
      : `${Math.round(weather?.windKph ?? NaN)} kph`;

  return {
    temp: temp,
    wind:
      Number.isFinite(weather?.windKph ?? NaN) ||
      Number.isFinite(weather?.windMph ?? NaN)
        ? wind
        : "--",
    conditionText: weatherCodeToText(weather?.weatherCode),
  };
}
