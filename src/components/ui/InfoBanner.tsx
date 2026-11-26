import { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

/** Light violet note with an info icon ("Never share your verification code...", "Simple booking. Live updates..."). */
export function InfoBanner({
  children,
  icon = "information-circle-outline",
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "brand" | "danger";
  className?: string;
}) {
  const danger = tone === "danger";
  return (
    <View
      className={`flex-row items-start gap-2 rounded-xl px-3 py-3 ${danger ? "bg-danger-light" : "bg-brand-lighter"} ${className}`}
    >
      <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.brand} style={{ marginTop: 1 }} />
      <View className="flex-1">
        {typeof children === "string" ? <Text className="text-xs leading-5 text-body">{children}</Text> : children}
      </View>
    </View>
  );
}
