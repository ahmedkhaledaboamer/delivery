import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import type { Order, OrderStatus, TimelineStep } from "@/api/types";
import { store } from "@/store";
import { translate, useT, type TFunction } from "@/i18n";

export const ACTIVE_STATUSES: OrderStatus[] = ["finding-rider", "rider-assigned", "picked-up"];

/** Translation keys for each status (use with t()). */
export const STATUS_KEY: Record<OrderStatus, string> = {
  "finding-rider": "orders.statusFindingRider",
  "rider-assigned": "orders.statusRiderAssigned",
  "picked-up": "orders.statusPickedUp",
  delivered: "orders.statusDelivered",
  cancelled: "orders.statusCancelled",
  scheduled: "orders.statusScheduled",
};

/** Translates with the current app language (for plain helpers outside components). */
const tr: TFunction = (key, vars) => translate(store.getState().settings.language, key, vars);

/** Status label in the current language. */
export const statusLabel = (status: OrderStatus) => tr(STATUS_KEY[status]);

export const isActive = (o: Order) => ACTIVE_STATUSES.includes(o.status);
export const canCancel = (o: Order) => !["picked-up", "delivered", "cancelled"].includes(o.status);

/** Where tapping an order should go. */
export const orderHref = (o: Order) =>
  isActive(o) ? `/orders/${o.id}/track` : o.status === "delivered" ? `/orders/${o.id}/delivered` : `/orders/${o.id}`;

const FLOW_KEY: Record<Order["flow"], string> = {
  send: "orders.flowSend",
  receive: "orders.flowReceive",
  shopping: "orders.flowShopping",
  store: "orders.flowStore",
};
export const flowLabel = (o: Order) => tr(FLOW_KEY[o.flow]);

/** Known English values coming from the backend, mapped to translation keys. */
const KNOWN_TEXT: Record<string, string> = {
  "small box": "orders.sizeSmallBox",
  "medium box": "orders.sizeMediumBox",
  "large box": "orders.sizeLargeBox",
  "order confirmed": "orders.stepOrderConfirmed",
  "rider assigned": "orders.stepRiderAssigned",
  "picked up": "orders.stepPickedUp",
  delivered: "orders.stepDelivered",
  motorcycle: "orders.vehicleMotorcycle",
  car: "orders.vehicleCar",
};

/** Translates a known backend value (package size, timeline step, vehicle); unknown text is returned as-is. */
export const knownText = (s: string, t: TFunction = tr) => {
  const key = KNOWN_TEXT[s.trim().toLowerCase()];
  return key ? t(key) : s;
};

/** "Small box · Books" */
export const packageLine = (o: Order) =>
  [o.packageSize && knownText(o.packageSize), o.contents].filter(Boolean).join(" · ");

export function StatusPill({ status }: { status: OrderStatus }) {
  const t = useT();
  const danger = status === "cancelled";
  const done = status === "delivered";
  return (
    <View className={`rounded-full px-2.5 py-1 ${danger ? "bg-danger-light" : done ? "bg-brand-light" : "bg-brand-lighter"}`}>
      <Text className={`font-inter-medium text-[11px] ${danger ? "text-danger" : "text-brand-dark"}`}>{t(STATUS_KEY[status])}</Text>
    </View>
  );
}

/** Vertical status steps: violet check for done steps, grey dot + "Pending" otherwise. */
export function OrderTimeline({ steps, className = "" }: { steps: TimelineStep[]; className?: string }) {
  const t = useT();
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
              {knownText(s.label, t)} · {s.time ?? t("orders.pending")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Centered spinner / error message used by the order screens. */
export function QueryState({ loading, error, onRetry }: { loading: boolean; error?: unknown; onRetry?: () => void }) {
  const t = useT();
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
        {error instanceof Error ? error.message : t("orders.errorGeneric")}
      </Text>
      {onRetry && (
        <Text className="mt-3 font-inter-semibold text-sm text-brand" onPress={onRetry}>
          {t("orders.tryAgain")}
        </Text>
      )}
    </View>
  );
}

const MONTHS_SHORT_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

/** "3 Nov" / "3 November" (Arabic month names when the app is in Arabic). */
export function dayMonth(iso: string, long = false) {
  const d = new Date(iso);
  const ar = store.getState().settings.language === "ar";
  const months = ar ? MONTHS_AR : long ? MONTHS_LONG_EN : MONTHS_SHORT_EN;
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/** "Today, 3 Nov" / "Yesterday, 2 Nov" / "Tomorrow, 4 Nov" / "1 Nov 2026" */
export function shortDay(iso: string) {
  const d = new Date(iso);
  const base = dayMonth(iso);
  const same = (offsetDays: number) => d.toDateString() === new Date(Date.now() + offsetDays * 86_400_000).toDateString();
  if (same(0)) return tr("orders.todayWith", { date: base });
  if (same(-1)) return tr("orders.yesterdayWith", { date: base });
  if (same(1)) return tr("orders.tomorrowWith", { date: base });
  return `${base} ${d.getFullYear()}`;
}

/** One-line status summary for the order details banner. */
export function statusSummary(o: Order) {
  switch (o.status) {
    case "finding-rider":
      return tr("orders.summaryFinding");
    case "rider-assigned":
      return tr("orders.summaryAssigned");
    case "picked-up":
      return tr("orders.summaryPickedUp", { min: o.etaMinutes[0], max: o.etaMinutes[1] });
    case "delivered":
      return tr("orders.statusDelivered");
    case "cancelled":
      return o.cancelReason ? tr("orders.summaryCancelledReason", { reason: o.cancelReason }) : tr("orders.statusCancelled");
    case "scheduled":
      return o.scheduledFor ? tr("orders.summaryScheduledOn", { day: shortDay(o.scheduledFor) }) : tr("orders.statusScheduled");
  }
}

/** Wraps codes / phones / plates in LTR marks so they keep their order inside Arabic text (e.g. "#APX-1234"). */
export const ltrText = (s: string) => `‎${s}‎`;
