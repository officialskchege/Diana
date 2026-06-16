const DEFAULT_TIMEOUT_MS = 3500;

function toNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

async function fetchJson(url, { timeoutMs }) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Minimal IP geolocation.
// Returns: { latitude, longitude, city, country, region }
export async function getApproxLocationFromIP({
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  // ipapi.co seems to be most reliable in practice, but may rate-limit (429).
  // We also try a fallback provider that is generally keyless.
  const providers = [
    {
      name: "ipapi",
      url: "https://ipapi.co/json/",
      map: (d) => ({
        latitude: toNumber(d?.latitude),
        longitude: toNumber(d?.longitude),
        city: d?.city || null,
        region: d?.region || null,
        country: d?.country_name || d?.country || null,
      }),
    },
    {
      name: "ip-api",
      url: "https://ip-api.com/json/",
      map: (d) => ({
        latitude: toNumber(d?.lat),
        longitude: toNumber(d?.lon),
        city: d?.city || null,
        region: d?.regionName || null,
        country: d?.country || null,
      }),
    },
  ];

  let lastErr = null;

  for (const p of providers) {
    try {
      const data = await fetchJson(p.url, { timeoutMs });
      const mapped = p.map(data);
      if (
        !Number.isFinite(mapped.latitude) ||
        !Number.isFinite(mapped.longitude)
      ) {
        throw new Error(`${p.name}: missing lat/long`);
      }
      return mapped;
    } catch (err) {
      lastErr = new Error(
        `ipService: ${p.name} failed: ${String(err?.message || err)}`,
      );
    }
  }

  // Absolute fallback: do not crash the whole app.
  // (E.g., EAT/Gulf region users can still see a meaningful display.)
  return {
    latitude: -33.9,
    longitude: 151.2,
    city: null,
    region: null,
    country: null,
    fallback: true,
  };
}
