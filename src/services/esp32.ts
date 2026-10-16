
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
