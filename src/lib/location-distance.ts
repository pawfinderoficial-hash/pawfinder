import type { BrowserLocation } from "@/lib/browser-location";

const EARTH_RADIUS_KM = 6371;

export function distanceInKm(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);
  const value =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(firstLat) * Math.cos(secondLat) * Math.sin(lngDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function isWithinLocationRadius(
  point: { lat: number; lng: number },
  location: BrowserLocation | null,
) {
  if (!location) return true;
  return distanceInKm(point, location) <= (location.radiusKm ?? 20);
}
