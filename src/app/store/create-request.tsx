import { useEffect } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Header, OptionCard, QuantityStepper, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  MAX_STORE_ORDERS,
  setStoreOrderCount,
  setStoreOrderType,
  setVehicle,
  startFlow,
} from "@/store/slices/deliverySlice";

/** labelKey is a translation key (rendered with t()). */
const FEATURES: { icon: keyof typeof Ionicons.glyphMap; labelKey: string }[] = [
  { icon: "flash-outline", labelKey: "store.featureFast" },
  { icon: "shield-checkmark-outline", labelKey: "store.featureSafe" },
  { icon: "options-outline", labelKey: "store.featureFlexible" },
];

function Photo({ source, width = 80 }: { source: ImageSourcePropType; width?: number }) {
  return <Image source={source} resizeMode="contain" style={{ width, height: 56 }} />;
}

/** Two boxes stacked — "Multiple Orders". */
function StackedBoxes() {
  return (
    <View style={{ width: 84, height: 56 }}>
      <Image source={images.box} resizeMode="contain" style={{ position: "absolute", left: 0, top: 0, width: 56, height: 40 }} />
      <Image source={images.box} resizeMode="contain" style={{ position: "absolute", right: 0, bottom: 0, width: 60, height: 42 }} />
    </View>
  );
}

export default function CreateDeliveryRequest() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { flow, storeOrderType, vehicle, storeOrders } = useAppSelector((s) => s.delivery);

  useEffect(() => {
    if (flow !== "store") dispatch(startFlow("store"));
  }, [flow, dispatch]);

  const count = storeOrders.length;
  const valid =
    flow === "store" &&
    ((storeOrderType === "single" && !!vehicle) || (storeOrderType === "multiple" && count >= 2 && count <= MAX_STORE_ORDERS));

  return (
    <Screen
      footer={<Button title={t("common.continue")} disabled={!valid} onPress={() => router.push("/store/order-details?index=0")} />}
    >
      <Header actions />

      <View className="flex-row items-center px-5">
        <View className="flex-1 pe-3">
          <Text className="font-inter-bold text-2xl">{t("store.createTitle")}</Text>
          <Text className="mt-1 text-sm text-body">{t("store.createSub")}</Text>
        </View>
        <Image source={images.store} resizeMode="contain" style={{ width: 130, height: 80 }} />
      </View>

      <View className="mx-5 mt-5 flex-row items-center justify-between rounded-2xl border border-line bg-white px-3 py-3">
        {FEATURES.map((f) => (
          <View key={f.labelKey} className="flex-row items-center gap-1.5">
            <Ionicons name={f.icon} size={14} color={colors.brand} />
            <Text className="text-[11px] text-body">{t(f.labelKey)}</Text>
          </View>
        ))}
      </View>

      <View className="mt-7 px-5">
        <Text className="font-inter-semibold text-base">{t("store.deliveryType")}</Text>
        <Text className="mt-0.5 text-xs text-body">{t("store.deliveryTypeSub")}</Text>
        <View className="mt-3 flex-row gap-3">
          <OptionCard
            selected={storeOrderType === "single"}
            onPress={() => dispatch(setStoreOrderType("single"))}
            title={t("store.singleOrder")}
            description={t("store.singleOrderDesc")}
            media={<Photo source={images.box} />}
          />
          <OptionCard
            selected={storeOrderType === "multiple"}
            onPress={() => dispatch(setStoreOrderType("multiple"))}
            title={t("store.multipleOrders")}
            description={t("store.multipleOrdersDesc")}
            media={<StackedBoxes />}
          />
        </View>
      </View>

      {storeOrderType === "single" && (
        <View className="mt-6 px-5">
          <Text className="font-inter-semibold text-base">{t("store.chooseService")}</Text>
          <Text className="mt-0.5 text-xs text-body">{t("store.chooseServiceSub")}</Text>
          <View className="mt-3 flex-row gap-3">
            <OptionCard
              selected={vehicle === "motorcycle"}
              onPress={() => dispatch(setVehicle("motorcycle"))}
              title={t("store.motorcycle")}
              description={t("store.motorcycleDesc")}
              media={<Photo source={images.scooter} width={96} />}
            />
            <OptionCard
              selected={vehicle === "car"}
              onPress={() => dispatch(setVehicle("car"))}
              title={t("store.car")}
              description={t("store.carDesc")}
              media={<Photo source={images.car} width={96} />}
            />
          </View>
        </View>
      )}

      {storeOrderType === "multiple" && (
        <View className="mt-6 px-5">
          <Text className="font-inter-semibold text-base">{t("store.orderCount")}</Text>
          <Text className="mt-0.5 text-xs text-body">{t("store.orderCountSub")}</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <QuantityStepper
              value={Math.max(2, count)}
              min={2}
              max={MAX_STORE_ORDERS}
              onChange={(v) => dispatch(setStoreOrderCount(v))}
            />
            <View className="flex-row items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5">
              <Ionicons name="information-circle-outline" size={14} color={colors.brand} />
              <Text className="font-inter-medium text-[11px] text-brand-dark">{t("store.upToOrders", { n: MAX_STORE_ORDERS })}</Text>
            </View>
          </View>
          <View className="mt-5 flex-row items-center gap-2 rounded-xl bg-brand-lighter px-3 py-3">
            <Ionicons name="car-outline" size={18} color={colors.brand} />
            <Text className="flex-1 text-xs text-body">
              <Text className="font-inter-semibold text-xs text-brand">{t("store.notePrefix")}</Text>
              {t("store.carsOnly")}
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
