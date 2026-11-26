import type { TFunction } from "@/i18n";
import { useAppSelector } from "@/store";
import type { Vehicle } from "@/store/slices/deliverySlice";
import type { DriverIdentity } from "@/api/driver";

export const vehicleLabel = (t: TFunction, v: Vehicle) => t(v === "car" ? "driver.vehicleCar" : "driver.vehicleMotorcycle");
export const vehicleIcon = (v: Vehicle) => (v === "car" ? "car-outline" : "bicycle-outline") as "car-outline" | "bicycle-outline";

export const aed = (t: TFunction, amount: number) =>
  t("common.aed", { amount: Number.isInteger(amount) ? amount : amount.toFixed(2) });

/** "Just now" / "4 min ago" / "2 h ago" / "3 d ago" in the current language. */
export function timeAgo(t: TFunction, iso: string) {
  const min = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return t("driver.justNow");
  if (min < 60) return t("driver.minAgo", { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t("driver.hAgo", { n: h });
  return t("driver.dAgo", { n: Math.floor(h / 24) });
}

/** "Good morning / afternoon / evening" key for the current hour. */
export const greetingKey = () => {
  const h = new Date().getHours();
  return h < 12 ? "driver.goodMorning" : h < 18 ? "driver.goodAfternoon" : "driver.goodEvening";
};

/** Driver state with safe defaults (older saved copies may miss newer fields). */
export function useDriverState() {
  const d = useAppSelector((s) => s.driver);
  return {
    online: !!d.online,
    activeOrderId: d.activeOrderId ?? null,
    vehicle: (d.vehicle ?? "motorcycle") as Vehicle,
    plate: d.plate ?? "",
    skippedIds: d.skippedIds ?? [],
  };
}

/** The signed-in driver as the backend needs it (name, phone, vehicle, plate). */
export function useDriverIdentity(): DriverIdentity | null {
  const user = useAppSelector((s) => s.auth.user);
  const { vehicle, plate } = useDriverState();
  if (!user) return null;
  return { name: user.name || "Rider", phone: user.phone, vehicle, plate };
}
