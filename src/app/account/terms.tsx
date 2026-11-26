import { Image, View } from "react-native";
import { Header, Screen, Text } from "@/components/ui";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

/** Section numbers; title/body live in account.t{n}Title / account.t{n}Body. */
const SECTIONS = [1, 2, 3, 4, 5, 6];

export default function TermsScreen() {
  const t = useT();
  return (
    <Screen background="white">
      <Header inlineTitle={t("account.helpSupportTitle")} actions />

      <View className="px-5 pt-2">
        <View className="flex-row items-center gap-3">
          <Text className="flex-1 font-inter-bold text-[22px] leading-7">{t("account.termsTitle")}</Text>
          <Image source={images.clipboard} resizeMode="contain" style={{ width: 96, height: 76 }} />
        </View>

        <Text className="mt-4 font-inter-bold text-base text-brand">{t("account.importantNotice")}</Text>
        <Text className="mt-1 text-xs leading-5 text-brand-dark">
          {t("account.termsIntro")}
        </Text>

        {SECTIONS.map((n) => (
          <View key={n} className="mt-5">
            <Text className="font-inter-bold text-[15px]">
              {n}. {t(`account.t${n}Title`)}
            </Text>
            <Text className="mt-1 text-sm leading-6 text-ink">{t(`account.t${n}Body`)}</Text>
          </View>
        ))}

        <View className="mt-6 pb-4">
          <Text className="font-inter-bold text-[15px]">{t("account.termsFooterTitle")}</Text>
          <Text className="mt-1 text-sm text-ink">{t("account.termsFooterSub")}</Text>
        </View>
      </View>
    </Screen>
  );
}
