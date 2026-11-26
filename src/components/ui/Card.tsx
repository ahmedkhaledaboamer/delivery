import { ReactNode } from "react";
import { Pressable, View, ViewProps } from "react-native";

type Props = ViewProps & {
  children: ReactNode;
  /** "white" (default) or "tint" (light green band like the fee / info blocks). */
  tone?: "white" | "tint";
  onPress?: () => void;
  className?: string;
};

/** Rounded card with a thin border. Pass onPress to make it tappable. */
export function Card({ children, tone = "white", onPress, className = "", ...props }: Props) {
  const base = `rounded-2xl border p-4 ${tone === "tint" ? "border-brand-light bg-brand-lighter" : "border-line bg-white"} ${className}`;
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className={`${base} active:opacity-80`} {...props}>
        {children}
      </Pressable>
    );
  }
  return (
    <View className={base} {...props}>
      {children}
    </View>
  );
}
