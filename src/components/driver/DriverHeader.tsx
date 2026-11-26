import { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, Logo, Text } from "@/components/ui";
import { useT } from "@/i18n";

/**
 * Driver version of AccountHeader: the same tinted band that runs under the status bar,
 * logo mark (tab roots) or back button, support button on the right, then title + subtitle
 * and optional extra content (e.g. the Online switch).
 */
export function DriverHeader({
  title,
  subtitle,
  eyebrow,
  showBack,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const t = useT();
  return (
    <View className="bg-brand-lighter pb-7" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between px-5 py-3">
        {showBack ? (
          <IconButton
            name="arrow-back"
            accessibilityLabel={t("common.back")}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/driver"))}
          />
        ) : (
          <Logo size="sm" markOnly />
        )}
        <IconButton
          name="headset-outline"
          accessibilityLabel={t("common.helpSupport")}
          onPress={() => router.push("/account/support")}
        />
      </View>
      <View className="mt-4 px-5">
        {eyebrow && <Text className="mb-1 font-inter-semibold text-xs text-brand">{eyebrow}</Text>}
        <Text className="font-inter-semibold text-[22px] text-ink">{title}</Text>
        {subtitle && <Text className="mt-1.5 text-xs text-body">{subtitle}</Text>}
      </View>
      {children && <View className="mt-4 px-5">{children}</View>}
    </View>
  );
}
