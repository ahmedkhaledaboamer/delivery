import { View } from "react-native";
import { router } from "expo-router";
import { Button, Screen, Text } from "@/components/ui";
import { OnboardingHeader, PageDashes, PickupDropoffVisual } from "@/components/onboarding";
import { useAppDispatch } from "@/store";
import { completeOnboarding } from "@/store/slices/authSlice";

export default function PickupDropoff() {
  const dispatch = useAppDispatch();
  const skip = () => {
    dispatch(completeOnboarding());
    router.replace("/auth/sign-in");
  };

  return (
    <Screen footer={<Button title="Continue" onPress={() => router.push("/onboarding/live-tracking")} />}>
      <OnboardingHeader onSkip={skip} />
      <View className="px-5 pt-2">
        <Text className="mb-6 font-inter-semibold text-[11px] uppercase tracking-wide text-brand">
          Less to do. More day for you.
        </Text>
        <PickupDropoffVisual />
        <Text className="mt-6 text-sm leading-6 text-body">
          Set your pickup and dropoff. Add your parcel. A APEX AORA rider handles the distance.
        </Text>
        <View className="mt-6">
          <PageDashes active={0} />
        </View>
      </View>
    </Screen>
  );
}
