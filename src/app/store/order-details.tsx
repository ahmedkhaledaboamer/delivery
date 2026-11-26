import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, DirIcon, PhoneField, RouteMap, Screen, Sheet, Text, TextField, isValidPhone } from "@/components/ui";
import { useStorePickup } from "@/components/store/useStorePickup";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";
import { coordsOf } from "@/lib/geo";
import { quoteRoute } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateStoreOrder } from "@/store/slices/deliverySlice";

export default function StoreOrderDetails() {
  const t = useT();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ index?: string }>();
  const index = Math.max(0, Number(params.index ?? 0) || 0);
  const orders = useAppSelector((s) => s.delivery.storeOrders);
  const { vehicle, speed } = useAppSelector((s) => s.delivery);
  const pickup = useStorePickup();
  const order = orders[index];

  if (!order) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-body">{t("location.orderMissing")}</Text>
          <Button className="mt-4 w-full" title={t("location.startNewRequest")} onPress={() => router.replace("/store/create-request")} />
        </View>
      </Screen>
    );
  }

  const { dropoff, contents } = order;
  const hasAddress = dropoff.address.trim().length > 2;
  const dropCoords = coordsOf(dropoff);
  const quote = dropCoords ? quoteRoute(pickup, dropCoords, vehicle ?? "car", speed) : null;
  const valid =
    hasAddress &&
    contents.trim().length > 0 &&
    dropoff.contact.fullName.trim().length > 1 &&
    isValidPhone(dropoff.contact.phone);

  const update = (patch: Parameters<typeof updateStoreOrder>[0]) => dispatch(updateStoreOrder(patch));

  const next = () => {
    if (index + 1 < orders.length) router.push(`/store/order-details?index=${index + 1}`);
    else router.push("/store/confirm-route");
  };

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title={t("common.continue")} disabled={!valid} onPress={next} />}>
      <RouteMap
        mode="dropoff"
        stepLabel={t("location.stepRoute1")}
        pickup={coordsOf(pickup)}
        dropoff={dropCoords}
      />
      <Sheet>
        <View className="mb-5 flex-row items-center gap-2">
          <Ionicons name="cube-outline" size={24} color={colors.brand} />
          <Text className="font-inter-bold text-xl">{t("location.orderNumber", { n: index + 1 })}</Text>
        </View>

        <Text className="mb-2 font-inter-medium text-sm">{t("location.dropoffLocation")}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("location.dropoffLocation")}
          onPress={() => router.push(`/location-picker?target=store-${index}`)}
          className="mb-2 min-h-[56px] flex-row items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 active:bg-brand-lighter"
        >
          <Ionicons name="location-outline" size={18} color={colors.brand} />
          <View className="flex-1">
            <Text className={`text-sm ${hasAddress ? "font-inter-medium" : "text-muted"}`} numberOfLines={2}>
              {hasAddress ? dropoff.address : t("location.chooseOnMap")}
            </Text>
          </View>
          <DirIcon name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
        {quote ? (
          <Text className="mb-4 text-[11px] text-muted">
            {t("location.quoteLine", {
              km: t("common.km", { km: quote.distanceKm }),
              fee: t("common.aed", { amount: quote.fee }),
              eta: t("common.minutesRange", { min: quote.etaMinutes[0], max: quote.etaMinutes[1] }),
            })}
          </Text>
        ) : (
          <View className="mb-2" />
        )}

        <TextField
          label={t("location.whatsInside")}
          hint="required"
          placeholder={t("location.typePlaceholder")}
          multiline
          maxLength={200}
          value={contents}
          onChangeText={(c) => update({ index, contents: c })}
        />

        <View className="mb-3 mt-2 flex-row items-center gap-2">
          <Ionicons name="download-outline" size={18} color={colors.brand} />
          <Text className="font-inter-semibold text-base">{t("location.receiver")}</Text>
        </View>
        <TextField
          label={t("common.fullName")}
          hint="required"
          placeholder={t("common.fullName")}
          autoCapitalize="words"
          value={dropoff.contact.fullName}
          onChangeText={(fullName) => update({ index, dropoff: { contact: { ...dropoff.contact, fullName } } })}
        />
        <PhoneField
          hint="required"
          value={dropoff.contact.phone}
          onChangeText={(phone) => update({ index, dropoff: { contact: { ...dropoff.contact, phone } } })}
        />
      </Sheet>
    </Screen>
  );
}
