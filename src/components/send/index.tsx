import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Header, Text } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { brandGradient, brandGradientEnd, brandGradientStart, colors } from "@/constants/theme";
import { formatAED } from "@/lib/format";
import { deliveryFee, PERSONAL_SHOPPING_FEE } from "@/lib/pricing";
import { useAppSelector } from "@/store";
import type { DeliveryPreference, FlowType } from "@/store/slices/deliverySlice";

export { StopForm } from "./StopForm";

export const PREFERENCES: { value: DeliveryPreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "call", label: "Call on arrival", icon: "call-outline" },
  { value: "no-knock", label: "Don't knock on the door", icon: "hand-left-outline" },
  { value: "leave-at-reception", label: "Leave it at the reception", icon: "business-outline" },
  { value: "ring-bell", label: "Ring the bell", icon: "notifications-outline" },
];

/** Small grey pill with the step ("4 of 7 · Package"). */
/**
 * Step screens (Package, Review): tinted band under the status bar with back + support/bell,
 * small step label, big title and subtitle. Follow it with <FlowSheet> for the white panel.
 * Use with <Screen edges={["bottom"]} background="white">.
 */
export function FlowHeader({ step, title, subtitle }: { step: string; title: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.brandLight, colors.brandLighter]} style={{ paddingTop: insets.top + 8, paddingBottom: 36 }}>
      <Header actions />
      <View className="mt-3 px-5">
        <Text className="font-inter-semibold text-[11px] text-brand">{step}</Text>
        <Text className="mt-1 font-inter-bold text-2xl">{title}</Text>
        {subtitle && <Text className="mt-1 text-xs text-body">{subtitle}</Text>}
      </View>
    </LinearGradient>
  );
}

/** White rounded panel with a grab handle that overlaps <FlowHeader>. */
export function FlowSheet({ children }: { children: ReactNode }) {
  return (
    <View className="-mt-6 flex-1 rounded-t-3xl bg-white px-5 pt-3">
      <View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
      {children}
    </View>
  );
}

export function StepPill({ label, className = "" }: { label: string; className?: string }) {
  return (
    <View className={`self-start rounded-full bg-brand-light px-3 py-1 ${className}`}>
      <Text className="font-inter-medium text-[11px] text-brand-dark">{label}</Text>
    </View>
  );
}

export const FLOW_TITLE: Record<FlowType, string> = {
  send: "Send a Package",
  receive: "Receive a Package",
  shopping: "Personal Shopping",
  store: "Store Delivery",
};

/** Parses the shopping "Expected Order Value" input into a number. */
export const parseAmount = (v: string) => {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Prices for the current customer draft. */
export function useDraftPricing() {
  const { flow, vehicle, speed, shopping } = useAppSelector((s) => s.delivery);
  const isShopping = flow === "shopping";
  const delivery = deliveryFee(vehicle, speed);
  const shoppingFee = isShopping ? PERSONAL_SHOPPING_FEE : 0;
  const orderValue = isShopping ? parseAmount(shopping.expectedValue) : 0;
  return {
    isShopping,
    delivery,
    shoppingFee,
    /** Everything Apex Aora charges (delivery + shopping service). */
    serviceFee: delivery + shoppingFee,
    orderValue,
  };
}

function CostRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className={strong ? "font-inter-semibold text-sm" : "text-xs text-body"}>{label}</Text>
      <Text className={strong ? "font-inter-bold text-base" : "font-inter-semibold text-xs"}>{value}</Text>
    </View>
  );
}

/** "Order Cost Summary" card for the personal shopping flow (7.png). */
export function OrderCostSummary({ className = "" }: { className?: string }) {
  const { orderValue, shoppingFee } = useDraftPricing();
  return (
    <Card className={className}>
      <Text className="mb-2 font-inter-semibold text-sm">Order Cost Summary</Text>
      <CostRow label="Order value (estimated)" value={formatAED(orderValue)} />
      <CostRow label="Personal shopping services" value={formatAED(shoppingFee)} />
      <View className="mt-2 flex-row items-center justify-between rounded-xl bg-brand-lighter px-3 py-3">
        <Text className="font-inter-semibold text-sm">Total to pay</Text>
        <Text className="font-inter-bold text-base text-brand-dark">{formatAED(orderValue + shoppingFee)}</Text>
      </View>
    </Card>
  );
}

/** Violet pill with a black arrow circle on the left (Personal Shopping "Continue"). */
export function ArrowContinueButton({
  title = "Continue",
  disabled,
  onPress,
  tone = "brand",
}: {
  title?: string;
  disabled?: boolean;
  onPress: () => void;
  /** "brand" = violet pill + black arrow (shopping form); "dark" = black pill + violet arrow (payment success). */
  tone?: "brand" | "dark";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`h-14 flex-row items-center overflow-hidden rounded-full ${tone === "dark" ? "bg-ink" : "bg-brand"} p-1 ${disabled ? "opacity-50" : "active:opacity-80"}`}
    >
      {tone === "brand" && (
        <LinearGradient
          colors={[...brandGradient]}
          start={brandGradientStart}
          end={brandGradientEnd}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
      <View className={`h-12 w-12 items-center justify-center overflow-hidden rounded-full ${tone === "dark" ? "bg-brand" : "bg-ink"}`}>
        {tone === "dark" && (
          <LinearGradient
            colors={[...brandGradient]}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        )}
        <Ionicons name="arrow-forward" size={20} color={colors.white} />
      </View>
      <Text className="flex-1 pr-12 text-center font-inter-semibold text-base text-white">{title}</Text>
    </Pressable>
  );
}

/** Review screen section: title + Edit link + content. */
export function ReviewSection({ title, onEdit, children }: { title: string; onEdit?: () => void; children: ReactNode }) {
  return (
    <View className="border-b border-line py-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-inter-semibold text-sm">{title}</Text>
        {onEdit && (
          <Pressable hitSlop={8} onPress={onEdit}>
            <Text className="font-inter-medium text-xs text-brand underline">Edit</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}
