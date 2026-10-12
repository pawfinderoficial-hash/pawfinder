"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LOCATION_CHANGE_EVENT,
  readBrowserLocation,
  storeBrowserLocation,
  type BrowserLocation,
} from "@/lib/browser-location";

export function useLocationPreference() {
  const [location, setLocation] = useState<BrowserLocation | null>(null);

  useEffect(() => {
    const sync = () => setLocation(readBrowserLocation());
    sync();
    window.addEventListener(LOCATION_CHANGE_EVENT, sync);
    return () => window.removeEventListener(LOCATION_CHANGE_EVENT, sync);
  }, []);

  const updateLocation = useCallback((next: BrowserLocation) => {
    storeBrowserLocation(next);
    setLocation(next);
  }, []);

  return { location, updateLocation };
}
