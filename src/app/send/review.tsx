import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Header, Screen, Text } from "@/components/ui";
import { OffersRewards, TipSelector, useDraftDiscount } from "@/components/delivery";
import { OrderCostSummary, PREFERENCES, ReviewSection, StepPill, useDraftPricing } from "@/components/send";
import { useCreateOrder } from "@/api/hooks";
import type { OrderStop } from "@/api/types";
import { formatAED } from "@/lib/format";
import { ETA_MINUTES } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetDelivery, setTip, Stop } from "@/store/slices/deliverySlice";

const fullPhone = (phone: string) => `+971 ${phone.trim()}`;

const toOrderStop = (s: Stop): OrderStop => ({
  address: s.address.trim(),
  contactName: s.contact.fullName.trim(),
  contactPhone: fullPhone(s.contact.phone),
  notes: s.notes.trim() || undefined,
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
        <Text className="mt-0.5 text-xs text-muted">
          {stop.contact.fullName} · {fullPhone(stop.contact.phone)}
        </Text>
      </View>
    </View>
  );
}

/** Review delivery (6 of 7) — creates the order and goes to Payment Successful. */
export default function ReviewScreen() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.delivery);
  const { isShopping, serviceFee, delivery, shoppingFee } = useDraftPricing();
  const discount = useDraftDiscount();
  const createOrder = useCreateOrder();
  const total = Math.max(0, serviceFee + draft.tip - discount);

  const prefLabels = PREFERENCES.filter((p) => draft.preferences.includes(p.value)).map((p) => p.label);
  const contents = isShopping
    ? draft.shopping.request.trim() || `Shopping at ${draft.shopping.storeName.trim()}`
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
      },
      {
        onSuccess: (order) => {
          dispatch(resetDelivery());
          router.replace(`/payment-success?orderId=${order.id}`);
        },
        onError: () => Alert.alert("Payment failed", "We couldn't place your order. Please try again."),
      },
    );

  return (
    <Screen footer={<Button title="Go to pay" loading={createOrder.isPending} onPress={goToPay} />}>
      <Header actions />
      <View className="px-5">
        <StepPill label="6 of 7 · Review" />
        <Text className="mt-3 font-inter-bold text-2xl">Ready to send?</Text>
        <Text className="mt-1 text-sm text-body">Review your delivery. Edit anything below.</Text>

        <ReviewSection title="Locations & contacts" onEdit={() => router.dismissTo("/send/pickup")}>
          <StopLine label="Pickup" stop={draft.pickup} />
          <StopLine label="Drop-off" stop={draft.dropoff} last />
        </ReviewSection>

        <ReviewSection title={isShopping ? "Shopping" : "Package"} onEdit={() => router.dismissTo(isShopping ? "/send/shopping" : "/send/package")}>
          {isShopping ? (
            <>
              <Text className="text-sm">
                {draft.shopping.storeName} · {draft.shopping.alreadyPaid ? "Already paid" : "Not paid"}
              </Text>
              {!!draft.shopping.request.trim() && (
                <Text className="mt-0.5 text-xs text-muted" numberOfLines={2}>
                  {draft.shopping.request}
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm">Small box · {draft.packageContents}</Text>
          )}
          <Text className="mt-0.5 text-xs text-muted">
            {[prefLabels.join(", "), draft.deliveryNotes.trim()].filter(Boolean).join(" · ") || "No delivery preference"}
          </Text>
        </ReviewSection>

        <ReviewSection title="Time & payment">
          <Text className="text-sm">As soon as possible · Pickup in 10–15 min</Text>
          <Text className="mt-0.5 text-xs text-muted">
            ETA {ETA_MINUTES[0]}–{ETA_MINUTES[1]} min · {draft.vehicle === "car" ? "Car" : "Motorcycle"} ·{" "}
            {draft.speed === "minutes" ? "Rush In Minutes" : "Standard"}
          </Text>
          <Text className="mt-0.5 text-xs text-muted">Cash on delivery · Receiver pays at drop-off</Text>
        </ReviewSection>

        {isShopping && <OrderCostSummary className="mt-4" />}

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-inter-semibold text-sm">Total delivery fee</Text>
              <Text className="mt-0.5 text-[11px] text-muted">
                Delivery {formatAED(delivery)}
                {shoppingFee ? ` · Shopping ${formatAED(shoppingFee)}` : ""}
                {draft.tip ? ` · Tip ${formatAED(draft.tip)}` : ""}
                {discount ? ` · Discount -${formatAED(discount)}` : ""}
              </Text>
            </View>
            <Text className="font-inter-bold text-xl text-brand-dark">{formatAED(total)}</Text>
          </View>
        </Card>

        <View className="mt-4 gap-4">
          <OffersRewards />
          <TipSelector value={draft.tip} onChange={(v) => dispatch(setTip(v))} />
        </View>
      </View>
    </Screen>
  );
}
