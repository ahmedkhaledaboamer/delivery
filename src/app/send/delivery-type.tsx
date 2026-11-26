import { Image, ImageSourcePropType, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Header, OptionCard, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSpeed, setVehicle } from "@/store/slices/deliverySlice";

function Photo({ source }: { source: ImageSourcePropType }) {
  return <Image source={source} resizeMode="contain" style={{ width: 96, height: 56 }} />;
}

function Media({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-light">
      <Ionicons name={icon} size={24} color={colors.brand} />
    </View>
  );
}

/** Frame 95 — Delivery Type + Choose Service. */
export default function DeliveryTypeScreen() {
  const dispatch = useAppDispatch();
  const { speed, vehicle, flow } = useAppSelector((s) => s.delivery);

  return (
    <Screen
      footer={
        <Button
          title="Continue"
          disabled={!speed || !vehicle}
          onPress={() => router.push(flow === "shopping" ? "/send/shopping" : "/send/pickup")}
        />
      }
    >
      <Header actions />
      <View className="mt-4 px-5">
        <Text className="font-inter-semibold text-base">Delivery Type</Text>
        <Text className="mt-0.5 text-xs text-body">When do you need it delivered?</Text>
        <View className="mt-3 flex-row gap-3">
          <OptionCard
            selected={speed === "minutes"}
            onPress={() => dispatch(setSpeed("minutes"))}
            title="Express In Minutes"
            description="Priority pickup and delivery in the shortest possible time."
            media={<Media icon="flash-outline" />}
          />
          <OptionCard
            selected={speed === "standard"}
            onPress={() => dispatch(setSpeed("standard"))}
            title="Standard"
            description="Affordable delivery within the regular delivery time."
            media={<Media icon="calendar-outline" />}
          />
        </View>

        <Text className="mt-8 font-inter-semibold text-base">Choose Service</Text>
        <Text className="mt-0.5 text-xs text-body">What would you like to do?</Text>
        <View className="mt-3 flex-row gap-3">
          <OptionCard
            selected={vehicle === "motorcycle"}
            onPress={() => dispatch(setVehicle("motorcycle"))}
            title="Motorcycle"
            description="Best for small packages. Faster in busy areas."
            media={<Photo source={images.scooter} />}
          />
          <OptionCard
            selected={vehicle === "car"}
            onPress={() => dispatch(setVehicle("car"))}
            title="Car"
            description="Ideal for larger packages. Extra space and protection."
            media={<Photo source={images.car} />}
          />
        </View>
      </View>
    </Screen>
  );
}
