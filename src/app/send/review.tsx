import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Screen, Text } from "@/components/ui";
import { OffersRewards, TipSelector, useDraftDiscount } from "@/components/delivery";
import { FlowHeader, FlowSheet, OrderCostSummary, PREFERENCES, ReviewSection, useDraftPricing } from "@/components/send";
import { useCreateOrder } from "@/api/hooks";
import type { OrderStop } from "@/api/types";
import { formatAED } from "@/lib/format";
import { useT } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetDelivery, setTip, Stop } from "@/store/slices/deliverySlice";

const fullPhone = (phone: string) => `+971 ${phone.trim()}`;

const toOrderStop = (s: Stop): OrderStop => ({
  address: s.address.trim(),
  contactName: s.contact.fullName.trim(),
  contactPhone: fullPhone(s.contact.phone),
  notes: s.notes.trim() || undefined,
  latitude: s.latitude,
  longitude: s.longitude,
});

function StopLine({ label, stop, last }: { label: string; stop: Stop; last?: boolean }) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center pt-1">
        <View className={`h-2.5 w-2.5 rounded-full ${last ? "bg-brand-dark" : "bg-brand-accent"}`} />
        {!last && <View className="mt-1 w-px flex-1 bg-line" />}
      </View>
      <View className={`flex-1 ${last ? "" : "pb-3"}`}>
        <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">{label}</Text>
        <Text className="mt-0.5 font-inter-medium text-sm">{stop.address || "—"}</Text>
        <View className="mt-0.5 flex-row flex-wrap items-center">
          <Text className="text-xs text-muted">{stop.contact.fullName} · </Text>
          <View style={{ direction: "ltr" }}>
            <Text className="text-xs text-muted">{fullPhone(stop.contact.phone)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Review delivery (6 of 7) — creates the order and goes to Payment Successful. */
export default function ReviewScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.delivery);
  const { isShopping, serviceFee, delivery, shoppingFee, distanceKm, etaMinutes } = useDraftPricing();
  const discount = useDraftDiscount();
  const createOrder = useCreateOrder();
  const total = Math.max(0, serviceFee + draft.tip - discount);

  const prefLabels = PREFERENCES.filter((p) => draft.preferences.includes(p.value)).map((p) => t(p.labelKey));
  const contents = isShopping
    ? draft.shopping.request.trim() || t("send.shoppingAt", { store: draft.shopping.storeName.trim() })
    : draft.packageContents.trim();

  const goToPay = () =>
    createOrder.mutate(
      {
        flow: draft.flow,
        vehicle: draft.vehicle ?? "motorcycle",
        pickup: toOrderStop(draft.pickup),
        dropoffs: [toOrderStop(draft.dropoff)],
        contents,
        tip: draft.tip,
        discount,
        fee: serviceFee,
        distanceKm,
        etaMinutes,
      },
      {
        onSuccess: (order) => {
          dispatch(resetDelivery());
          router.replace(`/payment-success?orderId=${order.id}`);
        },
        onError: () => Alert.alert(t("send.paymentFailedTitle"), t("send.paymentFailedBody")),
      },
    );

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title={t("send.goToPay")} loading={createOrder.isPending} onPress={goToPay} />}>
      <FlowHeader step={t("send.stepReview")} title={t("send.reviewTitle")} subtitle={t("send.reviewSub")} />
      <FlowSheet>

        <ReviewSection title={t("send.locationsContacts")} onEdit={() => router.dismissTo("/send/pickup")}>
          <StopLine label={t("send.pickup")} stop={draft.pickup} />
          <StopLine label={t("send.dropoff")} stop={draft.dropoff} last />
        </ReviewSection>

        <ReviewSection title={isShopping ? t("send.sectionShopping") : t("send.sectionPackage")} onEdit={() => router.dismissTo(isShopping ? "/send/shopping" : "/send/package")}>
          {isShopping ? (
            <>
              <Text className="text-sm">
                {draft.shopping.storeName} · {draft.shopping.alreadyPaid ? t("send.alreadyPaid") : t("send.notPaid")}
              </Text>
              {!!draft.shopping.request.trim() && (
                <Text className="mt-0.5 text-xs text-muted" numberOfLines={2}>
                  {draft.shopping.request}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm">{t("send.smallBox", { contents: draft.packageContents })}</Text>
          )}
          <Text className="mt-0.5 text-xs text-muted">
            {[prefLabels.join(", "), draft.deliveryNotes.trim()].filter(Boolean).join(" · ") || t("send.noPreference")}
          </Text>
        </ReviewSection>

        <ReviewSection title={t("send.timePayment")}>
          <Text className="text-sm">{t("send.asap")}</Text>
          <Text className="mt-0.5 text-xs text-muted">
            {t("location.etaShort", { range: t("common.minutesRange", { min: etaMinutes[0], max: etaMinutes[1] }) })} ·{" "}
            {t("common.km", { km: distanceKm })} · {draft.vehicle === "car" ? t("send.car") : t("send.motorcycle")} ·{" "}
            {draft.speed === "minutes" ? t("send.speedMinutes") : t("send.speedStandard")}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">{t("send.cashOnDelivery")}</Text>
        </ReviewSection>

        {isShopping && <OrderCostSummary className="mt-4" />}

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-inter-semibold text-sm">{t("send.totalDeliveryFee")}</Text>
              <Text className="mt-0.5 text-[11px] text-muted">
                {t("send.feeDelivery", { amount: formatAED(delivery) })}
                {shoppingFee ? t("send.feeShopping", { amount: formatAED(shoppingFee) }) : ""}
                {draft.tip ? t("send.feeTip", { amount: formatAED(draft.tip) }) : ""}
                {discount ? t("send.feeDiscount", { amount: formatAED(discount) }) : ""}
              </Text>
            </View>
            <Text className="font-inter-bold text-xl text-brand-dark">{formatAED(total)}</Text>
          </View>
        </Card>

        <View className="mt-4 gap-4">
          <OffersRewards />
          <TipSelector value={draft.tip} onChange={(v) => dispatch(setTip(v))} />
        </View>
      </FlowSheet>
    </Screen>
  );
}
