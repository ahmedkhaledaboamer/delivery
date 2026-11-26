import type { Speed, Vehicle } from "@/store/slices/deliverySlice";
import { etaRange, hasCoords, LatLng, roadDistanceKm } from "./geo";

/**
 * Client-side pricing until the backend returns real quotes.
 * Fee = base + per-km rate, +50% for "Rush In Minutes" (express), rounded to whole AED.
 */

/** Fallbacks used ONLY when a stop has no coordinates (e.g. an old draft typed by hand). */
export const ROUTE_DISTANCE_KM = 4.2;
export const ETA_MINUTES: [number, number] = [25, 35];

export const PERSONAL_SHOPPING_FEE = 20;
export const PROMO_DISCOUNT = 10;
export const TIP_OPTIONS = [5, 10, 15];

export const BASE_FEE: Record<Vehicle, number> = { motorcycle: 15, car: 25 };
export const PER_KM_FEE: Record<Vehicle, number> = { motorcycle: 3, car: 4 };
export const EXPRESS_MULTIPLIER = 1.5;

export function deliveryFee(vehicle: Vehicle | null, speed: Speed | null, km: number = ROUTE_DISTANCE_KM) {
  const v: Vehicle = vehicle ?? "motorcycle";
  const standard = BASE_FEE[v] + PER_KM_FEE[v] * Math.max(0, km);
  return Math.round(speed === "minutes" ? standard * EXPRESS_MULTIPLIER : standard);
}

export type RouteQuote = {
  distanceKm: number;
  etaMinutes: [number, number];
  fee: number;
  /** False when one of the points had no coordinates and the fallback values were used. */
  measured: boolean;
};

/** Distance, ETA and fee between two points (falls back to the demo constants without coordinates). */
export function quoteRoute(
  from: Partial<LatLng> | null | undefined,
  to: Partial<LatLng> | null | undefined,
  vehicle: Vehicle | null,
  speed: Speed | null,
): RouteQuote {
  if (hasCoords(from) && hasCoords(to)) {
    const distanceKm = roadDistanceKm(from, to);
    return { distanceKm, etaMinutes: etaRange(distanceKm, vehicle), fee: deliveryFee(vehicle, speed, distanceKm), measured: true };
  }
  return { distanceKm: ROUTE_DISTANCE_KM, etaMinutes: ETA_MINUTES, fee: deliveryFee(vehicle, speed, ROUTE_DISTANCE_KM), measured: false };
}
