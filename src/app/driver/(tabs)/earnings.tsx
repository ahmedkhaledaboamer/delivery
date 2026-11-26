import { useMemo } from "react";
import { ActivityIndicator, ImageBackground, RefreshControl, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAB_BAR_SPACE, Text } from "@/components/ui";
import { DriverHeader, aed, useDriverIdentity } from "@/components/driver";
import { jobEarning, useMyJobs, type DriverJob } from "@/api/driver";
import { useT } from "@/i18n";
import { formatDate, formatTime } from "@/lib/format";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 };

const finishedAt = (o: DriverJob) => o.deliveredAt ?? o.createdAt;

/** Monday 00:00 of the current week. */
function startOfWeek() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function StatTile({ icon, label, value, sub }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; sub: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-line bg-white p-4" style={cardShadow}>
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-brand-lighter">
        <Ionicons name={icon} size={17} color={colors.brandDark} />
      </View>
      <Text className="mt-3 text-xs text-body">{label}</Text>
      <Text className="mt-0.5 font-inter-bold text-lg">{value}</Text>
      <Text className="mt-0.5 text-[11px] text-muted">{sub}</Text>
    </View>
  );
}

export default function DriverEarningsScreen() {
  const t = useT();
  const me = useDriverIdentity();
  const jobs = useMyJobs(me?.phone);

  const stats = useMemo(() => {
    const done = (jobs.data ?? [])
      .filter((o) => o.status === "delivered")
      .sort((a, b) => new Date(finishedAt(b)).getTime() - new Date(finishedAt(a)).getTime());
    const today = new Date().toDateString();
    const week = startOfWeek();
    const todayJobs = done.filter((o) => new Date(finishedAt(o)).toDateString() === today);
    const weekJobs = done.filter((o) => new Date(finishedAt(o)).getTime() >= week);
    const sum = (list: DriverJob[]) => list.reduce((s, o) => s + jobEarning(o), 0);
    return {
      done,
      today: sum(todayJobs),
      todayTrips: todayJobs.length,
      week: sum(weekJobs),
      weekTrips: weekJobs.length,
      total: sum(done),
    };
  }, [jobs.data]);

  const trips = (n: number) => (n === 1 ? t("driver.tripsOne") : t("driver.trips", { n }));

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={jobs.isRefetching} onRefresh={() => void jobs.refetch()} tintColor={colors.brand} colors={[colors.brand]} />
        }
      >
        <DriverHeader title={t("driver.earningsTitle")} subtitle={t("driver.earningsSubtitle")} />

        {jobs.isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <View className="px-5 pt-5">
            <ImageBackground
              source={images.walletCardBg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 18 }}
              style={{ aspectRatio: 2.2, borderRadius: 18, paddingHorizontal: 18, justifyContent: "center", overflow: "hidden" }}
            >
              <View className="w-3/5">
                <Text className="text-sm text-white opacity-90">{t("driver.earnedToday")}</Text>
                <Text className="mt-1 font-inter-bold text-[28px] text-white">{aed(t, stats.today)}</Text>
                <Text className="mt-1 text-xs text-white opacity-90">{trips(stats.todayTrips)}</Text>
              </View>
            </ImageBackground>

            <View className="mt-4 flex-row gap-3">
              <StatTile icon="calendar-outline" label={t("driver.thisWeek")} value={aed(t, stats.week)} sub={trips(stats.weekTrips)} />
              <StatTile icon="trophy-outline" label={t("driver.allTime")} value={aed(t, stats.total)} sub={trips(stats.done.length)} />
            </View>

            <Text className="mb-3 mt-6 font-inter-bold text-lg">{t("driver.completedJobs")}</Text>
            {jobs.isError && <Text className="py-6 text-center text-sm text-danger">{t("common.somethingWrong")}</Text>}
            {!jobs.isError && stats.done.length === 0 && (
              <Text className="py-6 text-center text-sm text-muted">{t("driver.noCompleted")}</Text>
            )}
            {stats.done.map((o) => (
              <View
                key={o.id}
                className="mb-3 flex-row items-center gap-3 rounded-xl border border-line bg-white px-3 py-3"
                style={cardShadow}
              >
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-brand-lighter">
                  <Ionicons name="cube-outline" size={17} color={colors.brandDark} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-[13px]" numberOfLines={1}>
                    {o.dropoffs[0]?.address ?? o.code}
                  </Text>
                  <Text className="mt-0.5 text-[10px] text-muted">
                    {o.code} · {formatDate(finishedAt(o))} · {formatTime(finishedAt(o))}
                  </Text>
                </View>
                <Text className="font-inter-semibold text-xs text-brand">+{aed(t, jobEarning(o))}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
