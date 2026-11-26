import { ImageBackground, View } from "react-native";
import { Card, Header, Screen, StaticTabBar, Text } from "@/components/ui";
import { IconTile, QueryState, SectionHeader } from "@/components/account";
import { useWallet } from "@/api/hooks";
import { formatSignedAED } from "@/lib/format";
import { images } from "@/constants/images";

export default function WalletScreen() {
  const wallet = useWallet();

  return (
    <Screen footer={<StaticTabBar active="profile" />}>
      <Header inlineTitle="My Wallet" actions />
      <QueryState isLoading={wallet.isLoading} error={wallet.error}>
        {wallet.data && (
          <View className="px-5 pt-2">
            <ImageBackground
              source={images.walletCardBg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 20 }}
              style={{ aspectRatio: 2, borderRadius: 20, padding: 20, justifyContent: "center" }}
            >
              <View className="w-3/5">
                <Text className="text-sm text-white opacity-80">Available Balance</Text>
                <Text className="mt-1 font-inter-bold text-3xl text-white">{`AED ${wallet.data.balance.toLocaleString("en-US")}`}</Text>
              </View>
            </ImageBackground>

            <View className="mt-6">
              <SectionHeader title="History Orders" />
              {wallet.data.transactions.length === 0 && <Text className="py-6 text-center text-sm text-muted">No transactions yet.</Text>}
              {wallet.data.transactions.map((t) => (
                <Card key={t.id} className="mb-3 flex-row items-center gap-3 py-3">
                  <IconTile name="cube-outline" size={36} iconSize={18} rounded="rounded-lg" />
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-sm">{t.title}</Text>
                    <Text className="mt-0.5 text-xs text-muted">{t.date}</Text>
                  </View>
                  <Text className={`font-inter-semibold text-sm ${t.amount < 0 ? "text-danger" : "text-brand"}`}>
                    {formatSignedAED(t.amount)}
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
