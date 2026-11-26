import type { ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, Share, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Button, Card, GradientText, Header, Screen, Text } from "@/components/ui";
import { useOrder } from "@/api/hooks";
import type { Order } from "@/api/types";
import { colors } from "@/constants/theme";
import { formatAED, formatDate, formatDayLabel, formatTime } from "@/lib/format";
import { useT, type TFunction } from "@/i18n";

const goHome = () => router.replace("/(tabs)");

function receiptText(o: Order, t: TFunction) {
  return [
    t("payment.receiptHeading"),
    t("payment.rOrder", { v: o.code }),
    t("payment.rDate", { v: `${formatDate(o.paidAt)} ${formatTime(o.paidAt)}` }),
    t("payment.rFrom", { v: o.pickup.address }),
    ...o.dropoffs.map((d, i) => {
      const v = `${d.address} (${d.contactName})`;
      return o.dropoffs.length > 1 ? t("payment.rToN", { n: i + 1, v }) : t("payment.rTo", { v });
    }),
    t("payment.rContents", { v: o.contents }),
    t("payment.rFee", { v: formatAED(o.fee) }),
    t("payment.rTip", { v: formatAED(o.tip) }),
    t("payment.rDiscount", { v: formatAED(o.discount) }),
    t("payment.rTotal", { v: formatAED(o.total) }),
    t("payment.rMethod", { v: o.paymentMethod === "card" ? t("payment.card") : t("payment.cash") }),
    t("payment.rTxn", { v: o.transactionId }),
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
  const t = useT();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);

  const copyTxn = async () => {
    if (!order) return;
    await Clipboard.setStringAsync(order.transactionId);
    Alert.alert(t("payment.copied"), t("payment.txnCopied"));
  };

  return (
    <Screen
      background="white"
      footer={
        order ? (
          <View className="gap-3">
            <Button title={t("payment.trackOrder")} onPress={() => router.push(`/orders/${order.id}/track`)} />
            <Button
              title={t("payment.downloadReceipt")}
              variant="outline"
              icon="download-outline"
              onPress={() => Share.share({ title: t("payment.receiptShareTitle", { code: order.code }), message: receiptText(order, t) })}
            />
            <View className="flex-row items-center gap-2 self-center rounded-full border border-line bg-white px-3 py-1.5">
              {(
                [
                  ["home-outline", t("common.tabHome"), "/(tabs)"],
                  ["document-text-outline", t("common.tabOrders"), "/(tabs)/orders"],
                  ["person-outline", t("common.tabProfile"), "/(tabs)/profile"],
                ] as const
              ).map(([icon, label, href]) => (
                <Pressable
                  key={href}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  onPress={() => router.replace(href)}
                  className="h-9 w-14 items-center justify-center rounded-full active:bg-brand-light"
                >
                  <Ionicons name={icon} size={18} color={colors.ink} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : undefined
      }
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <Header onBack={goHome} actions />

      <View className="items-center px-5">
        <ReceiptIllustration />
        <View className="mt-4"><GradientText className="font-inter-bold text-[28px]">{t("payment.title")}</GradientText></View>
        <Text className="mt-1 px-10 text-center text-sm leading-6 text-body">{t("payment.subtitle")}</Text>
      </View>

      <View className="mt-4 px-5">
        {isLoading && <ActivityIndicator color={colors.brand} style={{ marginTop: 24 }} />}
        {(isError || (!isLoading && !order)) && (
          <View className="mt-6 items-center gap-3">
            <Text className="text-sm text-body">{t("payment.loadError")}</Text>
            {orderId ? (
              <Button title={t("common.retry")} size="sm" variant="outline" onPress={() => refetch()} />
            ) : (
              <Button title={t("payment.goHome")} size="sm" variant="outline" onPress={goHome} />
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
                  <View style={{ direction: "ltr" }} className="self-start">
                    <Text className="font-inter-bold text-base">{order.code}</Text>
                  </View>
                  <Text className="mt-1 text-xs text-brand-dark">
                    {t("payment.receivedBy", { names: order.dropoffs.map((d) => d.contactName).join(t("payment.listSep")) })}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-muted">{formatDayLabel(order.createdAt)}</Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center justify-between rounded-xl bg-brand-lighter px-3 py-3">
                <Text className="font-inter-medium text-sm">{t("payment.paidAmount")}</Text>
                <Text className="font-inter-bold text-xl text-brand-dark">{formatAED(order.total)}</Text>
              </View>
            </Card>

            <Card className="mt-3 py-2">
              <InfoRow icon="card-outline" label={t("payment.paymentMethod")}>
                <View className="rounded-full bg-brand-light px-3 py-1">
                  <Text className="font-inter-semibold text-[11px] text-brand-dark">
                    {order.paymentMethod === "card" ? t("payment.card") : t("payment.cash")}
                  </Text>
                </View>
              </InfoRow>
              <InfoRow icon="calendar-outline" label={t("payment.paymentDate")}>
                <Text className="font-inter-medium text-xs">
                  {formatDate(order.paidAt)} · {formatTime(order.paidAt)}
                </Text>
              </InfoRow>
              <InfoRow icon="receipt-outline" label={t("payment.transactionId")}>
                <Pressable onPress={copyTxn} hitSlop={8} accessibilityLabel={t("payment.copyTxn")} className="flex-row items-center gap-1.5">
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
