import { useAppSelector } from "@/store";
import type { OrderStop } from "@/api/types";

export const DEFAULT_STORE_ADDRESS = "Dubai Marina, Dubai, UAE.";

/** Pickup stop for store orders = the signed-in store's address. */
export function useStorePickup(): OrderStop & { title: string } {
  const user = useAppSelector((s) => s.auth.user);
  const title = user?.storeName?.trim() || "Your store";
  return {
    title,
    // TODO: use the real store address once the profile exposes it.
    address: user?.storeName?.trim() ? `${user.storeName.trim()}, ${DEFAULT_STORE_ADDRESS}` : DEFAULT_STORE_ADDRESS,
    contactName: user?.storeName || user?.name || "Store",
    contactPhone: user?.phone ?? "",
  };
}
