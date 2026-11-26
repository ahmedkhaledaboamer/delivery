import { View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { TipSelector } from "@/components/delivery";
import { useStorePickup, useStoreQuotes } from "@/components/store/useStorePickup";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";
import { coordsOf, LatLng } from "@/lib/geo";
import { useAppDispatch, useAppSelector } from "@/store";
import { setTip } from "@/store/slices/deliverySlice";

export default function StoreConfirmRoute() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { storeOrders, tip } = useAppSelector((s) => s.delivery);
  const pickup = useStorePickup();
  const { quotes } = useStoreQuotes();
  const ready = storeOrders.length > 0 && storeOrders.every((o) => o.dropoff.address.trim() && o.contents.trim());
  const stops = storeOrders.map((o) => coordsOf(o.dropoff)).filter((p): p is LatLng => !!p);

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title={t("location.confirmRoute")} disabled={!ready} onPress={() => router.push("/store/order-confirmed")} />}
    >
      <RouteMap mode="route" stepLabel={t("location.stepRoute2")} pickup={coordsOf(pickup)} stops={stops} />
      <Sheet>
        <Text className="font-inter-bold text-xl">{t("location.confirmRouteTitle")}</Text>
        <Text className="mt-1 text-xs text-body">{t("location.checkAll", { flow: t("location.flow_store") })}</Text>

        {storeOrders.map((o, i) => {
          const q = quotes[i];
          return (
            <View key={i} className="mt-5">
              <View className="mb-3 flex-row items-center gap-2">
                <Ionicons name="cube-outline" size={20} color={colors.brand} />
                <Text className="font-inter-semibold text-lg">{t("location.orderNumber", { n: i + 1 })}</Text>
              </View>
              <Card>
                <RouteStops
                  stops={[
                    { label: t("common.pickup"), address: pickup.address },
                    {
                      label: t("common.dropoff"),
                      address: o.dropoff.address,
                      onEdit: () => router.push(`/store/order-details?index=${i}`),
                    },
                  ]}
                />
              </Card>
              {q && (
                <Card tone="tint" className="mt-3">
                  <View className="flex-row items-start justify-between">
                    <View>
                      <Text className="font-inter-bold text-lg">{t("common.km", { km: q.distanceKm })}</Text>
                      <Text className="text-[11px] text-muted">{t("location.routeDistance")}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="font-inter-bold text-lg text-brand-dark">{t("common.aed", { amount: q.fee })}</Text>
                      <Text className="text-[11px] text-muted">{t("location.deliveryFee")}</Text>
                    </View>
                  </View>
                  <Text className="mt-3 text-[11px] text-body">
                    {t("location.etaAfterPickup", {
                      range: t("common.minutesRange", { min: q.etaMinutes[0], max: q.etaMinutes[1] }),
                    })}
                  </Text>
                  {!q.measured && <Text className="mt-1 text-[11px] text-muted">{t("location.estimateHint")}</Text>}
                </Card>
              )}
            </View>
          );
        })}

        <View className="mt-5">
          <TipSelector value={tip} onChange={(v) => dispatch(setTip(v))} />
        </View>
      </Sheet>
    </Screen>
  );
}
