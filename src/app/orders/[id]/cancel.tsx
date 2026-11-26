import { useState } from "react";
import { Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, InfoBanner, RadioRow, Screen, Text, TextField } from "@/components/ui";
import { AccountHeader } from "@/components/account";
import { canCancel, QueryState } from "@/components/orders/status";
import { useCancelOrder, useOrder } from "@/api/hooks";
import { useT } from "@/i18n";

const REASON_KEYS = ["reasonPlansChanged", "reasonTooLong", "reasonIncorrectDetails", "reasonMistake", "reasonOther"] as const;

export default function CancelDelivery() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id);
  const cancel = useCancelOrder();
  const [reason, setReason] = useState<(typeof REASON_KEYS)[number] | null>(null);
  const [other, setOther] = useState("");

  const isOther = reason === "reasonOther";
  const finalReason = isOther ? other.trim() : reason ? t(`orders.${reason}`) : null;
  const allowed = !!order && canCancel(order);

  const submit = () => {
    if (!order || !finalReason) return;
    cancel.mutate(
      { id: order.id, reason: finalReason },
      {
        onSuccess: () => router.replace("/(tabs)/orders"),
        onError: (e) => Alert.alert(t("orders.couldNotCancel"), e instanceof Error ? e.message : t("orders.pleaseTryAgain")),
      },
    );
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        order ? (
          <View className="gap-3">
            <Button title={t("orders.keepDelivery")} variant="outline" onPress={() => router.back()} />
            <Button
              title={t("orders.cancelOrder")}
              variant="danger"
              disabled={!finalReason || !allowed}
              loading={cancel.isPending}
              onPress={submit}
            />
          </View>
        ) : undefined
      }
    >
      <AccountHeader title={t("orders.cancelTitle")} subtitle={t("orders.cancelSubtitle")} />
      {!order ? (
        <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
      ) : (
        <View className="mt-5 px-5">
          <View style={{ direction: "ltr" }} className="self-start">
            <Text className="font-inter-bold text-sm">{order.code}</Text>
          </View>
          {allowed ? (
            <InfoBanner className="mt-3">
              {t("orders.cancelFreeBanner")}
            </InfoBanner>
          ) : (
            <InfoBanner className="mt-3" tone="danger">
              {t("orders.cancelNotAllowed")}
            </InfoBanner>
          )}
          <View className="mt-5">
            {REASON_KEYS.map((r) => (
              <RadioRow key={r} title={t(`orders.${r}`)} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>
          {isOther && (
            <TextField
              placeholder={t("orders.tellUsMore")}
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
