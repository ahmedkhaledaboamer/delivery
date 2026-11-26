import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DirIcon, RouteStops, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { formatAED, formatDate, formatTime } from "@/lib/format";
import { useT } from "@/i18n";
import type { Order } from "@/api/types";
import { isActive, orderHref, packageLine, StatusPill } from "./status";

/** Order code / plate etc. always reads left-to-right. */
const ltr = { direction: "ltr" as const };

/** Full order card (active / past lists). */
export function OrderCard({ order }: { order: Order }) {
  const t = useT();
  const active = isActive(order);
  const last = order.dropoffs[order.dropoffs.length - 1];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(orderHref(order))}
      className={`mb-3 rounded-2xl border p-4 active:opacity-80 ${active ? "border-brand bg-brand-lighter" : "border-line bg-white"}`}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View style={ltr}>
          <Text className="font-inter-bold text-sm">{order.code}</Text>
        </View>
        <StatusPill status={order.status} />
      </View>
      <RouteStops
        stops={[
          { label: t("common.pickup"), address: order.pickup.address },
          {
            label: t("orders.dropoff"),
            address: order.dropoffs.length > 1 ? t("orders.locationsCount", { n: order.dropoffs.length }) : last?.address ?? "",
          },
        ]}
      />
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-body">{packageLine(order)}</Text>
        <Text className="font-inter-bold text-sm">{formatAED(order.total || order.fee)}</Text>
      </View>
      {active && (
        <View className="mt-2 flex-row items-center gap-1">
          <Text className="font-inter-semibold text-xs text-brand">{t("orders.trackDelivery")}</Text>
          <DirIcon name="arrow-forward" size={14} color={colors.brand} />
        </View>
      )}
    </Pressable>
  );
}

/** Compact row used in the SCHEDULED section. */
export function ScheduledOrderRow({ order }: { order: Order }) {
  const t = useT();
  const when = order.scheduledFor ?? order.createdAt;
  const d = new Date(when);
  const tomorrow = new Date(Date.now() + 86_400_000);
  const day =
    d.toDateString() === tomorrow.toDateString()
      ? t("orders.tomorrow")
      : d.toDateString() === new Date().toDateString()
        ? t("orders.today")
        : formatDate(when);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(orderHref(order))}
      className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-4 active:opacity-80"
    >
      <View className="flex-1">
        <View style={ltr} className="self-start">
          <Text className="font-inter-bold text-sm">{order.code}</Text>
        </View>
        <Text className="mt-1 text-xs text-body">
          {t("orders.dayTime", { day, time: formatTime(when) })} · {order.contents} · {formatAED(order.total || order.fee)}
        </Text>
      </View>
      <Ionicons name="calendar-outline" size={20} color={colors.body} />
    </Pressable>
  );
}
