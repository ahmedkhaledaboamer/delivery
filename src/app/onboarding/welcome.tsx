import { Image, View } from "react-native";
import { router } from "expo-router";
import { Button, GradientText, Logo, Screen, Text } from "@/components/ui";
import { useAppDispatch } from "@/store";
import { completeOnboarding } from "@/store/slices/authSlice";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

export default function Welcome() {
  const t = useT();
  const dispatch = useAppDispatch();

  return (
    <Screen
      footer={
        <View className="gap-3">
          <Button title={t("common.continue")} onPress={() => router.push("/onboarding/pickup-dropoff")} />
          <Button
            title={t("onboarding.signIn")}
            variant="outline"
            onPress={() => {
              dispatch(completeOnboarding());
              router.replace("/auth/sign-in");
            }}
          />
        </View>
      }
    >
      <View className="items-center px-6 pt-8">
        <Logo size="md" />
        <View className="mt-8 flex-row flex-wrap items-center justify-center">
          <Text className="font-inter-bold text-[26px]">{t("onboarding.welcomeTo")}</Text>
          <GradientText className="font-inter-bold text-[26px]">APEX AORA</GradientText>
        </View>
        <Text className="mt-3 text-center text-sm leading-6 text-body">
          {t("onboarding.welcomeBody")}
        </Text>
      </View>

      <View className="mt-6 flex-1 items-center justify-center px-3">
        <Image
          source={images.welcomeHero}
          resizeMode="contain"
          style={{ width: "100%", aspectRatio: 1369 / 1149 }}
          accessibilityLabel={t("onboarding.heroA11y")}
        />
      </View>
    </Screen>
  );
}
