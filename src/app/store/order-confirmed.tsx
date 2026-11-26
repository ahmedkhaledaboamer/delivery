import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, GradientText, IconButton, Screen, Text } from "@/components/ui";
import { OffersRewards, TermsAgreement, useDraftDiscount } from "@/components/delivery";
import { useStorePickup, useStoreQuotes } from "@/components/store/useStorePickup";
import { useCreateOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetDelivery } from "@/store/slices/deliverySlice";

export default function StoreOrderConfirmed() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { storeOrders, vehicle, tip, agreedToTerms } = useAppSelector((s) => s.delivery);
  const discount = useDraftDiscount();
  const pickup = useStorePickup();
  const { quotes, totalFee, totalKm, eta } = useStoreQuotes();
  const createOrder = useCreateOrder();
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const n = storeOrders.length;

  const pay = () => {
    const v = vehicle ?? "car";
    createOrder.mutate(
      {
        flow: "store",
        vehicle: v,
        pickup: {
          address: pickup.address,
          contactName: pickup.contactName,
          contactPhone: pickup.contactPhone,
          latitude: pickup.latitude,
          longitude: pickup.longitude,
        },
        dropoffs: storeOrders.map((o) => ({
          address: o.dropoff.address,
          contactName: o.dropoff.contact.fullName,
          contactPhone: o.dropoff.contact.phone,
          notes: o.dropoff.notes || undefined,
          latitude: o.dropoff.latitude,
          longitude: o.dropoff.longitude,
        })),
        contents: storeOrders.map((o) => o.contents.trim()).filter(Boolean).join(", "),
        tip,
        discount,
        // Each order is priced from its own distance (store → that drop-off).
        fee: totalFee,
        distanceKm: totalKm,
        etaMinutes: eta,
      },
      {
        onSuccess: (order) => {
          dispatch(resetDelivery());
          router.replace(`/payment-success?orderId=${order.id}`);
        },
        onError: (e) =>
          Alert.alert(t("location.placeOrderFailed"), e instanceof Error ? e.message : t("common.somethingWrong")),
      },
    );
  };

  return (
    <Screen
      edges={["bottom"]}
      footer={
        <Button
          title={t("location.goToPay")}
          disabled={!agreedToTerms || n === 0}
          loading={createOrder.isPending}
          onPress={pay}
        />
      }
    >
      <LinearGradient colors={[colors.brandLight, colors.surface]} style={{ paddingBottom: 24 }}>
        <View className="flex-row items-center gap-2 px-4" style={{ paddingTop: insets.top + 8 }}>
          <IconButton name="arrow-back" accessibilityLabel={t("common.back")} onPress={() => router.back()} />
          <View className="rounded-full bg-white px-3 py-2">
            <Text className="font-inter-medium text-xs">{t("location.stepRoute2")}</Text>
          </View>
        </View>
        <View className="mt-2 items-center">
          <Image source={images.storeConfirmed} resizeMode="contain" style={{ width: 190, height: 190 }} />
          <View className="mt-4 flex-row items-center">
            <Text className="font-inter-bold text-3xl">{t("location.orderConfirmedA")} </Text>
            <GradientText className="font-inter-bold text-3xl">{t("location.orderConfirmedB")}</GradientText>
          </View>
          <Text className="mt-2 px-10 text-center text-sm text-body">{t("location.orderConfirmedBody")}</Text>
        </View>
      </LinearGradient>

      <View className="gap-4 px-5">
        <Card tone="tint">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
              <Ionicons name="cube-outline" size={22} color={colors.brand} />
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-lg">
                {n === 1 ? t("location.oneOrder") : t("location.nOrders", { n })}
              </Text>
              <Text className="text-xs text-body">{t("location.pickedUpFromStore")}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row gap-3 border-b border-line pb-3">
            <View className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-accent" />
            <View className="flex-1">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">{t("common.pickup")}</Text>
              <Text className="mt-0.5 font-inter-medium text-sm">{pickup.address}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={() => setExpanded((e) => !e)}
            className="flex-row items-center gap-3 pt-3"
          >
            <View className="h-2.5 w-2.5 rounded-full bg-brand-dark" />
            <View className="flex-1">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">{t("common.dropoff")}</Text>
              <Text className="mt-0.5 font-inter-medium text-sm">
                {n === 1 ? t("location.oneLocation") : t("location.nLocations", { n })}
              </Text>
            </View>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.body} />
          </Pressable>
          {expanded && (
            <View className="mt-3 gap-2 ps-5">
              {storeOrders.map((o, i) => {
                const q = quotes[i];
                return (
                  <View key={i} className="flex-row gap-2">
                    <Text className="font-inter-semibold text-xs text-brand">#{i + 1}</Text>
                    <View className="flex-1">
                      <Text className="text-sm">{o.dropoff.address || "—"}</Text>
                      {!!o.dropoff.contact.fullName && (
                        <Text className="text-[11px] text-muted">{o.dropoff.contact.fullName}</Text>
                      )}
                      {q && (
                        <Text className="text-[11px] text-muted">
                          {t("common.km", { km: q.distanceKm })} · {t("common.aed", { amount: q.fee })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3">
            <View className="flex-1">
              <Text className="font-inter-semibold text-sm">{t("location.totalDeliveryFee")}</Text>
              <Text className="text-[11px] text-muted">
                {t("common.km", { km: totalKm })} ·{" "}
                {t("common.minutesRange", { min: eta[0], max: eta[1] })}
              </Text>
            </View>
            <Text className="font-inter-bold text-lg text-brand-dark">{t("common.aed", { amount: totalFee })}</Text>
          </View>
        </Card>

        <OffersRewards />

        <Card>
          <TermsAgreement />
        </Card>
      </View>
    </Screen>
  );
}
