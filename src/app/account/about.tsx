import { Alert, Image, Linking, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header, Screen, Text } from "@/components/ui";
import { brandGradient, brandGradientEnd, brandGradientStart, colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { translate, useT } from "@/i18n";
import { store } from "@/store";

type IconName = keyof typeof Ionicons.glyphMap;

const FEATURES: { icon: IconName; labelKey: string }[] = [
  { icon: "flash-outline", labelKey: "account.featFast" },
  { icon: "shield-checkmark-outline", labelKey: "account.featSafe" },
  { icon: "headset-outline", labelKey: "account.featSupport" },
];

const WHY = ["account.why1", "account.why2", "account.why3"];

// TODO: replace with the real APEX AORA contact details and social links.
const PHONE = "+971 50 123 4567";
const EMAIL = "support@apexaora.ae";
const WHATSAPP = "971501234567";

/** `detail` is shown as-is (phone/email); `detailKey` is translated. */
const CONTACTS: { icon: IconName; titleKey: string; detail?: string; detailKey?: string; url: string }[] = [
  { icon: "call-outline", titleKey: "account.callUs", detail: "+971 ** **** ***", url: `tel:${PHONE.replace(/\s/g, "")}` },
  { icon: "mail-outline", titleKey: "account.emailUs", detail: EMAIL, url: `mailto:${EMAIL}` },
  { icon: "logo-whatsapp", titleKey: "account.whatsapp", detailKey: "account.chatWithUs", url: `https://wa.me/${WHATSAPP}` },
];

const SOCIALS: { icon: IconName; label: string; url: string }[] = [
  { icon: "logo-instagram", label: "Instagram", url: "https://instagram.com" },
  { icon: "logo-facebook", label: "Facebook", url: "https://facebook.com" },
  { icon: "logo-tiktok", label: "TikTok", url: "https://tiktok.com" },
  { icon: "logo-linkedin", label: "LinkedIn", url: "https://linkedin.com" },
  { icon: "logo-twitter", label: "X / Twitter", url: "https://x.com" },
];

const open = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert(translate(store.getState().settings.language, "account.cantOpenLink"), url));

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

function InfoCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-3 rounded-2xl border border-line bg-white p-4" style={cardShadow}>
      <View className="h-12 w-12 items-center justify-center rounded-full border border-brand-light bg-brand-lighter">
        <Ionicons name={icon} size={22} color={colors.brandDark} />
      </View>
      <View className="flex-1">
        <Text className="font-inter-bold text-base">{title}</Text>
        <Text className="mt-0.5 text-xs leading-5 text-body">{body}</Text>
      </View>
    </View>
  );
}

/** About APEX AORA — matches the About design, in APEX AORA colours. */
export default function AboutScreen() {
  const t = useT();
  return (
    <Screen>
      <Header inlineTitle={t("account.aboutApex")} actions />

      {/* Hero */}
      <View className="mt-1 flex-row items-center px-5">
        <View className="flex-1 pe-2">
          <Text className="font-inter-bold text-[26px] leading-8">{t("account.aboutApex")}</Text>
          <Text className="mt-1.5 text-xs leading-5 text-body">{t("account.aboutTagline")}</Text>
          <LinearGradient
            colors={[...brandGradient]}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={{ marginTop: 10, height: 5, width: 56, borderRadius: 3 }}
          />
        </View>
        <View style={{ width: 140, height: 120 }} className="items-center justify-center">
          <View
            className="absolute h-16 w-32 rounded-full border-4 border-brand-accent opacity-40"
            style={{ transform: [{ rotate: "-12deg" }], top: 52 }}
          />
          <Image source={images.box} resizeMode="contain" style={{ width: 120, height: 88, marginTop: 22 }} />
          <View className="absolute top-0">
            <Ionicons name="location" size={38} color={colors.brand} />
          </View>
        </View>
      </View>

      {/* Feature strip */}
      <View className="mx-5 mt-4 flex-row rounded-2xl bg-brand-lighter py-4">
        {FEATURES.map((f, i) => (
          <View key={f.icon} className={`flex-1 items-center ${i > 0 ? "border-s border-brand-light" : ""}`}>
            <Ionicons name={f.icon} size={24} color={colors.brandDark} />
            <Text className="mt-2 text-center font-inter-semibold text-xs leading-4">{t(f.labelKey)}</Text>
          </View>
        ))}
      </View>

      <View className="mx-5 mt-4">
        <InfoCard icon="locate-outline" title={t("account.ourMission")} body={t("account.ourMissionBody")} />
        <InfoCard icon="eye-outline" title={t("account.ourVision")} body={t("account.ourVisionBody")} />
      </View>

      {/* Why choose */}
      <View className="mx-5 mt-1 flex-row items-center rounded-2xl bg-brand-lighter p-4">
        <Image source={images.trophy} resizeMode="contain" style={{ width: 96, height: 80 }} />
        <View className="mx-3 h-20 w-px bg-brand-light" />
        <View className="flex-1">
          <Text className="mb-2 font-inter-bold text-sm">{t("account.whyChoose")}</Text>
          {WHY.map((w) => (
            <View key={w} className="mb-1.5 flex-row items-center gap-2">
              <View className="h-4 w-4 items-center justify-center rounded-full bg-brand-light">
                <Ionicons name="checkmark" size={11} color={colors.brandDark} />
              </View>
              <Text className="flex-1 text-[11px] text-body">{t(w)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact tiles */}
      <View className="mx-5 mt-4 flex-row gap-2.5">
        {CONTACTS.map((c) => (
          <Pressable
            key={c.titleKey}
            accessibilityRole="button"
            onPress={() => open(c.url)}
            className="flex-1 items-center rounded-2xl border border-brand-light bg-white px-2 py-3 active:opacity-70"
            style={cardShadow}
          >
            <Ionicons name={c.icon} size={20} color={colors.brandDark} />
            <Text className="mt-1 font-inter-semibold text-sm">{t(c.titleKey)}</Text>
            <Text className="mt-0.5 text-center text-[10px] text-muted" numberOfLines={1}>
              {c.detailKey ? t(c.detailKey) : `\u2066${c.detail}\u2069`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Follow us */}
      <View className="mx-5 mt-6 border-s-4 border-brand ps-3">
        <Text className="font-inter-bold text-base text-brand-dark">{t("account.followUs")}</Text>
        <Text className="mt-0.5 text-xs text-body">{t("account.followUsSub")}</Text>
      </View>
      <View className="mx-5 mt-4 flex-row justify-between">
        {SOCIALS.map((s) => (
          <Pressable
            key={s.label}
            accessibilityRole="link"
            accessibilityLabel={s.label}
            onPress={() => open(s.url)}
            className="h-12 w-12 items-center justify-center rounded-xl bg-brand-lighter active:opacity-70"
          >
            <Ionicons name={s.icon} size={20} color={colors.brandDark} />
          </Pressable>
        ))}
      </View>

      {/* City skyline (stand-in, in brand tint). TODO: replace with the Figma skyline image when exported. */}
      <LinearGradient colors={[colors.surface, colors.brandLighter]} style={{ marginTop: 24, height: 110, justifyContent: "flex-end" }}>
        <View className="flex-row items-end justify-center gap-1 px-5">
          {[26, 40, 34, 58, 46, 100, 52, 40, 64, 32, 24].map((h, i) => (
            <View
              key={i}
              style={{ height: h }}
              className={`${i === 5 ? "w-3" : "w-6"} rounded-t-md ${i % 2 ? "bg-brand-accent" : "bg-brand"} opacity-30`}
            />
          ))}
        </View>
        <View className="h-1 bg-brand opacity-30" />
      </LinearGradient>
    </Screen>
  );
}
