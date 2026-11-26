import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { DirIcon } from "./DirIcon";
import { colors } from "@/constants/theme";

/**
 * Settings / profile style row: optional leading icon, title + subtitle,
 * trailing icon (chevron by default) or custom node.
 */
export function ListRow({
  title,
  subtitle,
  icon,
  trailingIcon = "chevron-forward",
  trailing,
  onPress,
  destructive,
  divider = true,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap | null;
  trailing?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  divider?: boolean;
}) {
  const color = destructive ? colors.danger : colors.body;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={`flex-row items-center gap-3 py-4 active:opacity-70 ${divider ? "border-b border-line" : ""}`}
    >
      {icon && (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-lighter">
          <Ionicons name={icon} size={18} color={destructive ? colors.danger : colors.brand} />
        </View>
      )}
      <View className="flex-1">
        <Text className={`font-inter-medium text-sm ${destructive ? "text-danger" : "text-ink"}`}>{title}</Text>
        {subtitle && <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>}
      </View>
      {trailing ?? (trailingIcon ? <DirIcon name={trailingIcon} size={18} color={color} /> : null)}
    </Pressable>
  );
}

/** Small uppercase grey section label ("PRIVACY & SECURITY", "TODAY · 3 NOVEMBER"). */
export function SectionLabel({ children, className = "" }: { children: string; className?: string }) {
  return <Text className={`mb-2 font-inter-semibold text-[11px] uppercase tracking-wide text-muted ${className}`}>{children}</Text>;
}
