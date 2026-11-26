import { useState } from "react";
import { Image, ImageSourcePropType, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Button, DirIcon, Header, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";
import { useAppDispatch } from "@/store";
import { startFlow } from "@/store/slices/deliverySlice";

type Choice = "send" | "receive" | "shopping";

/** titleKey / descriptionKey are translation keys (rendered with t()). */
const SERVICES: { value: Choice; titleKey: string; descriptionKey: string; image: ImageSourcePropType }[] = [
  { value: "send", titleKey: "send.serviceSendTitle", descriptionKey: "send.serviceSendDesc", image: images.box },
  { value: "receive", titleKey: "send.serviceReceiveTitle", descriptionKey: "send.serviceReceiveDesc", image: images.handsBox },
  {
    value: "shopping",
    titleKey: "send.serviceShoppingTitle",
    descriptionKey: "send.serviceShoppingDesc",
    image: images.shoppingBag,
  },
];

/** Frame 94 — Send / Receive / Personal Shopping picker. */
export default function ServiceScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const [choice, setChoice] = useState<Choice | null>(null);

  return (
    <Screen
      footer={
        <Button
          title={t("common.continue")}
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
          const title = t(s.titleKey);
          return (
            <Pressable
              key={s.value}
              accessibilityRole="radio"
              accessibilityLabel={title}
              accessibilityState={{ selected }}
              onPress={() => setChoice(s.value)}
              className={`flex-row items-center gap-4 rounded-2xl border px-4 py-5 ${
                selected ? "border-brand bg-brand-lighter" : "border-line bg-white"
              }`}
            >
              <Image source={s.image} resizeMode="contain" style={{ width: 84, height: 64 }} />
              <View className="flex-1">
                <Text className="font-inter-semibold text-base">{title}</Text>
                <Text className="mt-1 text-xs leading-4 text-body">{t(s.descriptionKey)}</Text>
              </View>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${selected ? "bg-brand" : "bg-brand-light"}`}
              >
                <DirIcon name="arrow-forward" size={16} color={selected ? colors.white : colors.brandDark} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
