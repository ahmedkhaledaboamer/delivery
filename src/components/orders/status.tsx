import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import type { Order, OrderStatus, TimelineStep } from "@/api/types";

export const ACTIVE_STATUSES: OrderStatus[] = ["finding-rider", "rider-assigned", "picked-up"];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  "finding-rider": "Finding a rider",
  "rider-assigned": "Rider on the way",
  "picked-up": "Picked up",
  delivered: "Delivered",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
};

export const isActive = (o: Order) => ACTIVE_STATUSES.includes(o.status);
export const canCancel = (o: Order) => !["picked-up", "delivered", "cancelled"].includes(o.status);

/** Where tapping an order should go. */
export const orderHref = (o: Order) =>
  isActive(o) ? `/orders/${o.id}/track` : o.status === "delivered" ? `/orders/${o.id}/delivered` : `/orders/${o.id}`;

const FLOW_LABEL: Record<Order["flow"], string> = {
  send: "Send a Package",
  receive: "Receive a Package",
  shopping: "Personal Shopping",
  store: "Store Delivery",
};
export const flowLabel = (o: Order) => FLOW_LABEL[o.flow];

/** "Small box · Books" */
export const packageLine = (o: Order) => [o.packageSize, o.contents].filter(Boolean).join(" · ");

export function StatusPill({ status }: { status: OrderStatus }) {
  const danger = status === "cancelled";
  const done = status === "delivered";
  return (
    <View className={`rounded-full px-2.5 py-1 ${danger ? "bg-danger-light" : done ? "bg-brand-light" : "bg-brand-lighter"}`}>
      <Text className={`font-inter-medium text-[11px] ${danger ? "text-danger" : "text-brand-dark"}`}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

/** Vertical status steps: violet check for done steps, grey dot + "Pending" otherwise. */
export function OrderTimeline({ steps, className = "" }: { steps: TimelineStep[]; className?: string }) {
  return (
    <View className={`gap-2 ${className}`}>
      {steps.map((s) => {
        const done = !!s.time;
        return (
          <View key={s.label} className="flex-row items-center gap-2">
            {done ? (
              <Ionicons name="checkmark-circle" size={16} color={colors.brand} />
            ) : (
              <View className="mx-[3px] h-2.5 w-2.5 rounded-full border border-muted" />
            )}
            <Text className={`text-xs ${done ? "font-inter-medium text-ink" : "text-muted"}`}>
              {s.label} · {s.time ?? "Pending"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Centered spinner / error message used by the order screens. */
export function QueryState({ loading, error, onRetry }: { loading: boolean; error?: unknown; onRetry?: () => void }) {
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
      <Text className="mt-2 text-center text-sm text-body">
        {error instanceof Error ? error.message : "Something went wrong."}
      </Text>
      {onRetry && (
        <Text className="mt-3 font-inter-semibold text-sm text-brand" onPress={onRetry}>
          Try again
        </Text>
      )}
    </View>
  );
}


const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Today, 3 Nov" / "Yesterday, 2 Nov" / "Tomorrow, 4 Nov" / "1 Nov 2026" */
export function shortDay(iso: string) {
  const d = new Date(iso);
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  const same = (offsetDays: number) => d.toDateString() === new Date(Date.now() + offsetDays * 86_400_000).toDateString();
  if (same(0)) return `Today, ${base}`;
  if (same(-1)) return `Yesterday, ${base}`;
  if (same(1)) return `Tomorrow, ${base}`;
  return `${base} ${d.getFullYear()}`;
}

/** One-line status summary for the order details banner. */
export function statusSummary(o: Order) {
  switch (o.status) {
    case "finding-rider":
      return "Finding a rider · Pickup in 10–15 min";
    case "rider-assigned":
      return "Rider assigned · Pickup in 10–15 min";
    case "picked-up":
      return `Picked up · Delivery in ${o.etaMinutes[0]}–${o.etaMinutes[1]} min`;
    case "delivered":
      return "Delivered";
    case "cancelled":
      return o.cancelReason ? `Cancelled · ${o.cancelReason}` : "Cancelled";
    case "scheduled":
      return o.scheduledFor ? `Scheduled · ${shortDay(o.scheduledFor)}` : "Scheduled";
  }
}
