import { ActivityIndicator, Pressable, PressableProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

type Variant = "primary" | "outline" | "outlineDark" | "ghost" | "danger" | "dark";

type Props = Omit<PressableProps, "children"> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: "md" | "sm";
  className?: string;
};

const container: Record<Variant, string> = {
  primary: "bg-brand",
  outline: "bg-white border border-brand",
  outlineDark: "bg-white border border-ink",
  ghost: "bg-transparent",
  danger: "bg-danger-light",
  dark: "bg-ink",
};

const label: Record<Variant, string> = {
  primary: "text-white",
  outline: "text-brand-dark",
  outlineDark: "text-ink",
  ghost: "text-brand",
  danger: "text-danger",
  dark: "text-white",
};

const iconColor: Record<Variant, string> = {
  primary: colors.white,
  outline: colors.brandDark,
  outlineDark: colors.ink,
  ghost: colors.brand,
  danger: colors.danger,
  dark: colors.white,
};

/** Pill button used everywhere (Continue, Sign In, Track order, Cancel order, ...). */
export function Button({ title, variant = "primary", loading, disabled, icon, size = "md", className = "", ...props }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`${size === "md" ? "h-14" : "h-10 px-4"} flex-row items-center justify-center rounded-full ${container[variant]} ${
        isDisabled ? "opacity-50" : "active:opacity-80"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <Ionicons name={icon} size={size === "md" ? 18 : 16} color={iconColor[variant]} />}
          <Text className={`font-inter-semibold ${size === "md" ? "text-base" : "text-sm"} ${label[variant]}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
