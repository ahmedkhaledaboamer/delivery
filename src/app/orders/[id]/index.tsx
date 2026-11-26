import { Pressable, View } from "react-native";
import { AccountHeader } from "@/components/account";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, InfoBanner, RouteStops, Screen, Text } from "@/components/ui";
import { canCancel, flowLabel, isActive, ltrText, packageLine, QueryState, shortDay, statusSummary } from "@/components/orders/status";
import { useOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED, formatTime } from "@/lib/format";
import { useT } from "@/i18n";

export default function OrderDetails() {
  const t = useT();
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
      edges={["bottom"]}
      background="white"
      footer={
        trackable ? (
          <Button title={t("orders.trackDelivery")} onPress={() => router.push(`/orders/${order.id}/track`)} />
        ) : order.status === "delivered" ? (
          <Button title={t("orders.viewDeliverySummary")} onPress={() => router.push(`/orders/${order.id}/delivered`)} />
        ) : undefined
      }
    >
      <AccountHeader
        eyebrow={ltrText(order.code)}
        title={t("orders.orderDetails")}
        subtitle={`${shortDay(order.createdAt)} · ${formatTime(order.createdAt)} · ${flowLabel(order)}`}
      />
      <View className="px-5">

        <InfoBanner
          className="mt-4"
          tone={order.status === "cancelled" ? "danger" : "brand"}
          icon={order.status === "cancelled" ? "close-circle-outline" : "time-outline"}
        >
          {statusSummary(order)}
        </InfoBanner>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: t("common.pickup"), address: order.pickup.address, detail: order.pickup.contactName },
              ...order.dropoffs.map((d, i) => ({
                label: order.dropoffs.length > 1 ? t("orders.dropoffN", { n: i + 1 }) : t("orders.dropoff"),
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
            {t("orders.distanceEta", { km: order.distanceKm, min: order.etaMinutes[0], max: order.etaMinutes[1] })}
          </Text>
        </View>

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-inter-semibold text-sm">{t("orders.deliveryFee")}</Text>
              <Text className="mt-0.5 text-[11px] text-muted">
                {order.paymentMethod === "cash" ? t("orders.cashAtDropoff") : t("orders.paidByCard")}
              </Text>
            </View>
            <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(order.total || order.fee)}</Text>
          </View>
        </Card>
        <Text className="mt-2 text-[11px] text-muted">{t("orders.feeOnlyNote")}</Text>

        {cancellable && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/orders/${order.id}/cancel`)}
            className="mt-5 flex-row items-center border-t border-line pt-4 active:opacity-70"
          >
            <View className="flex-1">
              <Text className="font-inter-semibold text-sm">{t("orders.cancelOrder")}</Text>
              <Text className="mt-0.5 text-xs text-muted">{t("orders.cancelFreeHint")}</Text>
            </View>
            <Ionicons name="close-circle-outline" size={20} color={colors.body} />
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
