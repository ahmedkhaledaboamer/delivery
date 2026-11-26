import { useState } from "react";
import { AccountHeader } from "@/components/account";
import { Alert, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, Screen, Text, TextField } from "@/components/ui";
import { OrderTimeline, packageLine, QueryState } from "@/components/orders/status";
import { useOrder, useRateOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED, formatDayLabel } from "@/lib/format";
import { useT } from "@/i18n";

export default function Delivered() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const rate = useRateOrder();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!order) {
    return (
      <Screen>
        <Header actions />
        <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const deliveredAt = order.timeline.find((s) => s.label.toLowerCase() === "delivered")?.time;
  const receiver = order.dropoffs[order.dropoffs.length - 1];
  const alreadyRated = !!order.rating;
  const shownRating = alreadyRated ? order.rating! : rating;

  const goHome = () => router.replace("/(tabs)");
  const finish = () => {
    if (rating > 0 && !alreadyRated) {
      rate.mutate(
        { id: order.id, rating, comment: comment.trim() },
        {
          onSuccess: goHome,
          onError: (e) => Alert.alert(t("orders.couldNotSaveRating"), e instanceof Error ? e.message : t("orders.pleaseTryAgain")),
        },
      );
    } else goHome();
  };

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title={t("orders.backToHome")} loading={rate.isPending} onPress={finish} />}>
      <AccountHeader
        title={t("orders.deliveredTitle")}
        subtitle={deliveredAt ? t("orders.arrivedSafelyAt", { time: deliveredAt }) : t("orders.arrivedSafely")}
      />
      <View className="px-5">

        <Card className="mt-4">
          <View className="flex-row items-center gap-3">
            {/* TODO: replace with Figma illustration */}
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand-lighter">
              <Ionicons name="cube-outline" size={24} color={colors.brand} />
            </View>
            <View className="flex-1">
              <View style={{ direction: "ltr" }} className="self-start">
                <Text className="font-inter-bold text-sm">{order.code}</Text>
              </View>
              {!!receiver?.contactName && <Text className="mt-0.5 text-xs text-body">{t("orders.receivedBy", { name: receiver.contactName })}</Text>}
              <Text className="mt-0.5 text-[11px] text-muted">{formatDayLabel(order.createdAt)}</Text>
            </View>
          </View>
          <OrderTimeline steps={order.timeline} className="mt-4 border-t border-line pt-4" />
          {!!receiver && <Text className="mt-3 font-inter-medium text-sm">{receiver.address}</Text>}
          <Text className="mt-3 text-xs text-muted">
            {packageLine(order)}
            {receiver?.notes ? ` · ${receiver.notes}` : ""}
          </Text>
          <Card tone="tint" className="mt-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-inter-semibold text-sm">{t("orders.deliveryFee")}</Text>
                <Text className="mt-0.5 text-[11px] text-muted">
                  {order.paymentMethod === "cash" ? t("orders.cashCollected") : t("orders.paidByCard")}
                </Text>
              </View>
              <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(order.total || order.fee)}</Text>
            </View>
          </Card>
          <Text className="mt-2 text-[11px] text-muted">{t("orders.feeOnlyNote")}</Text>
        </Card>

        <View className="mt-5 rounded-2xl border border-brand bg-white p-4">
          <Text className="font-inter-semibold text-sm">
            {t("orders.rateDelivery")} <Text className="text-sm text-danger">*</Text>
          </Text>
          <Text className="mt-0.5 text-xs text-muted">{t("orders.rateHint")}</Text>
          <View className="mt-3 flex-row gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={n > 1 ? t("orders.starsN", { n }) : t("orders.starOne")}
                disabled={alreadyRated}
                hitSlop={4}
                onPress={() => setRating(n === rating ? 0 : n)}
              >
                <Ionicons name={n <= shownRating ? "star" : "star-outline"} size={30} color={n <= shownRating ? "#F5B301" : colors.line} />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-5">
          <TextField
            label={t("orders.addComment")}
            hint="optional"
            placeholder={t("orders.typePlaceholder")}
            multiline
            maxLength={300}
            editable={!alreadyRated}
            value={alreadyRated ? order.ratingComment ?? "" : comment}
            onChangeText={setComment}
          />
        </View>
      </View>
    </Screen>
  );
}
