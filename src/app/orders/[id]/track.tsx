import { Alert, Linking, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { OrderTimeline, QueryState } from "@/components/orders/status";
import { useOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED } from "@/lib/format";

export default function TrackOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);

  if (!order) {
    return (
      <Screen>
        <Header />
        <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const pickedUp = order.status === "picked-up" || order.status === "delivered";
  const pickedUpAt = order.timeline.find((s) => s.label.toLowerCase().startsWith("picked"))?.time;
  const title = pickedUp ? "Your parcel is on its way" : "Your rider is on the way";
  const subtitle = pickedUp
    ? `Delivery in ${order.etaMinutes[0]}–${order.etaMinutes[1]} min${pickedUpAt ? ` · Picked up at ${pickedUpAt}` : ""}`
    : order.rider
      ? "Pickup in 10–15 min · Please have your parcel ready."
      : "We're matching you with a nearby rider. Pickup in 10–15 min.";
  const rider = order.rider;

  const call = async () => {
    if (!rider) return;
    const url = `tel:${rider.phone.replace(/\s/g, "")}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to place a call", rider.phone);
    }
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title="View order details" onPress={() => router.push(`/orders/${order.id}`)} />}
    >
      <RouteMap mode="route" />
      <Sheet>
        <Text className="font-inter-bold text-xl">{title}</Text>
        <Text className="mt-1 text-xs text-body">{subtitle}</Text>

        <Card className="mt-4">
          {rider ? (
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-light">
                <Text className="font-inter-bold text-sm text-brand-dark">{rider.initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-sm">{rider.name}</Text>
                <Text className="mt-0.5 text-[11px] text-muted">
                  ★ {rider.rating.toFixed(1)} · {rider.vehicle} · {rider.plate}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${rider.name}`}
                onPress={call}
                className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white active:opacity-70"
              >
                <Ionicons name="call-outline" size={18} color={colors.ink} />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-lighter">
                <Ionicons name="search-outline" size={20} color={colors.brand} />
              </View>
              <Text className="flex-1 font-inter-medium text-sm">Finding a rider…</Text>
            </View>
          )}
          <OrderTimeline steps={order.timeline} className="mt-4 border-t border-line pt-4" />
        </Card>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: "Pickup", address: order.pickup.address },
              ...order.dropoffs.map((d, i) => ({
                label: order.dropoffs.length > 1 ? `Drop-off ${i + 1}` : "Drop-off",
                address: d.address,
              })),
            ]}
          />
        </Card>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-body">Delivery fee · Cash from receiver at drop-off</Text>
          <Text className="font-inter-bold text-sm">{formatAED(order.total || order.fee)}</Text>
        </View>
      </Sheet>
    </Screen>
  );
}
