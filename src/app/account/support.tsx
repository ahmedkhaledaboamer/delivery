import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DirIcon, Header, Screen, Text } from "@/components/ui";
import { QueryState } from "@/components/account";
import { useTickets } from "@/api/hooks";
import type { Ticket, TicketStatus } from "@/api/types";
import { brandGradient, brandGradientEnd, brandGradientStart, colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

type IconName = keyof typeof Ionicons.glyphMap;

const STATUS: Record<TicketStatus, { labelKey: string; icon: IconName; bg: string; text: string; color: string }> = {
  "in-progress": { labelKey: "account.statusInProgress", icon: "time-outline", bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", color: "#0369A1" },
  resolved: { labelKey: "account.statusResolved", icon: "checkmark-circle-outline", bg: "bg-brand-light", text: "text-brand-dark", color: colors.brandDark },
  closed: { labelKey: "account.statusClosed", icon: "close-circle-outline", bg: "bg-gray-100", text: "text-body", color: colors.body },
};

const CATEGORY_ICON: Record<Ticket["category"], IconName> = {
  order: "cube-outline",
  payment: "card-outline",
  account: "person-outline",
  technical: "help-circle-outline",
};

// `issueType` must match ISSUE_TYPES values in new-ticket.tsx so the tile pre-selects it.
const TOPICS: { icon: IconName; labelKey: string; issueType: string }[] = [
  { icon: "cube-outline", labelKey: "account.topicOrders", issueType: "Order Issue" },
  { icon: "card-outline", labelKey: "account.topicPayments", issueType: "Payment & Refund" },
  { icon: "person-outline", labelKey: "account.topicAccount", issueType: "Account Issue" },
  { icon: "help-circle-outline", labelKey: "account.topicTechnical", issueType: "App & Technical" },
];

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

function StatusChip({ status }: { status: TicketStatus }) {
  const t = useT();
  const s = STATUS[status];
  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${s.bg}`}>
      <Ionicons name={s.icon} size={11} color={s.color} />
      <Text className={`font-inter-medium text-[10px] ${s.text}`}>{t(s.labelKey)}</Text>
    </View>
  );
}

/** Help & Support — Support Tickets dashboard, matches the design in APEX AORA colours. */
export default function SupportScreen() {
  const t = useT();
  const tickets = useTickets();

  return (
    <Screen>
      <LinearGradient colors={[colors.brandLighter, colors.surface]}>
        <Header inlineTitle={t("account.helpSupportTitle")} actions />
        {/* Hero */}
        <View className="flex-row items-center px-5 pb-2">
          <View className="flex-1 pe-2">
            <Text className="font-inter-bold text-[26px]">{t("account.supportTickets")}</Text>
            <Text className="mt-1 text-xs leading-5 text-body">{t("account.supportTicketsSub")}</Text>
          </View>
          <Image source={images.headset} resizeMode="contain" style={{ width: 120, height: 96 }} />
        </View>
      </LinearGradient>

      <View className="px-5">
        {/* Create ticket */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/account/new-ticket")}
          className="h-14 flex-row items-center overflow-hidden rounded-xl px-3 active:opacity-80"
        >
          <LinearGradient
            colors={[...brandGradient]}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-white">
            <Ionicons name="add" size={20} color={colors.brandDark} />
          </View>
          <Text className="ms-3 flex-1 font-inter-semibold text-base text-white">{t("account.createNewTicket")}</Text>
          <DirIcon name="chevron-forward" size={20} color={colors.white} />
        </Pressable>

        {/* My tickets */}
        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text className="font-inter-bold text-lg">{t("account.myTickets")}</Text>
          <Pressable hitSlop={8} onPress={() => Alert.alert(t("common.comingSoon"), t("account.ticketListSoon"))} className="flex-row items-center gap-1">
            <Text className="font-inter-semibold text-xs text-brand-dark">{t("account.viewAll")}</Text>
            <DirIcon name="arrow-forward" size={13} color={colors.brandDark} />
          </Pressable>
        </View>
        <QueryState isLoading={tickets.isLoading} error={tickets.error}>
          {tickets.data?.length === 0 && <Text className="py-6 text-center text-sm text-muted">{t("account.noTickets")}</Text>}
          {tickets.data?.map((tk) => (
            <View key={tk.id} className="mb-2.5 flex-row items-center gap-3 rounded-xl border border-line bg-white px-3 py-3" style={cardShadow}>
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-brand-lighter">
                <Ionicons name={CATEGORY_ICON[tk.category]} size={19} color={colors.brandDark} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-sm">{tk.title}</Text>
                <Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>
                  {tk.orderCode ? `\u2066${tk.orderCode}\u2069 · ` : ""}
                  {tk.createdAt}
                </Text>
              </View>
              <StatusChip status={tk.status} />
              <DirIcon name="chevron-forward" size={16} color={colors.body} />
            </View>
          ))}
        </QueryState>

        {/* Common topics */}
        <Text className="mb-3 mt-4 font-inter-bold text-lg">{t("account.commonTopics")}</Text>
        <View className="flex-row gap-2">
          {TOPICS.map((tp) => (
            <Pressable
              key={tp.labelKey}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/account/new-ticket", params: { issueType: tp.issueType } })}
              className="flex-1 items-center rounded-xl bg-brand-lighter px-1 py-3 active:opacity-70"
            >
              <Ionicons name={tp.icon} size={22} color={colors.brandDark} />
              <Text className="mt-2 text-center font-inter-medium text-[10px] leading-[13px]">{t(tp.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        {/* How it works */}
        <View className="mt-5 flex-row gap-3 rounded-xl bg-brand-lighter p-4">
          <Ionicons name="information-circle-outline" size={20} color={colors.brandDark} />
          <View className="flex-1">
            <Text className="font-inter-semibold text-sm">{t("account.howItWorks")}</Text>
            <Text className="mt-1 text-xs leading-5 text-body">
              {t("account.howItWorksBody")}
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}
