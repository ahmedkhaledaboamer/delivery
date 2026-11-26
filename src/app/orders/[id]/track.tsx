import { Alert, Linking, Pressable, View } from "react-native";
import { coordsOf } from "@/lib/geo";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { knownText, ltrText, OrderTimeline, QueryState } from "@/components/orders/status";
import { useT } from "@/i18n";
import { useOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED } from "@/lib/format";

export default function TrackOrder() {
  const t = useT();
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
  const title = pickedUp ? t("orders.parcelOnWay") : t("orders.riderOnWay");
  const subtitle = pickedUp
    ? t("orders.deliveryIn", { min: order.etaMinutes[0], max: order.etaMinutes[1] }) + (pickedUpAt ? t("orders.pickedUpAt", { time: pickedUpAt }) : "")
    : order.rider
      ? t("orders.pickupSoonReady")
      : t("orders.matchingRider");
  const rider = order.rider;

  const call = async () => {
    if (!rider) return;
    const url = `tel:${rider.phone.replace(/\s/g, "")}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("orders.unableToCall"), ltrText(rider.phone));
    }
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title={t("orders.viewOrderDetails")} onPress={() => router.push(`/orders/${order.id}`)} />}
    >
      <RouteMap
        mode="route"
        pickup={coordsOf(order.pickup)}
        dropoff={order.dropoffs.length === 1 ? coordsOf(order.dropoffs[0]) : undefined}
        stops={order.dropoffs.length > 1 ? order.dropoffs.map(coordsOf).filter((c): c is NonNullable<typeof c> => !!c) : undefined}
      />
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
                  ★ {rider.rating.toFixed(1)} · {knownText(rider.vehicle, t)} · {ltrText(rider.plate)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("orders.callName", { name: rider.name })}
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
              <Text className="flex-1 font-inter-medium text-sm">{t("orders.findingRider")}</Text>
            </View>
          )}
          <OrderTimeline steps={order.timeline} className="mt-4 border-t border-line pt-4" />
        </Card>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: t("common.pickup"), address: order.pickup.address },
              ...order.dropoffs.map((d, i) => ({
                label: order.dropoffs.length > 1 ? t("orders.dropoffN", { n: i + 1 }) : t("orders.dropoff"),
                address: d.address,
              })),
            ]}
          />
        </Card>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-body">{t("orders.feeCashLine")}</Text>
          <Text className="font-inter-bold text-sm">{formatAED(order.total || order.fee)}</Text>
        </View>
      </Sheet>
    </Screen>
  );
}
