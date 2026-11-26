import { useState } from "react";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Header, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useAppDispatch } from "@/store";
import { startFlow } from "@/store/slices/deliverySlice";

type Choice = "send" | "receive" | "shopping";

const SERVICES: { value: Choice; title: string; description: string; image: ImageSourcePropType }[] = [
  { value: "send", title: "Send a Package", description: "Deliver anything to any location.", image: images.box },
  { value: "receive", title: "Receive a Package", description: "Receive anything to any location.", image: images.handsBox },
  {
    value: "shopping",
    title: "Personal Shopping",
    description: "Shop for items you need and we'll deliver them to you",
    image: images.shoppingBag,
  },
];

/** Frame 94 — Send / Receive / Personal Shopping picker. */
export default function ServiceScreen() {
  const dispatch = useAppDispatch();
  const [choice, setChoice] = useState<Choice | null>(null);

  return (
    <Screen
      footer={
        <Button
          title="Continue"
          disabled={!choice}
          onPress={() => {
            if (!choice) return;
            dispatch(startFlow(choice));
            router.push("/send/delivery-type");
          }}
        />
      }
    >
      <Header actions />
      <View className="mt-6 gap-4 px-5">
        {SERVICES.map((s) => {
          const selected = choice === s.value;
          return (
            <Pressable
              key={s.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setChoice(s.value)}
              className={`flex-row items-center gap-4 rounded-2xl border px-4 py-5 ${
                selected ? "border-brand bg-brand-lighter" : "border-line bg-white"
              }`}
            >
              <Image source={s.image} resizeMode="contain" style={{ width: 84, height: 64 }} />
              <View className="flex-1">
                <Text className="font-inter-semibold text-base">{s.title}</Text>
                <Text className="mt-1 text-xs leading-4 text-body">{s.description}</Text>
              </View>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${selected ? "bg-brand" : "bg-brand-light"}`}
              >
                <Ionicons name="arrow-forward" size={16} color={selected ? colors.white : colors.brandDark} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
