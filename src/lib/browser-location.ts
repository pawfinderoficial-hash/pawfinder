export interface BrowserLocation {
  lat: number;
  lng: number;
  capturedAt: number;
  city?: string;
  radiusKm?: number;
  source?: "gps" | "manual";
}

export const DEFAULT_RADIUS_KM = 20;
export const LOCATION_CHANGE_EVENT = "pawfinder:location-change";

const USER_LOCATION_KEY = "pawfinder:user-location";
let memoryLocation: BrowserLocation | null = null;

function normalizeLocation(value: Partial<BrowserLocation>): BrowserLocation | null {
  if (
    typeof value.lat !== "number" ||
    typeof value.lng !== "number" ||
    typeof value.capturedAt !== "number"
  ) {
    return null;
  }

  return {
    lat: value.lat,
    lng: value.lng,
    capturedAt: value.capturedAt,
    city: typeof value.city === "string" ? value.city : undefined,
    radiusKm:
      typeof value.radiusKm === "number" ? value.radiusKm : DEFAULT_RADIUS_KM,
    source: value.source === "manual" ? "manual" : "gps",
  };
}

export function readBrowserLocation(): BrowserLocation | null {
  if (memoryLocation) return memoryLocation;
  if (typeof window === "undefined") return null;

  try {
    const stored =
      localStorage.getItem(USER_LOCATION_KEY) ??
      sessionStorage.getItem(USER_LOCATION_KEY);
    if (!stored) return null;
    const parsed = normalizeLocation(JSON.parse(stored) as Partial<BrowserLocation>);
    if (!parsed) return null;
    memoryLocation = parsed;
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(parsed));
    sessionStorage.removeItem(USER_LOCATION_KEY);
    return memoryLocation;
  } catch {
    return null;
  }
}

export function storeBrowserLocation(location: BrowserLocation) {
  memoryLocation = normalizeLocation(location);
  if (!memoryLocation) return;

  try {
    localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(memoryLocation));
    sessionStorage.removeItem(USER_LOCATION_KEY);
  } catch {
    // The in-memory copy still works when private browsing restricts storage.
  }
  window.dispatchEvent(new CustomEvent(LOCATION_CHANGE_EVENT));
}

export function clearBrowserLocation() {
  memoryLocation = null;

  try {
    localStorage.removeItem(USER_LOCATION_KEY);
    sessionStorage.removeItem(USER_LOCATION_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCATION_CHANGE_EVENT));
  }
}
