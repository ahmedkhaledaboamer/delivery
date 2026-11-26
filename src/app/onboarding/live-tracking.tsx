import { View } from "react-native";
import { router } from "expo-router";
import { Button, Screen, Text } from "@/components/ui";
import { LiveTrackingVisual, OnboardingHeader, PageDashes } from "@/components/onboarding";
import { useAppDispatch } from "@/store";
import { completeOnboarding } from "@/store/slices/authSlice";

export default function LiveTracking() {
  const dispatch = useAppDispatch();
  const finish = (to: "/auth/sign-in" | "/auth/sign-up") => {
    dispatch(completeOnboarding());
    router.replace(to);
  };

  return (
    <Screen footer={<Button title="Start sending" onPress={() => finish("/auth/sign-up")} />}>
      <OnboardingHeader onSkip={() => finish("/auth/sign-in")} />
      <View className="px-5 pt-2">
        <Text className="mb-6 font-inter-semibold text-[11px] uppercase tracking-wide text-brand">
          A little closer. Every moment.
        </Text>
        <LiveTrackingVisual />
        <Text className="mt-6 text-sm leading-6 text-body">
          Follow your rider live, see the arrival time, and know when your parcel is delivered.
        </Text>
        <View className="mt-6">
          <PageDashes active={1} />
        </View>
      </View>
    </Screen>
  );
}
