import type { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href, type Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "./Text";
import { useT } from "@/i18n";
import { colors } from "@/constants/theme";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index: ["home", "home-outline"],
  orders: ["document-text", "document-text-outline"],
  profile: ["person", "person-outline"],
};

const shadow = { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 };

const TAB_LABEL_KEY: Record<string, string> = {
  index: "common.tabHome",
  orders: "common.tabOrders",
  profile: "common.tabProfile",
  jobs: "common.tabJobs",
  earnings: "common.tabEarnings",
};

type IconRenderer = (p: { focused: boolean; color: string; size: number }) => ReactNode;

function TabItem({
  name,
  label,
  focused,
  onPress,
  renderIcon,
}: {
  name: string;
  label: string;
  focused: boolean;
  onPress: () => void;
  /** Screen's own `tabBarIcon` option, when it sets one (e.g. driver app tabs). */
  renderIcon?: IconRenderer;
}) {
  const t = useT();
  // A screen that sets its own title keeps it; otherwise use the shared translated label for that route name.
  if (label === name && TAB_LABEL_KEY[name]) label = t(TAB_LABEL_KEY[name]);
  const [on, off] = ICONS[name] ?? ["ellipse", "ellipse-outline"];
  const iconColor = focused ? colors.brandDark : colors.body;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      className={`min-w-[76px] items-center rounded-full px-4 py-2 ${focused ? "bg-brand-light" : ""}`}
    >
      {renderIcon ? renderIcon({ focused, color: iconColor, size: 20 }) : <Ionicons name={focused ? on : off} size={20} color={iconColor} />}
      <Text className={`mt-0.5 text-[10px] ${focused ? "font-inter-semibold text-brand-dark" : "text-body"}`}>{label}</Text>
    </Pressable>
  );
}

/** Floating white pill tab bar (Home · Orders · Profile) used by the (tabs) navigator. */
export function BottomTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute inset-x-0 bottom-0 items-center" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="flex-row items-center gap-2 rounded-full border border-line bg-white px-3 py-2" style={shadow}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          return (
            <TabItem
              key={route.key}
              name={route.name}
              label={label}
              renderIcon={options.tabBarIcon as IconRenderer | undefined}
              focused={focused}
              onPress={() => {
                const event = emitter.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigateToTab(route.key);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

const STATIC_TABS: { name: string; label: string; href: Href }[] = [
  { name: "index", label: "Home", href: "/(tabs)" },
  { name: "orders", label: "Orders", href: "/(tabs)/orders" },
  { name: "profile", label: "Profile", href: "/(tabs)/profile" },
];

/**
 * Same pill for pushed screens that show the tab bar in the design (Settings, Notifications, Wallet, Loyalty).
 * Pass it as <Screen footer={<StaticTabBar active="profile" />}>.
 */
export function StaticTabBar({ active }: { active?: "index" | "orders" | "profile" }) {
  return (
    <View className="items-center">
      <View className="flex-row items-center gap-2 rounded-full border border-line bg-white px-3 py-2" style={shadow}>
        {STATIC_TABS.map((t) => (
          <TabItem key={t.name} name={t.name} label={t.label} focused={active === t.name} onPress={() => router.dismissTo(t.href)} />
        ))}
      </View>
    </View>
  );
}

/** Extra bottom padding tab screens need so content isn't hidden behind the floating bar. */
export const TAB_BAR_SPACE = 110;
