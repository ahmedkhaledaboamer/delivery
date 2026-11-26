import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { IconButton, Logo, Text } from "@/components/ui";
import { useT } from "@/i18n";

/** Onboarding top bar: back arrow, centred logo, "Skip". */
export function OnboardingHeader({ onSkip }: { onSkip: () => void }) {
  const t = useT();
  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <IconButton
        name="arrow-back"
        accessibilityLabel={t("common.back")}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/welcome"))}
      />
      <Logo size="sm" />
      <Pressable accessibilityRole="button" hitSlop={10} onPress={onSkip} className="h-10 w-10 items-end justify-center">
        <Text className="font-inter-semibold text-xs text-brand-dark">{t("onboarding.skip")}</Text>
      </Pressable>
    </View>
  );
}

/** Two-dash page indicator. */
export function PageDashes({ count = 2, active }: { count?: number; active: number }) {
  return (
    <View className="flex-row justify-center gap-2" accessibilityLabel={`Page ${active + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className={`h-1 w-7 rounded-full ${i === active ? "bg-brand-dark" : "bg-line"}`} />
      ))}
    </View>
  );
}
