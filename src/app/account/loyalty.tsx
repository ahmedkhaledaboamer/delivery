import { Alert, Image, ImageBackground, Pressable, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DirIcon, Header, Screen, StaticTabBar, Text } from "@/components/ui";
import { QueryState } from "@/components/account";
import { useLoyalty, useRedeemReward } from "@/api/hooks";
import type { LoyaltyReward } from "@/api/types";
import { brandGradient, brandGradientEnd, brandGradientStart, colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

const fmt = (n: number) => n.toLocaleString("en-US");
const GOLD = "#F5B301";

const REWARD_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  r1: "ticket-percent-outline",
  r2: "truck-fast-outline",
};

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

function SectionTitle({ title, link, onPress }: { title: string; link: string; onPress: () => void }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="font-inter-bold text-base">{title}</Text>
      <Pressable hitSlop={8} onPress={onPress} className="flex-row items-center gap-1">
        <Text className="font-inter-semibold text-[11px] text-brand-dark">{link}</Text>
        <DirIcon name="chevron-forward" size={12} color={colors.brandDark} />
      </Pressable>
    </View>
  );
}

/** Loyalty Point — matches the loyalty design, in APEX AORA colours. */
export default function LoyaltyScreen() {
  const t = useT();
  const loyalty = useLoyalty();
  const redeem = useRedeemReward();

  const onRedeem = (reward: LoyaltyReward) => {
    const points = loyalty.data?.points ?? 0;
    if (points < reward.points) {
      Alert.alert(t("account.notEnoughPoints"), t("account.notEnoughPointsBody", { n: fmt(reward.points - points), reward: reward.title }));
      return;
    }
    Alert.alert(t("account.redeemTitle"), t("account.redeemBody", { n: fmt(reward.points), reward: reward.title }), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("account.redeem"),
        onPress: () =>
          redeem.mutate(reward.id, {
            onSuccess: () => Alert.alert(t("account.rewardRedeemed"), t("account.rewardRedeemedBody", { reward: reward.title })),
            onError: (e) => Alert.alert(t("account.couldntRedeem"), e instanceof Error ? e.message : t("account.tryAgain")),
          }),
      },
    ]);
  };

  const soon = () => Alert.alert(t("common.comingSoon"), t("account.fullListSoon"));
  const d = loyalty.data;

  return (
    <Screen footer={<StaticTabBar active="profile" />}>
      <Header inlineTitle={t("account.loyaltyPoint")} actions />
      <QueryState isLoading={loyalty.isLoading} error={loyalty.error}>
        {d && (
          <View className="px-5 pt-2">
            {/* Points card */}
            <ImageBackground
              source={images.brandWaveBg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 18 }}
              style={{ borderRadius: 18, paddingStart: 18, flexDirection: "row", alignItems: "center", overflow: "hidden" }}
            >
              <View className="flex-1">
                <Text className="text-sm text-white opacity-90">{t("account.yourPoint")}</Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <MaterialCommunityIcons name="hand-coin" size={22} color={GOLD} />
                  <Text className="font-inter-bold text-2xl text-white">
                    {fmt(d.points)} <Text className="font-inter text-sm text-white">{t("account.points")}</Text>
                  </Text>
                </View>
              </View>
              <Image source={images.trophy} resizeMode="contain" style={{ width: 140, height: 96 }} />
            </ImageBackground>

            {/* Tier */}
            <Pressable onPress={soon} className="mt-4 rounded-2xl border border-line bg-white p-4" style={cardShadow}>
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FFF4D6]">
                  <MaterialCommunityIcons name="medal" size={24} color={GOLD} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm">{d.tier}</Text>
                  <Text className="mt-0.5 text-[11px] text-body">
                    {t("account.keepGoing", { n: fmt(Math.max(0, d.tierTarget - d.points)), tier: d.nextTier })}
                  </Text>
                  <View className="mt-2 flex-row items-center gap-2">
                    <View className="h-2 flex-1 overflow-hidden rounded-full bg-brand-light">
                      <LinearGradient
                        colors={[...brandGradient]}
                        start={brandGradientStart}
                        end={brandGradientEnd}
                        style={{ height: 8, borderRadius: 4, width: `${Math.min(100, (d.points / d.tierTarget) * 100)}%` }}
                      />
                    </View>
                    <Text className="text-[10px] text-body">
                      <Text className="font-inter-semibold text-[10px] text-brand-dark">{fmt(d.points)}</Text> / {fmt(d.tierTarget)}
                    </Text>
                  </View>
                </View>
                <DirIcon name="chevron-forward" size={16} color={colors.body} />
              </View>
            </Pressable>

            {/* Rewards */}
            <View className="mt-6">
              <SectionTitle title={t("account.redeemYourPoints")} link={t("account.seeAllRewards")} onPress={soon} />
              <View className="flex-row gap-3">
                {d.rewards.map((r) => (
                  <View key={r.id} className="flex-1 items-center rounded-2xl border border-line bg-white px-3 py-4" style={cardShadow}>
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-brand-lighter">
                      <MaterialCommunityIcons name={REWARD_ICON[r.id] ?? "gift-outline"} size={24} color={colors.brandDark} />
                    </View>
                    <Text className="mt-2 font-inter-bold text-sm">{r.title}</Text>
                    <Text className="mt-0.5 text-center text-[10px] text-body">{r.subtitle}</Text>
                    <Pressable
                      accessibilityRole="button"
                      disabled={redeem.isPending}
                      onPress={() => onRedeem(r)}
                      className={`mt-3 w-full items-center rounded-full bg-brand-light py-2 ${redeem.isPending ? "opacity-50" : "active:opacity-70"}`}
                    >
                      <Text className="font-inter-semibold text-[11px] text-brand-dark">
                        {redeem.isPending && redeem.variables === r.id ? t("account.redeeming") : t("account.redeemPts", { n: fmt(r.points) })}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>

            {/* History */}
            <View className="mt-6">
              <SectionTitle title={t("account.pointsHistory")} link={t("account.viewAll")} onPress={soon} />
              <View className="rounded-2xl border border-line bg-white px-3" style={cardShadow}>
                {d.history.map((h, i) => (
                  <View key={h.id} className={`flex-row items-center gap-3 py-3 ${i < d.history.length - 1 ? "border-b border-line" : ""}`}>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-lighter">
                      <Ionicons name={h.points < 0 ? "gift-outline" : "cube-outline"} size={17} color={colors.brandDark} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-semibold text-[13px]">{h.title}</Text>
                      <Text className="mt-0.5 text-[11px] text-muted">{h.date}</Text>
                    </View>
                    <Text className={`font-inter-bold text-sm ${h.points < 0 ? "text-danger" : "text-brand"}`}>
                      {h.points < 0 ? "- " : "+ "}
                      {t("account.pts", { n: fmt(Math.abs(h.points)) })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </QueryState>
    </Screen>
  );
}
