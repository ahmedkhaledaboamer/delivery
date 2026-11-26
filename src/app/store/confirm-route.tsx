import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { TipSelector } from "@/components/delivery";
import { useStorePickup } from "@/components/store/useStorePickup";
import { colors } from "@/constants/theme";
import { formatAED } from "@/lib/format";
import { deliveryFee, ETA_MINUTES, ROUTE_DISTANCE_KM } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTip } from "@/store/slices/deliverySlice";

export default function StoreConfirmRoute() {
  const dispatch = useAppDispatch();
  const { storeOrders, vehicle, speed, tip } = useAppSelector((s) => s.delivery);
  const pickup = useStorePickup();
  const fee = deliveryFee(vehicle ?? "car", speed);
  const ready = storeOrders.length > 0 && storeOrders.every((o) => o.dropoff.address.trim() && o.contents.trim());

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title="Confirm route" disabled={!ready} onPress={() => router.push("/store/order-confirmed")} />}
    >
      <RouteMap mode="route" stepLabel="2 of 7 · Route" />
      <Sheet>
        <Text className="font-inter-bold text-xl">Confirm your route</Text>
        <Text className="mt-1 text-xs text-body">Send a Package · Check both locations.</Text>

        {storeOrders.map((o, i) => (
          <View key={i} className="mt-5">
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="cube-outline" size={20} color={colors.brand} />
              <Text className="font-inter-semibold text-lg">Order #{i + 1}</Text>
            </View>
            <Card>
              <RouteStops
                stops={[
                  { label: "Pickup", address: pickup.address },
                  {
                    label: "Drop-off",
                    address: o.dropoff.address,
                    onEdit: () => router.push(`/store/order-details?index=${i}`),
                  },
                ]}
              />
            </Card>
            <Card tone="tint" className="mt-3">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="font-inter-bold text-lg">{ROUTE_DISTANCE_KM} km</Text>
                  <Text className="text-[11px] text-muted">Route distance</Text>
                </View>
                <View className="items-end">
                  <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(fee)}</Text>
                  <Text className="text-[11px] text-muted">Delivery fee</Text>
                </View>
              </View>
              <Text className="mt-3 text-[11px] text-body">
                Estimated delivery: {ETA_MINUTES[0]}–{ETA_MINUTES[1]} min after pickup.
              </Text>
            </Card>
          </View>
        ))}

        <View className="mt-5">
          <TipSelector value={tip} onChange={(v) => dispatch(setTip(v))} />
        </View>
      </Sheet>
    </Screen>
  );
}
