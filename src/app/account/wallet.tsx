import { ImageBackground, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header, Screen, StaticTabBar, Text } from "@/components/ui";
import { QueryState } from "@/components/account";
import { useWallet } from "@/api/hooks";
import { formatSignedAED } from "@/lib/format";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 };

/** My Wallet — matches the wallet design, in APEX AORA colours. */
export default function WalletScreen() {
  const t = useT();
  const wallet = useWallet();

  return (
    <Screen footer={<StaticTabBar active="profile" />}>
      <Header inlineTitle={t("account.myWallet")} actions />
      <QueryState isLoading={wallet.isLoading} error={wallet.error}>
        {wallet.data && (
          <View className="px-5 pt-2">
            <ImageBackground
              source={images.walletCardBg}
              resizeMode="cover"
              imageStyle={{ borderRadius: 18 }}
              style={{ aspectRatio: 2.2, borderRadius: 18, paddingHorizontal: 18, justifyContent: "center", overflow: "hidden" }}
            >
              <View className="w-3/5">
                <Text className="text-sm text-white opacity-90">{t("account.availableBalance")}</Text>
                <Text className="mt-1 font-inter-bold text-[28px] text-white">{t("common.aed", { amount: wallet.data.balance.toLocaleString("en-US") })}</Text>
              </View>
            </ImageBackground>

            <Text className="mb-3 mt-6 font-inter-bold text-lg">{t("account.historyOrders")}</Text>
            {wallet.data.transactions.length === 0 && <Text className="py-6 text-center text-sm text-muted">{t("account.noTransactions")}</Text>}
            {wallet.data.transactions.map((tx) => (
              <View
                key={tx.id}
                className="mb-3 flex-row items-center gap-3 rounded-xl border border-line bg-white px-3 py-3"
                style={cardShadow}
              >
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-brand-lighter">
                  <Ionicons name="cube-outline" size={17} color={colors.brandDark} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-[13px]">{tx.title}</Text>
                  <Text className="mt-0.5 text-[10px] text-muted">{tx.date}</Text>
                </View>
                <Text className={`font-inter-semibold text-xs ${tx.amount < 0 ? "text-ink" : "text-brand"}`}>{formatSignedAED(tx.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </QueryState>
    </Screen>
  );
}
