import { Image, View } from "react-native";
import { router } from "expo-router";
import { Button, GradientText, Logo, Screen, Text } from "@/components/ui";
import { useAppDispatch } from "@/store";
import { completeOnboarding } from "@/store/slices/authSlice";
import { images } from "@/constants/images";

export default function Welcome() {
  const dispatch = useAppDispatch();

  return (
    <Screen
      footer={
        <View className="gap-3">
          <Button title="Continue" onPress={() => router.push("/onboarding/pickup-dropoff")} />
          <Button
            title="Sign In"
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
          <Text className="font-inter-bold text-[26px]">Welcome to </Text>
          <GradientText className="font-inter-bold text-[26px]">APEX AORA</GradientText>
        </View>
        <Text className="mt-3 text-center text-sm leading-6 text-body">
          Your smart delivery partner. Send and receive your packages quickly and safely.
        </Text>
      </View>

      <View className="mt-6 flex-1 items-center justify-center px-3">
        <Image
          source={images.welcomeHero}
          resizeMode="contain"
          style={{ width: "100%", aspectRatio: 1369 / 1149 }}
          accessibilityLabel="APEX AORA car and rider on the road through the city"
        />
      </View>
    </Screen>
  );
}
