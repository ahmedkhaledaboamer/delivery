import { Pressable, PressableProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DirIcon } from "./DirIcon";
import { colors } from "@/constants/theme";

type Props = PressableProps & {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  badge?: boolean; // small violet dot (notifications)
  className?: string;
};

/** Round white button with a thin border — back arrow, support, bell. */
export function IconButton({ name, size = 18, color = colors.ink, badge, className = "", ...props }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      className={`h-10 w-10 items-center justify-center rounded-full border border-line bg-white active:opacity-70 ${className}`}
      {...props}
    >
      <DirIcon name={name} size={size} color={color} />
      {badge && <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-accent" />}
    </Pressable>
  );
}
