import { View } from "react-native";
import { router } from "expo-router";
import { Button, Card, InfoBanner, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { OrderCostSummary, useDraftPricing } from "@/components/send";
import { useT } from "@/i18n";
import { coordsOf } from "@/lib/geo";
import { useAppSelector } from "@/store";

/** Confirm your route (2 of 7). Shopping flow adds the Order Cost Summary (7.png). */
export default function ConfirmRouteScreen() {
  const t = useT();
  const { flow, pickup, dropoff } = useAppSelector((s) => s.delivery);
  const { isShopping, delivery, distanceKm, etaMinutes, measured } = useDraftPricing();

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title={t("location.confirmRoute")} onPress={() => router.push("/send/package")} />}
    >
      <RouteMap
        mode="route"
        stepLabel={t("location.stepRoute2")}
        height={240}
        pickup={coordsOf(pickup)}
        dropoff={coordsOf(dropoff)}
      />
      <Sheet>
        <Text className="font-inter-bold text-xl">{t("location.confirmRouteTitle")}</Text>
        <Text className="mt-1 text-xs text-body">
          {t("location.checkBoth", { flow: t(`location.flow_${flow}`) })}
        </Text>

        <Card className="mt-4">
          <RouteStops
            stops={[
              { label: t("common.pickup"), address: pickup.address, onEdit: () => router.dismissTo("/send/pickup") },
              { label: t("common.dropoff"), address: dropoff.address, onEdit: () => router.dismissTo("/send/dropoff") },
            ]}
          />
        </Card>

        <Card tone="tint" className="mt-4">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="font-inter-bold text-lg">{t("common.km", { km: distanceKm })}</Text>
              <Text className="text-[11px] text-muted">{t("location.routeDistance")}</Text>
            </View>
            <View className="items-end">
              <Text className="font-inter-bold text-lg text-brand-dark">{t("common.aed", { amount: delivery })}</Text>
              <Text className="text-[11px] text-muted">{t("location.deliveryFee")}</Text>
            </View>
          </View>
          <Text className="mt-3 border-t border-brand-light pt-3 text-xs text-body">
            {t("location.etaAfterPickup", {
              range: t("common.minutesRange", { min: etaMinutes[0], max: etaMinutes[1] }),
            })}
          </Text>
          {!measured && <Text className="mt-1 text-[11px] text-muted">{t("location.estimateHint")}</Text>}
        </Card>

        {isShopping && <OrderCostSummary className="mt-4" />}

        <InfoBanner className="mt-4">{t("location.checkAddresses")}</InfoBanner>
      </Sheet>
    </Screen>
  );
}
