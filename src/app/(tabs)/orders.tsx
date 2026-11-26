import { useEffect, useMemo, useState } from "react";
import { Image, RefreshControl, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Header, InfoBanner, PageTitle, SectionLabel, SegmentedTabs, TAB_BAR_SPACE, Text } from "@/components/ui";
import { OrderCard, ScheduledOrderRow } from "@/components/orders/OrderCard";
import { isActive, QueryState } from "@/components/orders/status";
import { useOrders } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import type { Order } from "@/api/types";

type Tab = "active" | "past";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Today · 3 November" / "Yesterday · 2 November" / "1 November 2026" */
function dayLabel(iso: string) {
  const d = new Date(iso);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (d.toDateString() === new Date().toDateString()) return `Today · ${base}`;
  if (d.toDateString() === new Date(Date.now() - 86_400_000).toDateString()) return `Yesterday · ${base}`;
  return `${base} ${d.getFullYear()}`;
}

function groupByDay(orders: Order[]) {
  const groups: { label: string; orders: Order[] }[] = [];
  for (const o of orders) {
    const label = dayLabel(o.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.orders.push(o);
    else groups.push({ label, orders: [o] });
  }
  return groups;
}

function EmptyState() {
  return (
    <View className="flex-1 items-center px-5 pt-10">
      <Image source={images.handsBox} resizeMode="contain" style={{ width: 220, height: 146 }} />
      <Text className="mt-5 font-inter-bold text-xl">Your first delivery awaits</Text>
      <Text className="mt-2 px-6 text-center text-sm text-body">
        No orders yet. Send a package and follow its journey, from pickup to doorstep.
      </Text>
      <InfoBanner className="mt-6 w-full">Simple booking. Live updates. Cash at drop-off.</InfoBanner>
      <Button className="mt-6 w-full" title="Send your first package" onPress={() => router.push("/send/service")} />
    </View>
  );
}

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === "past" ? "past" : "active");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch, isRefetching } = useOrders();

  useEffect(() => {
    if (params.tab === "past" || params.tab === "active") setTab(params.tab);
  }, [params.tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = data ?? [];
    if (!q) return all;
    return all.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.pickup.address.toLowerCase().includes(q) ||
        o.dropoffs.some((d) => d.address.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const active = filtered.filter(isActive);
  const scheduled = filtered.filter((o) => o.status === "scheduled");
  const past = filtered.filter((o) => o.status === "delivered" || o.status === "cancelled");
  const activeCount = active.length + scheduled.length;
  const hasNoOrders = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: TAB_BAR_SPACE }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <Header hideBack actions />
        <PageTitle title="My orders" subtitle="A clear view of every delivery." />

        <View className="px-5">
          <View className="mt-5 h-12 flex-row items-center gap-2 rounded-xl border border-line bg-white px-4">
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.muted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
              className="flex-1 font-inter text-sm text-ink"
            />
            {!!search && <Ionicons name="close-circle" size={18} color={colors.muted} onPress={() => setSearch("")} />}
          </View>

          <View className="mt-4">
            <SegmentedTabs<Tab>
              variant="solid"
              value={tab}
              onChange={setTab}
              options={[
                { value: "active", label: data ? `Active (${activeCount})` : "Active" },
                { value: "past", label: "Past" },
              ]}
            />
          </View>
        </View>

        {isLoading || isError ? (
          <QueryState loading={isLoading} error={error} onRetry={() => void refetch()} />
        ) : hasNoOrders ? (
          <EmptyState />
        ) : (
          <View className="mt-5 px-5">
            {tab === "active" ? (
              <>
                {groupByDay(active).map((g) => (
                  <View key={g.label}>
                    <SectionLabel>{g.label}</SectionLabel>
                    {g.orders.map((o) => (
                      <OrderCard key={o.id} order={o} />
                    ))}
                  </View>
                ))}
                {scheduled.length > 0 && (
                  <View className="mt-2">
                    <SectionLabel>Scheduled</SectionLabel>
                    {scheduled.map((o) => (
                      <ScheduledOrderRow key={o.id} order={o} />
                    ))}
                  </View>
                )}
                {activeCount === 0 && (
                  <Text className="py-8 text-center text-sm text-body">
                    {search ? "No active orders match your search." : "No active deliveries right now."}
                  </Text>
                )}
                <InfoBanner className="mt-2">Completed and cancelled deliveries appear in Past.</InfoBanner>
              </>
            ) : past.length === 0 ? (
              <Text className="py-8 text-center text-sm text-body">
                {search ? "No past orders match your search." : "No past deliveries yet."}
              </Text>
            ) : (
              groupByDay(past).map((g) => (
                <View key={g.label}>
                  <SectionLabel>{g.label}</SectionLabel>
                  {g.orders.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
