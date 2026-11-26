import type { Speed, Vehicle } from "@/store/slices/deliverySlice";

/**
 * Placeholder pricing until the backend returns real quotes.
 * Design shows AED 350 for a 4.2 km route and AED 20 personal shopping service.
 */
export const ROUTE_DISTANCE_KM = 4.2;
export const ETA_MINUTES: [number, number] = [25, 35];
export const PERSONAL_SHOPPING_FEE = 20;
export const PROMO_DISCOUNT = 10;
export const TIP_OPTIONS = [5, 10, 15];

export function deliveryFee(vehicle: Vehicle | null, speed: Speed | null) {
  const base = vehicle === "car" ? 350 : 300;
  return speed === "minutes" ? base + 50 : base;
}
