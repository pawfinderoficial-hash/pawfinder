export interface BrowserLocation {
  lat: number;
  lng: number;
  capturedAt: number;
}

const USER_LOCATION_KEY = "pawfinder:user-location";

let memoryLocation: BrowserLocation | null = null;

export function readBrowserLocation(): BrowserLocation | null {
  if (memoryLocation) return memoryLocation;
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(USER_LOCATION_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<BrowserLocation>;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.capturedAt !== "number"
    ) {
      return null;
    }

    memoryLocation = {
      lat: parsed.lat,
      lng: parsed.lng,
      capturedAt: parsed.capturedAt,
    };
    return memoryLocation;
  } catch {
    return null;
  }
}

export function storeBrowserLocation(location: BrowserLocation) {
  memoryLocation = location;

  try {
    sessionStorage.setItem(USER_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // In-memory reuse still prevents repeated prompts when storage is restricted.
  }
}

export function clearBrowserLocation() {
  memoryLocation = null;

  try {
    sessionStorage.removeItem(USER_LOCATION_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
