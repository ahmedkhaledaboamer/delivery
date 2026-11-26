import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, InfoBanner, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { FLOW_TITLE, OrderCostSummary, useDraftPricing } from "@/components/send";
import { formatAED } from "@/lib/format";
import { ETA_MINUTES, ROUTE_DISTANCE_KM } from "@/lib/pricing";
import { useAppSelector } from "@/store";

/** Confirm your route (2 of 7). Shopping flow adds the Order Cost Summary (7.png). */
export default function ConfirmRouteScreen() {
  const { flow, pickup, dropoff } = useAppSelector((s) => s.delivery);
  const { isShopping, delivery } = useDraftPricing();

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title="Confirm route" onPress={() => router.push("/send/package")} />}>
      <RouteMap mode="route" stepLabel="2 of 7 · Route" height={240} />
      <Sheet>
        <Text className="font-inter-bold text-xl">Confirm your route</Text>
        <Text className="mt-1 text-xs text-body">{FLOW_TITLE[flow]} · Check both locations.</Text>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: "Pickup", address: pickup.address, onEdit: () => router.dismissTo("/send/pickup") },
              { label: "Drop-off", address: dropoff.address, onEdit: () => router.dismissTo("/send/dropoff") },
            ]}
          />
        </Card>

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="font-inter-bold text-lg">{ROUTE_DISTANCE_KM} km</Text>
              <Text className="text-[11px] text-muted">Route distance</Text>
            </View>
            <View className="items-end">
              <Text className="font-inter-bold text-lg text-brand-dark">{formatAED(delivery)}</Text>
              <Text className="text-[11px] text-muted">Delivery fee</Text>
            </View>
          </View>
          <Text className="mt-3 border-t border-brand-light pt-3 text-xs text-body">
            Estimated delivery: {ETA_MINUTES[0]}–{ETA_MINUTES[1]} min after pickup.
          </Text>
        </Card>

        {isShopping && <OrderCostSummary className="mt-4" />}

        <InfoBanner className="mt-4">
          Check the addresses before confirming. You can still edit them in your order summary.
        </InfoBanner>
      </Sheet>
    </Screen>
  );
}
