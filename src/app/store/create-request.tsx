import { useEffect } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Header, OptionCard, QuantityStepper, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  MAX_STORE_ORDERS,
  setStoreOrderCount,
  setStoreOrderType,
  setVehicle,
  startFlow,
} from "@/store/slices/deliverySlice";

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "flash-outline", label: "Fast Delivery" },
  { icon: "shield-checkmark-outline", label: "Safe & Reliable" },
  { icon: "options-outline", label: "Flexible option" },
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
      footer={<Button title="Continue" disabled={!valid} onPress={() => router.push("/store/order-details?index=0")} />}
    >
      <Header actions />

      <View className="flex-row items-center px-5">
        <View className="flex-1 pr-3">
          <Text className="font-inter-bold text-2xl">Create Delivery Request</Text>
          <Text className="mt-1 text-sm text-body">Choose the shipment details for your store orders.</Text>
        </View>
        <Image source={images.store} resizeMode="contain" style={{ width: 130, height: 80 }} />
      </View>

      <View className="mx-5 mt-5 flex-row items-center justify-between rounded-2xl border border-line bg-white px-3 py-3">
        {FEATURES.map((f) => (
          <View key={f.label} className="flex-row items-center gap-1.5">
            <Ionicons name={f.icon} size={14} color={colors.brand} />
            <Text className="text-[11px] text-body">{f.label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-7 px-5">
        <Text className="font-inter-semibold text-base">Delivery Type</Text>
        <Text className="mt-0.5 text-xs text-body">When do you need it delivered?</Text>
        <View className="mt-3 flex-row gap-3">
          <OptionCard
            selected={storeOrderType === "single"}
            onPress={() => dispatch(setStoreOrderType("single"))}
            title="Single Order"
            description="Send one order to your customer."
            media={<Photo source={images.box} />}
          />
          <OptionCard
            selected={storeOrderType === "multiple"}
            onPress={() => dispatch(setStoreOrderType("multiple"))}
            title="Multiple Orders"
            description="Deliver multiple orders in one trip and save time."
            media={<StackedBoxes />}
          />
        </View>
      </View>

      {storeOrderType === "single" && (
        <View className="mt-6 px-5">
          <Text className="font-inter-semibold text-base">Choose Service</Text>
          <Text className="mt-0.5 text-xs text-body">What would you like to do?</Text>
          <View className="mt-3 flex-row gap-3">
            <OptionCard
              selected={vehicle === "motorcycle"}
              onPress={() => dispatch(setVehicle("motorcycle"))}
              title="Motorcycle"
              description="Best for small packages. Faster in busy areas."
              media={<Photo source={images.scooter} width={96} />}
            />
            <OptionCard
              selected={vehicle === "car"}
              onPress={() => dispatch(setVehicle("car"))}
              title="Car"
              description="Ideal for larger packages. Extra space and protection."
              media={<Photo source={images.car} width={96} />}
            />
          </View>
        </View>
      )}

      {storeOrderType === "multiple" && (
        <View className="mt-6 px-5">
          <Text className="font-inter-semibold text-base">Order Count</Text>
          <Text className="mt-0.5 text-xs text-body">How many Orders do you want to deliver?</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <QuantityStepper
              value={Math.max(2, count)}
              min={2}
              max={MAX_STORE_ORDERS}
              onChange={(v) => dispatch(setStoreOrderCount(v))}
            />
            <View className="flex-row items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5">
              <Ionicons name="information-circle-outline" size={14} color={colors.brand} />
              <Text className="font-inter-medium text-[11px] text-brand-dark">Up to {MAX_STORE_ORDERS} orders per request</Text>
            </View>
          </View>
          <View className="mt-5 flex-row items-center gap-2 rounded-xl bg-brand-lighter px-3 py-3">
            <Ionicons name="car-outline" size={18} color={colors.brand} />
            <Text className="flex-1 text-xs text-body">
              <Text className="font-inter-semibold text-xs text-brand">Note : </Text>
              Multiple orders are available for cars only
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
