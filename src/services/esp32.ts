
export interface SolarStatus {
  connected: boolean;
  solarVoltage: number;
  ldr: {
    tl: number;
    tr: number;
    bl: number;
    br: number;
  };
  angleH: number;
  angleV: number;
  angleClean: number;
  trackingEnabled: boolean;
  cleaning: boolean;
}

// The ESP32 web server handles one client at a time; never let a stalled
// request hang forever.
const REQUEST_TIMEOUT_MS = 5000;

/**
 * True for hostnames that only resolve on this machine or a private network,
 * i.e. where the page is served by the local Vite dev/preview server.
 */
export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host === "::1") return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (!ipv4) return false;

  const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
  return (
    a === 127 ||
    a === 10 ||
    (a === 192 && b === 168) ||
    (a === 172 && b >= 16 && b <= 31)
  );
}

/**
 * The /esp32 path exists only where the Vite dev or preview server proxies it
 * to the board (see vite.config.ts). A static host such as GitHub Pages has no
 * proxy, so live hardware access is limited to locally served pages.
 */
export function isLocalHardwareAvailable(): boolean {
  return import.meta.env.DEV || isPrivateHostname(window.location.hostname);
}

async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`/esp32${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`ESP32 request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getSolarStatus() {
  return apiRequest<SolarStatus>("/api/status");
}

export function startCleaning() {
  return apiRequest<{ message: string }>("/api/clean");
}

export function setTracking(enabled: boolean) {
  return apiRequest<{ trackingEnabled: boolean }>(
    `/api/tracking?enabled=${enabled ? 1 : 0}`
  );
}
