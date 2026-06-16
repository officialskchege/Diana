const DEFAULT_TIMEOUT_MS = 2500;

export async function checkInternet({ timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  // navigator.onLine is not definitive, so we do a lightweight request.
  const online = typeof navigator !== "undefined" ? navigator.onLine : null;

  if (online === false) {
    return { online: false, reachable: false };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 204 response expected.
    const res = await fetch("https://www.google.com/generate_204", {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-cache",
    });

    return { online: true, reachable: res ? res.ok !== false : true };
  } catch {
    return { online: true, reachable: false };
  } finally {
    clearTimeout(t);
  }
}
