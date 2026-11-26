import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, Screen, Text, TextField } from "@/components/ui";
import { OrderTimeline, packageLine, QueryState } from "@/components/orders/status";
import { useOrder, useRateOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { formatAED, formatDayLabel } from "@/lib/format";

export default function Delivered() {
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
          onError: (e) => Alert.alert("Could not save your rating", e instanceof Error ? e.message : "Please try again."),
        },
      );
    } else goHome();
  };

  return (
    <Screen footer={<Button title="Back to home" loading={rate.isPending} onPress={finish} />}>
      <Header actions />
      <View className="px-5">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-light">
          <Ionicons name="checkmark-circle" size={34} color={colors.brand} />
        </View>
        <Text className="mt-4 font-inter-bold text-2xl">Delivered. Day made.</Text>
        <Text className="mt-1 text-sm text-body">
          Your package arrived safely{deliveredAt ? ` at ${deliveredAt}` : ""}.
        </Text>

        <Card className="mt-5">
          <View className="flex-row items-center gap-3">
            {/* TODO: replace with Figma illustration */}
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand-lighter">
              <Ionicons name="cube-outline" size={24} color={colors.brand} />
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-sm">{order.code}</Text>
              {!!receiver?.contactName && <Text className="mt-0.5 text-xs text-body">Received by {receiver.contactName}</Text>}
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
                <Text className="font-inter-semibold text-sm">Delivery fee</Text>
                <Text className="mt-0.5 text-[11px] text-muted">
                  {order.paymentMethod === "cash" ? "Cash collected from receiver" : "Paid by card"}
                </Text>
              </View>
              <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(order.total || order.fee)}</Text>
            </View>
          </Card>
          <Text className="mt-2 text-[11px] text-muted">Delivery fee only. Nothing collected for package contents.</Text>
        </Card>

        <View className="mt-5 rounded-2xl border border-brand bg-white p-4">
          <Text className="font-inter-semibold text-sm">
            Rate your delivery <Text className="text-sm text-danger">*</Text>
          </Text>
          <Text className="mt-0.5 text-xs text-muted">Your rating helps us keep a great service.</Text>
          <View className="mt-3 flex-row gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                accessibilityRole="button"
                accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}
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
            label="Add a comment"
            hint="optional"
            placeholder="Type...."
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
