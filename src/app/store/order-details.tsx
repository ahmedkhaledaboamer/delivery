import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, PhoneField, RouteMap, Screen, Sheet, Text, TextField, isValidPhone } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateStoreOrder } from "@/store/slices/deliverySlice";

export default function StoreOrderDetails() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ index?: string }>();
  const index = Math.max(0, Number(params.index ?? 0) || 0);
  const orders = useAppSelector((s) => s.delivery.storeOrders);
  const order = orders[index];

  if (!order) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-sm text-body">This order no longer exists in your request.</Text>
          <Button className="mt-4 w-full" title="Start a new request" onPress={() => router.replace("/store/create-request")} />
        </View>
      </Screen>
    );
  }

  const { dropoff, contents } = order;
  const valid =
    dropoff.address.trim().length > 2 &&
    contents.trim().length > 0 &&
    dropoff.contact.fullName.trim().length > 1 &&
    isValidPhone(dropoff.contact.phone);

  const update = (patch: Parameters<typeof updateStoreOrder>[0]) => dispatch(updateStoreOrder(patch));

  const next = () => {
    if (index + 1 < orders.length) router.push(`/store/order-details?index=${index + 1}`);
    else router.push("/store/confirm-route");
  };

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title="Continue" disabled={!valid} onPress={next} />}>
      <RouteMap mode="dropoff" stepLabel="1 of 7 · Route" />
      <Sheet>
        <View className="mb-5 flex-row items-center gap-2">
          <Ionicons name="cube-outline" size={24} color={colors.brand} />
          <Text className="font-inter-bold text-xl">Order #{index + 1}</Text>
        </View>

        <TextField
          label="Drop-off Location"
          placeholder="Enter Drop-off Location"
          value={dropoff.address}
          onChangeText={(address) => update({ index, dropoff: { address } })}
          left={<Ionicons name="location-outline" size={18} color={colors.brand} style={{ marginRight: 8 }} />}
        />

        <TextField
          label="What's inside?"
          hint="required"
          placeholder="Type...."
          multiline
          maxLength={200}
          value={contents}
          onChangeText={(c) => update({ index, contents: c })}
        />

        <View className="mb-3 mt-2 flex-row items-center gap-2">
          <Ionicons name="download-outline" size={18} color={colors.brand} />
          <Text className="font-inter-semibold text-base">Receiver</Text>
        </View>
        <TextField
          label="Full name"
          hint="required"
          placeholder="Full name"
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
