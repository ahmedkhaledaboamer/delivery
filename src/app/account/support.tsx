import { Image, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, InfoBanner, Screen, Text } from "@/components/ui";
import { IconTile, QueryState, SectionHeader } from "@/components/account";
import { useTickets } from "@/api/hooks";
import type { Ticket, TicketStatus } from "@/api/types";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

type IconName = keyof typeof Ionicons.glyphMap;

const STATUS: Record<TicketStatus, { label: string; bg: string; text: string; dot: string }> = {
  "in-progress": { label: "In Progress", bg: "bg-blue-50", text: "text-[#2563EB]", dot: "bg-[#2563EB]" },
  resolved: { label: "Resolved", bg: "bg-brand-light", text: "text-brand-dark", dot: "bg-brand" },
  closed: { label: "Closed", bg: "bg-gray-100", text: "text-body", dot: "bg-muted" },
};

const CATEGORY_ICON: Record<Ticket["category"], IconName> = {
  order: "cube-outline",
  payment: "card-outline",
  account: "person-outline",
  technical: "phone-portrait-outline",
};

// `issueType` must match ISSUE_TYPES in new-ticket.tsx so the tile pre-selects it.
const TOPICS: { icon: IconName; label: string; issueType: string }[] = [
  { icon: "cube-outline", label: "Orders &\nDelivery", issueType: "Order Issue" },
  { icon: "card-outline", label: "Payments &\nRefunds", issueType: "Payment & Refund" },
  { icon: "person-outline", label: "Account &\nProfile", issueType: "Account Issue" },
  { icon: "phone-portrait-outline", label: "App &\nTechnical", issueType: "App & Technical" },
];

function StatusChip({ status }: { status: TicketStatus }) {
  const s = STATUS[status];
  return (
    <View className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${s.bg}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <Text className={`font-inter-medium text-[10px] ${s.text}`}>{s.label}</Text>
    </View>
  );
}

export default function SupportScreen() {
  const tickets = useTickets();

  return (
    <Screen>
      <Header inlineTitle="Help & Support" actions />

      <View className="px-5 pt-2">
        {/* Hero */}
        <View className="flex-row items-center rounded-2xl bg-brand-lighter p-4">
          <View className="flex-1 pr-2">
            <Text className="font-inter-bold text-xl text-brand-dark">Support Tickets</Text>
            <Text className="mt-1 text-xs leading-5 text-body">Create a ticket and we'll get back to you</Text>
          </View>
          <Image source={images.headset} resizeMode="contain" style={{ width: 110, height: 88 }} />
        </View>

        <Button title="Create New Ticket" icon="add-circle-outline" className="mt-4" onPress={() => router.push("/account/new-ticket")} />

        {/* My tickets */}
        <View className="mt-6">
          <SectionHeader title="My Tickets" />
          <QueryState isLoading={tickets.isLoading} error={tickets.error}>
            {tickets.data?.length === 0 && <Text className="py-6 text-center text-sm text-muted">No tickets yet.</Text>}
            {tickets.data?.map((t) => (
              <Card key={t.id} className="mb-3 flex-row items-center gap-3 py-3">
                <IconTile name={CATEGORY_ICON[t.category]} size={36} iconSize={18} rounded="rounded-lg" />
                <View className="flex-1">
                  <Text className="font-inter-semibold text-sm">{t.title}</Text>
                  <Text className="mt-0.5 text-[11px] text-muted">
                    {t.orderCode ? `${t.orderCode} · ` : ""}
                    {t.createdAt}
                  </Text>
                </View>
                <StatusChip status={t.status} />
              </Card>
            ))}
          </QueryState>
        </View>

        {/* Common topics */}
        <View className="mt-4">
          <SectionHeader title="Common Topics" />
          <View className="flex-row gap-2">
            {TOPICS.map((t) => (
              <Card key={t.label} onPress={() => router.push({ pathname: "/account/new-ticket", params: { issueType: t.issueType } })}
                className="flex-1 items-center px-1 py-3">
                <Ionicons name={t.icon} size={20} color={colors.brand} />
                <Text className="mt-2 text-center font-inter-medium text-[10px]">{t.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        <InfoBanner icon="help-circle-outline" className="mt-5">
          <Text className="font-inter-semibold text-sm">How it works?</Text>
          <Text className="mt-1 text-xs leading-5 text-body">
            Create a ticket, get a reference number, and follow updates. We usually reply within 24 hours.
          </Text>
        </InfoBanner>
      </View>
    </Screen>
  );
}
