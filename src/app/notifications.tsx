import { ActivityIndicator, Pressable, View } from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DirIcon, Header, PageTitle, Screen, SectionLabel, StaticTabBar, Text } from "@/components/ui";
import { useT } from "@/i18n";
import { IconTile, QueryState } from "@/components/account";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/api/hooks";
import type { Notification } from "@/api/types";
import { formatRelative } from "@/lib/format";
import { colors } from "@/constants/theme";

const KIND_ICON: Record<Notification["kind"], keyof typeof Ionicons.glyphMap> = {
  rider: "bicycle",
  confirmed: "checkmark-circle-outline",
  delivered: "cube-outline",
  welcome: "sparkles-outline",
};

/** Where tapping a notification takes you. */
function notificationHref(n: Notification): Href {
  switch (n.kind) {
    case "rider":
      return n.orderId ? `/orders/${n.orderId}/track` : "/(tabs)/orders";
    case "confirmed":
      return n.orderId ? `/orders/${n.orderId}` : "/(tabs)/orders";
    case "delivered":
      return n.orderId ? `/orders/${n.orderId}/delivered` : "/(tabs)/orders?tab=past";
    case "welcome":
      return "/(tabs)/profile"; // "Save an address for faster booking"
  }
}

type Group = "Today" | "Yesterday" | "Earlier";

function groupOf(iso: string): Group {
  const d = new Date(iso).toDateString();
  if (d === new Date().toDateString()) return "Today";
  if (d === new Date(Date.now() - 86_400_000).toDateString()) return "Yesterday";
  return "Earlier";
}

const GROUP_KEY: Record<Group, string> = {
  Today: "notifications.today",
  Yesterday: "notifications.yesterday",
  Earlier: "notifications.earlier",
};

function NotificationCard({ n, onPress }: { n: Notification; onPress: () => void }) {
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t("notifications.opensRelated")}
      onPress={onPress}
      className={`mb-3 flex-row gap-3 rounded-2xl border p-4 active:opacity-70 ${
        n.read ? "border-line bg-white" : "border-brand-light bg-brand-lighter"
      }`}
    >
      <IconTile name={KIND_ICON[n.kind]} size={36} iconSize={18} rounded="rounded-full" className={n.read ? "bg-brand-lighter" : "bg-white"} />
      <View className="flex-1">
        <View className="flex-row items-start gap-2">
          <Text className={`flex-1 text-sm ${n.read ? "font-inter-medium" : "font-inter-semibold"}`}>{n.title}</Text>
          {!n.read && <View className="mt-1.5 h-2 w-2 rounded-full bg-brand" accessibilityLabel={t("notifications.unread")} />}
        </View>
        <Text className="mt-0.5 text-xs leading-5 text-body">{n.body}</Text>
        <Text className="mt-1 text-[11px] text-muted">{formatRelative(n.createdAt)}</Text>
      </View>
      <DirIcon name="chevron-forward" size={16} color={colors.muted} style={{ alignSelf: "center" }} />
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const t = useT();
  const notifications = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const open = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id);
    router.push(notificationHref(n));
  };

  const list = notifications.data ?? [];
  const unread = list.filter((n) => !n.read).length;
  const groups = (["Today", "Yesterday", "Earlier"] as Group[])
    .map((g) => ({ g, items: list.filter((n) => groupOf(n.createdAt) === g) }))
    .filter((x) => x.items.length > 0);

  return (
    <Screen footer={<StaticTabBar />}>
      <View className="bg-brand-lighter pb-5">
        <Header />
        <PageTitle title={t("notifications.title")} />
        <View className="mt-1 flex-row items-center px-5">
          <Text className="text-sm text-body">{unread > 0 ? t("notifications.unreadCount", { n: unread }) : t("notifications.allCaughtUp")}</Text>
          {unread > 0 && (
            <>
              <Text className="text-sm text-body"> · </Text>
              {markAll.isPending ? (
                <ActivityIndicator size="small" color={colors.brand} />
              ) : (
                <Pressable hitSlop={8} accessibilityRole="button" onPress={() => markAll.mutate()}>
                  <Text className="font-inter-medium text-sm text-brand">{t("notifications.markAllRead")}</Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>

      <View className="px-5 pt-5">
        <QueryState isLoading={notifications.isLoading} error={notifications.error}>
          {list.length === 0 && (
            <View className="items-center py-16">
              <IconTile name="notifications-outline" size={56} iconSize={26} rounded="rounded-full" />
              <Text className="mt-3 text-sm text-muted">{t("notifications.empty")}</Text>
            </View>
          )}
          {groups.map(({ g, items }) => (
            <View key={g} className="mb-2">
              <SectionLabel>{t(GROUP_KEY[g])}</SectionLabel>
              {items.map((n) => (
                <NotificationCard key={n.id} n={n} onPress={() => open(n)} />
              ))}
            </View>
          ))}
        </QueryState>
      </View>
    </Screen>
  );
}
