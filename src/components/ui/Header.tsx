import { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { IconButton } from "./IconButton";
import { Logo } from "./Logo";
import { Text } from "./Text";

type Props = {
  /** Hide the back arrow (e.g. tab roots). */
  hideBack?: boolean;
  onBack?: () => void;
  /** Title next to the back arrow (e.g. "About APEX AORA", "Help & Support"). */
  inlineTitle?: string;
  /** Show the support + notifications buttons on the right (most inner screens). */
  actions?: boolean;
  /** Show the small scooter logo mark on the right (auth screens). */
  logo?: boolean;
  right?: ReactNode;
  className?: string;
};

/** Top bar: back arrow on the left, support/bell or logo on the right. */
export function Header({ hideBack, onBack, inlineTitle, actions, logo, right, className = "" }: Props) {
  return (
    <View className={`flex-row items-center justify-between px-5 py-3 ${className}`}>
      <View className="flex-1 flex-row items-center gap-3">
        {!hideBack && (
          <IconButton
            name="arrow-back"
            accessibilityLabel="Back"
            onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))}
          />
        )}
        {inlineTitle && <Text className="font-inter-semibold text-base">{inlineTitle}</Text>}
      </View>
      <View className="flex-row items-center gap-2">
        {right}
        {actions && (
          <>
            <IconButton name="headset-outline" accessibilityLabel="Help and support" onPress={() => router.push("/account/support")} />
            <IconButton name="notifications-outline" accessibilityLabel="Notifications" badge onPress={() => router.push("/notifications")} />
          </>
        )}
        {logo && <Logo size="sm" markOnly />}
      </View>
    </View>
  );
}

/** Big heading block under the header: optional violet eyebrow, title, subtitle. */
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <View className={`px-5 ${className}`}>
      {eyebrow && <Text className="mb-1 font-inter-semibold text-[11px] uppercase tracking-wide text-brand">{eyebrow}</Text>}
      {typeof title === "string" ? <Text className="font-inter-bold text-2xl">{title}</Text> : title}
      {subtitle && <Text className="mt-1 text-sm text-body">{subtitle}</Text>}
    </View>
  );
}
