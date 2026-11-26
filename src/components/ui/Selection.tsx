import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

/** Round radio dot (empty grey ring / filled green). */
export function RadioDot({ selected }: { selected: boolean }) {
  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-brand" : "border-line"}`}
    >
      {selected && <View className="h-2.5 w-2.5 rounded-full bg-brand" />}
    </View>
  );
}

/** Square checkbox. */
export function Checkbox({
  checked,
  onChange,
  children,
  className = "",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      className={`flex-row items-start gap-3 ${className}`}
    >
      <View
        className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border-2 ${
          checked ? "border-brand bg-brand" : "border-line bg-white"
        }`}
      >
        {checked && <Ionicons name="checkmark" size={14} color={colors.white} />}
      </View>
      {children && <View className="flex-1">{children}</View>}
    </Pressable>
  );
}

/**
 * Selectable card with a radio in the top-right corner
 * (Delivery Type, Choose Service, Single/Multiple Orders).
 */
export function OptionCard({
  selected,
  onPress,
  title,
  description,
  media,
  className = "",
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  description?: string;
  /** Icon or image shown above the title. */
  media?: ReactNode;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-1 items-center rounded-2xl border bg-white px-3 pb-4 pt-5 ${
        selected ? "border-brand bg-brand-lighter" : "border-line"
      } ${className}`}
    >
      <View className="absolute right-3 top-3">
        <RadioDot selected={selected} />
      </View>
      {media && <View className="mb-2 h-14 items-center justify-center">{media}</View>}
      <Text className="text-center font-inter-semibold text-sm">{title}</Text>
      {description && <Text className="mt-1 text-center text-[11px] leading-4 text-body">{description}</Text>}
    </Pressable>
  );
}

/** Full-width row with label + radio on the right (cancel reasons, language). */
export function RadioRow({
  selected,
  onPress,
  title,
  subtitle,
  left,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
  left?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mb-3 flex-row items-center gap-3 rounded-2xl border px-4 py-4 ${
        selected ? "border-brand bg-brand-lighter" : "border-line bg-white"
      }`}
    >
      {left}
      <View className="flex-1">
        <Text className="font-inter-medium text-sm">{title}</Text>
        {subtitle && <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>}
      </View>
      <RadioDot selected={selected} />
    </Pressable>
  );
}

/**
 * Two-option pill switch: Customer/Store (with icons) and Active/Past.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  variant = "outline",
}: {
  options: { value: T; label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  value: T;
  onChange: (v: T) => void;
  /** "outline" = Customer/Store style, "solid" = black active pill (Active/Past). */
  variant?: "outline" | "solid";
}) {
  return (
    <View className="flex-row rounded-full border border-line bg-white p-1">
      {options.map((o) => {
        const active = o.value === value;
        const activeCls = variant === "solid" ? "bg-ink" : "border border-brand bg-brand-light";
        const color = active ? (variant === "solid" ? colors.white : colors.brandDark) : colors.body;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            className={`h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full ${active ? activeCls : ""}`}
          >
            {o.icon && <Ionicons name={o.icon} size={18} color={color} />}
            <Text className="font-inter-medium text-sm" style={{ color }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** "-  2  +" counter (store Order Count). */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const btn = "h-9 w-9 items-center justify-center rounded-lg border border-line bg-white";
  return (
    <View className="flex-row items-center gap-4">
      <Pressable accessibilityLabel="Decrease" disabled={value <= min} onPress={() => onChange(value - 1)} className={`${btn} ${value <= min ? "opacity-40" : ""}`}>
        <Ionicons name="remove" size={18} color={colors.ink} />
      </Pressable>
      <Text className="w-6 text-center font-inter-semibold text-base">{value}</Text>
      <Pressable accessibilityLabel="Increase" disabled={value >= max} onPress={() => onChange(value + 1)} className={`${btn} ${value >= max ? "opacity-40" : ""}`}>
        <Ionicons name="add" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}
