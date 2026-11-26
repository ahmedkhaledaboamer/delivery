import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Header, InfoBanner, PageTitle, RadioRow, Screen, Text, TextField } from "@/components/ui";
import { canCancel, QueryState } from "@/components/orders/status";
import { useCancelOrder, useOrder } from "@/api/hooks";

const REASONS = ["Plans changed", "Pickup is taking too long", "Incorrect delivery details", "Booked by mistake", "Other reason"];

export default function CancelDelivery() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const cancel = useCancelOrder();
  const [reason, setReason] = useState<string | null>(null);
  const [other, setOther] = useState("");

  const isOther = reason === "Other reason";
  const finalReason = isOther ? other.trim() : reason;
  const allowed = !!order && canCancel(order);

  const submit = () => {
    if (!order || !finalReason) return;
    cancel.mutate(
      { id: order.id, reason: finalReason },
      {
        onSuccess: () => router.replace("/(tabs)/orders"),
        onError: (e) => Alert.alert("Could not cancel", e instanceof Error ? e.message : "Please try again."),
      },
    );
  };

  return (
    <Screen
      footer={
        order ? (
          <View className="gap-3">
            <Button title="Keep my delivery" variant="outline" onPress={() => router.back()} />
            <Button
              title="Cancel order"
              variant="danger"
              disabled={!finalReason || !allowed}
              loading={cancel.isPending}
              onPress={submit}
            />
          </View>
        ) : undefined
      }
    >
      <Header actions />
      <PageTitle title="Cancel this delivery?" subtitle="Tell us why. Your feedback helps us improve." />
      {!order ? (
        <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
      ) : (
        <View className="mt-5 px-5">
          <Text className="font-inter-bold text-sm">{order.code}</Text>
          {allowed ? (
            <InfoBanner className="mt-3">
              Free to cancel while we're finding a rider. No pickup has taken place and no payment was collected.
            </InfoBanner>
          ) : (
            <InfoBanner className="mt-3" tone="danger">
              This delivery can no longer be cancelled.
            </InfoBanner>
          )}
          <View className="mt-5">
            {REASONS.map((r) => (
              <RadioRow key={r} title={r} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>
          {isOther && (
            <TextField
              placeholder="Tell us more..."
              multiline
              maxLength={200}
              autoFocus
              value={other}
              onChangeText={setOther}
            />
          )}
        </View>
      )}
    </Screen>
  );
}
