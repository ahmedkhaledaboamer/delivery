import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, InfoBanner, RouteStops, Screen, Text } from "@/components/ui";
import { canCancel, flowLabel, isActive, packageLine, QueryState, shortDay, statusSummary } from "@/components/orders/status";
import { useOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED, formatTime } from "@/lib/format";

export default function OrderDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);

  if (!order) {
    return (
      <Screen>
        <Header actions />
        <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const notes = order.dropoffs.map((d) => d.notes).filter(Boolean).join(" ");
  const trackable = isActive(order) || order.status === "scheduled";
  const cancellable = canCancel(order);

  return (
    <Screen
      footer={
        trackable ? (
          <Button title="Track delivery" onPress={() => router.push(`/orders/${order.id}/track`)} />
        ) : order.status === "delivered" ? (
          <Button title="View delivery summary" onPress={() => router.push(`/orders/${order.id}/delivered`)} />
        ) : undefined
      }
    >
      <Header actions />
      <View className="px-5">
        <Text className="font-inter-semibold text-xs text-brand">{order.code}</Text>
        <Text className="mt-1 font-inter-bold text-2xl">Order details</Text>
        <Text className="mt-1 text-xs text-body">
          {shortDay(order.createdAt)} · {formatTime(order.createdAt)} · {flowLabel(order)}
        </Text>

        <InfoBanner
          className="mt-5"
          tone={order.status === "cancelled" ? "danger" : "brand"}
          icon={order.status === "cancelled" ? "close-circle-outline" : "time-outline"}
        >
          {statusSummary(order)}
        </InfoBanner>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: "Pickup", address: order.pickup.address, detail: order.pickup.contactName },
              ...order.dropoffs.map((d, i) => ({
                label: order.dropoffs.length > 1 ? `Drop-off ${i + 1}` : "Drop-off",
                address: d.address,
                detail: d.contactName,
              })),
            ]}
          />
        </Card>

        <View className="mt-4">
          <Text className="font-inter-semibold text-sm">{packageLine(order)}</Text>
          {!!notes && <Text className="mt-1 text-xs text-body">{notes}</Text>}
          <Text className="mt-1 text-xs text-muted">
            {order.distanceKm} km · Delivery {order.etaMinutes[0]}–{order.etaMinutes[1]} min after pickup.
          </Text>
        </View>

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-inter-semibold text-sm">Delivery fee</Text>
              <Text className="mt-0.5 text-[11px] text-muted">
                {order.paymentMethod === "cash" ? "Cash from receiver at drop-off" : "Paid by card"}
              </Text>
            </View>
            <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(order.total || order.fee)}</Text>
          </View>
        </Card>
        <Text className="mt-2 text-[11px] text-muted">Delivery fee only. Nothing collected for package contents.</Text>

        {cancellable && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/orders/${order.id}/cancel`)}
            className="mt-5 flex-row items-center border-t border-line pt-4 active:opacity-70"
          >
            <View className="flex-1">
              <Text className="font-inter-semibold text-sm">Cancel order</Text>
              <Text className="mt-0.5 text-xs text-muted">Free before a rider is assigned</Text>
            </View>
            <Ionicons name="close-circle-outline" size={20} color={colors.body} />
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
