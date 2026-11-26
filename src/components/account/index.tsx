import { ReactNode } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Text } from "@/components/ui";
import { colors } from "@/constants/theme";

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Tinted top band used by My profile / Edit profile / Settings:
 * runs under the status bar, back button + support/bell on the right, then title + subtitle.
 * Use with <Screen edges={["bottom"]} background="white">.
 */
export function AccountHeader({
  title,
  subtitle,
  eyebrow,
  onBack,
}: {
  title: string;
  subtitle?: string;
  /** Small brand-coloured line above the title (e.g. order code). */
  eyebrow?: string;
  onBack?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-brand-lighter pb-7" style={{ paddingTop: insets.top + 8 }}>
      <Header actions onBack={onBack} />
      <View className="mt-4 px-5">
        {eyebrow && <Text className="mb-1 font-inter-semibold text-xs text-brand">{eyebrow}</Text>}
        <Text className="font-inter-semibold text-[22px] text-ink">{title}</Text>
        {subtitle && <Text className="mt-1.5 text-xs text-body">{subtitle}</Text>}
      </View>
    </View>
  );
}

/** Trailing icon for account rows — thin grey outline like the design. */
export const RowIcon = ({ name, color = colors.body }: { name: IconName; color?: string }) => (
  <Ionicons name={name} size={18} color={color} />
);

/** Ionicon inside a rounded light-violet tile (stand-in for the Figma icon art). */
export function IconTile({
  name,
  size = 40,
  iconSize = 20,
  color = colors.brand,
  rounded = "rounded-xl",
  className = "bg-brand-light",
}: {
  name: IconName;
  size?: number;
  iconSize?: number;
  color?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    <View style={{ width: size, height: size }} className={`items-center justify-center ${rounded} ${className}`}>
      <Ionicons name={name} size={iconSize} color={color} />
    </View>
  );
}

/** Initials circle used instead of a profile photo. */
export function Avatar({ name, uri, size = 56 }: { name: string; uri?: string; size?: number }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center rounded-full bg-brand-light">
      <Text className="font-inter-bold text-lg text-brand-dark">{initials || "?"}</Text>
    </View>
  );
}

/** Loading / error placeholder for query-driven blocks. */
export function QueryState({ isLoading, error, children }: { isLoading: boolean; error: unknown; children: ReactNode }) {
  if (isLoading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (error) {
    return (
      <View className="items-center py-10">
        <Text className="text-sm text-danger">Something went wrong. Please try again.</Text>
      </View>
    );
  }
  return <>{children}</>;
}

/** Title + optional right link ("History Orders", "My Tickets  View All"). */
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="font-inter-bold text-base">{title}</Text>
      {right}
    </View>
  );
}
