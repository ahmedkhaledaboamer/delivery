import { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, IconButton, Screen, Text } from "@/components/ui";
import { OffersRewards, TermsAgreement, useDraftDiscount } from "@/components/delivery";
import { useStorePickup } from "@/components/store/useStorePickup";
import { useCreateOrder } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { deliveryFee } from "@/lib/pricing";
import { useAppDispatch, useAppSelector } from "@/store";
import { resetDelivery } from "@/store/slices/deliverySlice";

export default function StoreOrderConfirmed() {
  const dispatch = useAppDispatch();
  const { storeOrders, vehicle, speed, tip, agreedToTerms } = useAppSelector((s) => s.delivery);
  const discount = useDraftDiscount();
  const pickup = useStorePickup();
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
        pickup: { address: pickup.address, contactName: pickup.contactName, contactPhone: pickup.contactPhone },
        dropoffs: storeOrders.map((o) => ({
          address: o.dropoff.address,
          contactName: o.dropoff.contact.fullName,
          contactPhone: o.dropoff.contact.phone,
          notes: o.dropoff.notes || undefined,
        })),
        contents: storeOrders.map((o) => o.contents.trim()).filter(Boolean).join(", "),
        tip,
        discount,
        fee: deliveryFee(v, speed) * n,
      },
      {
        onSuccess: (order) => {
          dispatch(resetDelivery());
          router.replace(`/payment-success?orderId=${order.id}`);
        },
        onError: (e) => Alert.alert("Could not place your order", e instanceof Error ? e.message : "Please try again."),
      },
    );
  };

  return (
    <Screen
      edges={["bottom"]}
      footer={
        <Button title="Go to pay" disabled={!agreedToTerms || n === 0} loading={createOrder.isPending} onPress={pay} />
      }
    >
      <LinearGradient colors={[colors.brandLight, colors.surface]} style={{ paddingBottom: 24 }}>
        <View className="flex-row items-center gap-2 px-4" style={{ paddingTop: insets.top + 8 }}>
          <IconButton name="arrow-back" accessibilityLabel="Back" onPress={() => router.back()} />
          <View className="rounded-full bg-white px-3 py-2">
            <Text className="font-inter-medium text-xs">2 of 7 · Route</Text>
          </View>
        </View>
        <View className="mt-2 items-center">
          <Image source={images.storeConfirmed} resizeMode="contain" style={{ width: 190, height: 190 }} />
          <Text className="mt-4 font-inter-bold text-3xl">
            Order <Text className="font-inter-bold text-3xl text-brand">Confirmed</Text>
          </Text>
          <Text className="mt-2 px-10 text-center text-sm text-body">
            Your delivery request has been successfully submitted. Sit back and let RUSH handle the deliveries.
          </Text>
        </View>
      </LinearGradient>

      <View className="gap-4 px-5">
        <Card tone="tint">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
              <Ionicons name="cube-outline" size={22} color={colors.brand} />
            </View>
            <View>
              <Text className="font-inter-bold text-lg">
                {n} {n === 1 ? "Order" : "Orders"}
              </Text>
              <Text className="text-xs text-body">Will be picked up from your store</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="flex-row gap-3 border-b border-line pb-3">
            <View className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-accent" />
            <View className="flex-1">
              <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">Pickup</Text>
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
              <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">Drop-off</Text>
              <Text className="mt-0.5 font-inter-medium text-sm">
                {n} {n === 1 ? "Location" : "Locations"}
              </Text>
            </View>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.body} />
          </Pressable>
          {expanded && (
            <View className="mt-3 gap-2 pl-5">
              {storeOrders.map((o, i) => (
                <View key={i} className="flex-row gap-2">
                  <Text className="font-inter-semibold text-xs text-brand">#{i + 1}</Text>
                  <View className="flex-1">
                    <Text className="text-sm">{o.dropoff.address || "—"}</Text>
                    {!!o.dropoff.contact.fullName && (
                      <Text className="text-[11px] text-muted">{o.dropoff.contact.fullName}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <OffersRewards />

        <Card>
          <TermsAgreement />
        </Card>
      </View>
    </Screen>
  );
}
