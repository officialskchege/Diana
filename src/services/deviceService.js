export function getDeviceInfo() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const lang = typeof navigator !== "undefined" ? navigator.language : "";

  const platform = typeof navigator !== "undefined" ? navigator.platform : "";
  const vendor = typeof navigator !== "undefined" ? navigator.vendor : "";

  const deviceMemory = navigator?.deviceMemory;

  // basic heuristics
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  return {
    userAgent: ua,
    language: lang,
    platform,
    vendor,
    deviceMemory: deviceMemory ?? null,
    isMobile,
    screen:
      typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : null,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : null,
  };
}
