import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@/components/ui";
import { useT } from "@/i18n";

export default function DriverTabsLayout() {
  const t = useT();
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <BottomTabBar {...p} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("common.tabJobs"),
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? "briefcase" : "briefcase-outline"} size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: t("common.tabEarnings"),
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color as string} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: t("common.tabProfile") }} />
    </Tabs>
  );
}
