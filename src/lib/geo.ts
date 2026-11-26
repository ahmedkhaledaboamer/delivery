import type { Vehicle } from "@/store/slices/deliverySlice";

export type LatLng = { latitude: number; longitude: number };

/** Default map centre when we know nothing about the user's location (Downtown Dubai). */
export const DUBAI_CENTER: LatLng = { latitude: 25.2048, longitude: 55.2708 };

/** Demo store location (Dubai Marina) used as the pickup for store orders until profiles carry coordinates. */
export const DEMO_STORE_COORDS: LatLng = { latitude: 25.0805, longitude: 55.1403 };

/** True when the value has usable latitude/longitude numbers. */
export function hasCoords(p: Partial<LatLng> | null | undefined): p is LatLng {
  return (
    !!p &&
    typeof p.latitude === "number" &&
    typeof p.longitude === "number" &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude)
  );
}

/** Pulls just the coordinates out of a stop (or undefined when it has none). */
export const coordsOf = (p: Partial<LatLng> | null | undefined): LatLng | undefined =>
  hasCoords(p) ? { latitude: p.latitude, longitude: p.longitude } : undefined;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Straight-line ("as the crow flies") distance in km. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rough road factor: roads are ~30% longer than the straight line in a city grid. */
export const ROAD_FACTOR = 1.3;

/**
 * Estimated road distance in km, rounded to 0.1 km (minimum 0.5 km).
 * TODO: replace with a real routing API (Google Directions / OSRM) when the backend provides quotes.
 */
export function roadDistanceKm(a: LatLng, b: LatLng): number {
  const km = haversineKm(a, b) * ROAD_FACTOR;
  return Math.max(0.5, Math.round(km * 10) / 10);
}

/** Average city speed in km/h per vehicle (motorcycles filter through traffic). */
const AVG_SPEED_KMH: Record<Vehicle, number> = { motorcycle: 30, car: 24 };
/** Fixed minutes for parking, handover etc. */
const HANDLING_MIN = 8;

/** Delivery time window in minutes after pickup, e.g. [15, 25]. */
export function etaRange(km: number, vehicle: Vehicle | null): [number, number] {
  const speed = AVG_SPEED_KMH[vehicle ?? "motorcycle"];
  const travel = (km / speed) * 60 + HANDLING_MIN;
  const min = Math.max(10, Math.round(travel / 5) * 5);
  return [min, min + 10];
}

/** Region around a point for MapView (about 1.5 km across). */
export const regionAround = (p: LatLng, delta = 0.015) => ({ ...p, latitudeDelta: delta, longitudeDelta: delta });
