import { Alert, Image, ImageBackground, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Header, Screen, StaticTabBar, Text } from "@/components/ui";
import { IconTile, QueryState, SectionHeader } from "@/components/account";
import { useLoyalty, useRedeemReward } from "@/api/hooks";
import type { LoyaltyReward } from "@/api/types";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

const fmt = (n: number) => n.toLocaleString("en-US");

const REWARD_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  r1: "pricetag-outline",
  r2: "bicycle",
};

export default function LoyaltyScreen() {
  const loyalty = useLoyalty();
  const redeem = useRedeemReward();

  const onRedeem = (reward: LoyaltyReward) => {
    const points = loyalty.data?.points ?? 0;
    if (points < reward.points) {
      Alert.alert("Not enough points", `You need ${fmt(reward.points - points)} more points to redeem ${reward.title}.`);
      return;
    }
    Alert.alert("Redeem reward?", `Use ${fmt(reward.points)} points for ${reward.title}.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Redeem",
        onPress: () =>
          redeem.mutate(reward.id, {
            onSuccess: () => Alert.alert("Reward redeemed", `${reward.title} will be applied to your next order.`),
            onError: (e) => Alert.alert("Couldn't redeem", e instanceof Error ? e.message : "Please try again."),
          }),
      },
    ]);
  };

  const d = loyalty.data;

  return (
    <Screen footer={<StaticTabBar active="profile" />}>
      <Header inlineTitle="Loyalty Point" actions />
      <QueryState isLoading={loyalty.isLoading} error={loyalty.error}>
        {d && (
          <View className="px-5 pt-2">
            <ImageBackground
              source={images.greenWaveBg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 20 }}
              style={{ borderRadius: 20, paddingLeft: 20, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
            >
              <View className="flex-1">
                <Text className="text-sm text-white opacity-80">Your Point</Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Ionicons name="star" size={20} color={colors.brandAccent} />
                  <Text className="font-inter-bold text-2xl text-white">
                    {fmt(d.points)} <Text className="font-inter text-sm text-white">points</Text>
                  </Text>
                </View>
              </View>
              <Image source={images.trophy} resizeMode="contain" style={{ width: 150, height: 100 }} />
            </ImageBackground>

            {/* Tier */}
            <Card className="mt-4">
              <View className="flex-row items-center gap-3">
                <IconTile name="medal-outline" size={40} iconSize={20} rounded="rounded-full" />
                <View className="flex-1">
                  <Text className="font-inter-semibold text-sm">{d.tier}</Text>
                  <Text className="mt-0.5 text-xs text-muted">
                    Keep going! Earn {fmt(Math.max(0, d.tierTarget - d.points))} more points to reach {d.nextTier}
                  </Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center gap-3">
                <View className="h-2 flex-1 overflow-hidden rounded-full bg-brand-light">
                  <View className="h-2 rounded-full bg-brand" style={{ width: `${Math.min(100, (d.points / d.tierTarget) * 100)}%` }} />
                </View>
                <Text className="text-xs text-body">
                  {fmt(d.points)} / {fmt(d.tierTarget)}
                </Text>
              </View>
            </Card>

            {/* Rewards */}
            <View className="mt-6">
              <SectionHeader title="Redeem Your Points" />
              <View className="flex-row gap-3">
                {d.rewards.map((r) => (
                  <Card key={r.id} className="flex-1 items-center">
                    <IconTile name={REWARD_ICON[r.id] ?? "gift-outline"} size={40} iconSize={20} rounded="rounded-full" />
                    <Text className="mt-2 font-inter-bold text-sm">{r.title}</Text>
                    <Text className="mt-0.5 text-center text-[11px] text-muted">{r.subtitle}</Text>
                    <Button
                      title={`Redeem ${fmt(r.points)} Pts`}
                      size="sm"
                      className="mt-3 w-full"
                      variant={d.points >= r.points ? "primary" : "outline"}
                      loading={redeem.isPending && redeem.variables === r.id}
                      disabled={redeem.isPending}
                      onPress={() => onRedeem(r)}
                    />
                  </Card>
                ))}
              </View>
            </View>

            {/* History */}
            <View className="mt-6">
              <SectionHeader title="Points History" />
              {d.history.map((h) => (
                <Card key={h.id} className="mb-3 flex-row items-center gap-3 py-3">
                  <IconTile name={h.points < 0 ? "gift-outline" : "cube-outline"} size={36} iconSize={18} rounded="rounded-lg" />
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-sm">{h.title}</Text>
                    <Text className="mt-0.5 text-xs text-muted">{h.date}</Text>
                  </View>
                  <Text className={`font-inter-semibold text-sm ${h.points < 0 ? "text-danger" : "text-brand"}`}>
                    {h.points < 0 ? "- " : "+ "}
                    {fmt(Math.abs(h.points))} Pts
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        )}
      </QueryState>
    </Screen>
  );
}
