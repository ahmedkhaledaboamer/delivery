import { useAppSelector } from "@/store";
import type { OrderStop } from "@/api/types";
import { useT } from "@/i18n";
import { DEMO_STORE_COORDS } from "@/lib/geo";
import { quoteRoute, RouteQuote } from "@/lib/pricing";

export const DEFAULT_STORE_ADDRESS = "Dubai Marina, Dubai, UAE.";

/** Pickup stop for store orders = the signed-in store's address (with demo coordinates in Dubai Marina). */
export function useStorePickup(): OrderStop & { title: string; latitude: number; longitude: number } {
  const t = useT();
  const user = useAppSelector((s) => s.auth.user);
  const storeName = user?.storeName?.trim();
  return {
    title: storeName || t("location.yourStore"),
    // TODO: use the real store address + coordinates once the profile exposes them.
    address: storeName ? `${storeName}, ${DEFAULT_STORE_ADDRESS}` : DEFAULT_STORE_ADDRESS,
    contactName: user?.storeName || user?.name || t("location.store"),
    contactPhone: user?.phone ?? "",
    ...DEMO_STORE_COORDS,
  };
}

/** Distance / ETA / fee for each store order (store pickup → that order's drop-off), plus totals. */
export function useStoreQuotes(): { quotes: RouteQuote[]; totalFee: number; totalKm: number; eta: [number, number] } {
  const { storeOrders, vehicle, speed } = useAppSelector((s) => s.delivery);
  const pickup = useStorePickup();
  const quotes = storeOrders.map((o) => quoteRoute(pickup, o.dropoff, vehicle ?? "car", speed));
  const totalFee = quotes.reduce((sum, q) => sum + q.fee, 0);
  const totalKm = Math.round(quotes.reduce((sum, q) => sum + q.distanceKm, 0) * 10) / 10;
  const eta: [number, number] = quotes.length
    ? [Math.min(...quotes.map((q) => q.etaMinutes[0])), Math.max(...quotes.map((q) => q.etaMinutes[1]))]
    : [0, 0];
  return { quotes, totalFee, totalKm, eta };
}
