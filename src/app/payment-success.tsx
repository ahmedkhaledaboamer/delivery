import type { ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, Share, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Button, Card, GradientText, Header, Logo, Screen, Text } from "@/components/ui";
import { ArrowContinueButton } from "@/components/send";
import { useOrder } from "@/api/hooks";
import type { Order } from "@/api/types";
import { colors } from "@/constants/theme";
import { formatAED, formatDate, formatDayLabel, formatTime } from "@/lib/format";

const goHome = () => router.replace("/(tabs)");

function receiptText(o: Order) {
  return [
    "APEX AORA — Payment Receipt",
    `Order: ${o.code}`,
    `Date: ${formatDate(o.paidAt)} ${formatTime(o.paidAt)}`,
    `From: ${o.pickup.address}`,
    ...o.dropoffs.map((d, i) => `To${o.dropoffs.length > 1 ? ` #${i + 1}` : ""}: ${d.address} (${d.contactName})`),
    `Contents: ${o.contents}`,
    `Delivery fee: ${formatAED(o.fee)}`,
    `Tip: ${formatAED(o.tip)}`,
    `Discount: -${formatAED(o.discount)}`,
    `Total paid: ${formatAED(o.total)}`,
    `Payment method: ${o.paymentMethod === "card" ? "Card" : "Cash"}`,
    `Transaction ID: ${o.transactionId}`,
  ].join("\n");
}

function InfoRow({ icon, label, children }: { icon: keyof typeof Ionicons.glyphMap; label: string; children: ReactNode }) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <Ionicons name={icon} size={18} color={colors.brand} />
      <Text className="flex-1 text-sm text-ink">{label}</Text>
      {children}
    </View>
  );
}

/**
 * Receipt + card illustration from the design, drawn with views.
 * TODO: swap for the exported Figma image if one is provided.
 */
function ReceiptIllustration() {
  return (
    <View style={{ width: 220, height: 170 }} className="items-center justify-center">
      <View className="absolute h-36 w-52 rounded-[70px] bg-brand-light opacity-70" />
      <View
        className="absolute right-6 top-14 h-20 w-28 rounded-xl bg-brand"
        style={{ transform: [{ rotate: "-8deg" }] }}
      >
        <View className="ml-auto mr-4 mt-4 h-4 w-5 rounded bg-brand-light opacity-80" />
        <View className="ml-4 mt-6 h-2 w-14 rounded-full bg-brand-light opacity-80" />
      </View>
      <View
        className="absolute left-10 top-2 h-36 w-24 items-center rounded-xl bg-white pt-5"
        style={{ transform: [{ rotate: "-6deg" }], shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}
      >
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand">
          <Ionicons name="checkmark" size={26} color={colors.white} />
        </View>
        <View className="mt-4 h-1.5 w-16 rounded-full bg-line" />
        <View className="mt-2 h-1.5 w-12 rounded-full bg-line" />
        <View className="mt-2 h-1.5 w-8 rounded-full bg-line" />
      </View>
    </View>
  );
}

/** Payment Successful — shared by the customer and store flows. */
export default function PaymentSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  const copyTxn = async () => {
    if (!order) return;
    await Clipboard.setStringAsync(order.transactionId);
    Alert.alert("Copied", "Transaction ID copied to clipboard.");
  };

  return (
    <Screen
      background="white"
      footer={
        order ? (
          <View className="gap-3">
            <ArrowContinueButton title="Back to Home" tone="dark" onPress={goHome} />
            <Button
              title="Download Receipt"
              variant="outlineDark"
              icon="download-outline"
              onPress={() => Share.share({ title: `Receipt ${order.code}`, message: receiptText(order) })}
            />
            <Pressable onPress={() => router.push(`/orders/${order.id}/track`)} hitSlop={8} className="self-center py-1">
              <Text className="font-inter-semibold text-sm text-brand">Track order</Text>
            </Pressable>
          </View>
        ) : undefined
      }
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <Header onBack={goHome} right={<Logo size="sm" />} />

      <View className="items-center px-5">
        <ReceiptIllustration />
        <View className="mt-4"><GradientText className="font-inter-bold text-[28px]">Payment Successful</GradientText></View>
        <Text className="mt-1 px-10 text-center text-sm leading-6 text-body">Your payment has been completed successfully.</Text>
      </View>

      <View className="mt-4 px-5">
        {isLoading && <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />}
        {(isError || (!isLoading && !order)) && (
          <View className="mt-6 items-center gap-3">
            <Text className="text-sm text-body">We couldn't load your order details.</Text>
            {orderId ? (
              <Button title="Retry" size="sm" variant="outline" onPress={() => refetch()} />
            ) : (
              <Button title="Go home" size="sm" variant="outline" onPress={goHome} />
            )}
          </View>
        )}

        {order && (
          <>
            <Card>
              <View className="flex-row items-center gap-3">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-lighter">
                  <Ionicons name="cube-outline" size={30} color={colors.brand} />
                  <View className="absolute bottom-3 right-3 h-4 w-4 items-center justify-center rounded-full bg-brand">
                    <Ionicons name="checkmark" size={11} color={colors.white} />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-base">{order.code}</Text>
                  <Text className="mt-1 text-xs text-brand-dark">
                    Received by {order.dropoffs.map((d) => d.contactName).join(", ")}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-muted">{formatDayLabel(order.createdAt)}</Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center justify-between rounded-xl bg-brand-lighter px-3 py-3">
                <Text className="font-inter-medium text-sm">Paid Amount</Text>
                <Text className="font-inter-bold text-xl text-brand-dark">{formatAED(order.total)}</Text>
              </View>
            </Card>

            <Card className="mt-3 py-2">
              <InfoRow icon="card-outline" label="Payment Method">
                <View className="rounded-full bg-brand-light px-3 py-1">
                  <Text className="font-inter-semibold text-[11px] text-brand-dark">
                    {order.paymentMethod === "card" ? "Card" : "Cash"}
                  </Text>
                </View>
              </InfoRow>
              <InfoRow icon="calendar-outline" label="Payment Date">
                <Text className="font-inter-medium text-xs">
                  {formatDate(order.paidAt)} · {formatTime(order.paidAt)}
                </Text>
              </InfoRow>
              <InfoRow icon="receipt-outline" label="Transaction ID">
                <Pressable onPress={copyTxn} hitSlop={8} accessibilityLabel="Copy transaction ID" className="flex-row items-center gap-1.5">
                  <Text className="font-inter-medium text-xs">{order.transactionId}</Text>
                  <Ionicons name="copy-outline" size={14} color={colors.brand} />
                </Pressable>
              </InfoRow>
            </Card>
          </>
        )}
      </View>
    </Screen>
  );
}
