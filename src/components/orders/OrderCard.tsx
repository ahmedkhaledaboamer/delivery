import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RouteStops, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { formatAED, formatTime } from "@/lib/format";
import type { Order } from "@/api/types";
import { isActive, orderHref, packageLine, StatusPill } from "./status";

/** Full order card (active / past lists). */
export function OrderCard({ order }: { order: Order }) {
  const active = isActive(order);
  const last = order.dropoffs[order.dropoffs.length - 1];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(orderHref(order))}
      className={`mb-3 rounded-2xl border p-4 active:opacity-80 ${active ? "border-brand bg-brand-lighter" : "border-line bg-white"}`}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-inter-bold text-sm">{order.code}</Text>
        <StatusPill status={order.status} />
      </View>
      <RouteStops
        stops={[
          { label: "Pickup", address: order.pickup.address },
          {
            label: "Drop-off",
            address: order.dropoffs.length > 1 ? `${order.dropoffs.length} Locations` : last?.address ?? "",
          },
        ]}
      />
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs text-body">{packageLine(order)}</Text>
        <Text className="font-inter-bold text-sm">{formatAED(order.total || order.fee)}</Text>
      </View>
      {active && (
        <View className="mt-2 flex-row items-center gap-1">
          <Text className="font-inter-semibold text-xs text-brand">Track delivery</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.brand} />
        </View>
      )}
    </Pressable>
  );
}

/** Compact row used in the SCHEDULED section. */
export function ScheduledOrderRow({ order }: { order: Order }) {
  const when = order.scheduledFor ?? order.createdAt;
  const d = new Date(when);
  const tomorrow = new Date(Date.now() + 86_400_000);
  const day = d.toDateString() === tomorrow.toDateString() ? "Tomorrow" : d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(orderHref(order))}
      className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-4 active:opacity-80"
    >
      <View className="flex-1">
        <Text className="font-inter-bold text-sm">{order.code}</Text>
        <Text className="mt-1 text-xs text-body">
          {day}, {formatTime(when)} · {order.contents} · {formatAED(order.total || order.fee)}
        </Text>
      </View>
      <Ionicons name="calendar-outline" size={20} color={colors.body} />
    </Pressable>
  );
}
