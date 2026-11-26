import { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header, InfoBanner, Screen, Text } from "@/components/ui";
import { IconTile } from "@/components/account";
import { colors } from "@/constants/theme";

type Section = { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; body: string };

const SECTIONS: Section[] = [
  {
    icon: "person-circle-outline",
    title: "Information We Collect",
    subtitle: "The data we collect and use to provide better service when you use RUSH.",
    body:
      "We collect your name, mobile number, email address, saved addresses, pickup and drop-off details, payment " +
      "confirmations and basic device information. Location is collected only while you book or track a delivery.",
  },
  {
    icon: "settings-outline",
    title: "How We Use Your Information",
    subtitle: "To process deliveries, improve services and communicate with you.",
    body:
      "Your information is used to create and fulfil deliveries, match you with riders, send order updates, " +
      "process payments and refunds, provide support and improve the app.",
  },
  {
    icon: "lock-closed-outline",
    title: "Data Security",
    subtitle: "How we keep your information safe and protected.",
    body:
      "Data is encrypted in transit and stored on secured servers. Access is limited to staff and partners who need " +
      "it to deliver your order, and we never store your full card details.",
  },
  {
    icon: "share-social-outline",
    title: "Information Sharing",
    subtitle: "When and with whom we may share your information.",
    body:
      "We share only what's needed: riders see pickup and drop-off contacts, payment providers process payments, and " +
      "we may disclose data when required by law. We never sell your personal data.",
  },
  {
    icon: "browsers-outline",
    title: "Cookies",
    subtitle: "How we use cookies to enhance your experience.",
    body:
      "Our app and website use cookies and similar technologies to keep you signed in, remember preferences and " +
      "understand how features are used. You can manage cookies in your device or browser settings.",
  },
];

function PolicyRow({ section, open, onToggle }: { section: Section; open: boolean; onToggle: () => void }) {
  return (
    <View className="mb-3 rounded-2xl border border-line bg-white">
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onToggle} className="flex-row items-center gap-3 p-4">
        <IconTile name={section.icon} size={36} iconSize={18} rounded="rounded-full" />
        <View className="flex-1">
          <Text className="font-inter-semibold text-sm">{section.title}</Text>
          <Text className="mt-0.5 text-[11px] leading-4 text-muted">{section.subtitle}</Text>
        </View>
        <Ionicons name={open ? "chevron-down" : "chevron-forward"} size={18} color={colors.body} />
      </Pressable>
      {open && (
        <View className="border-t border-line px-4 pb-4 pt-3">
          <Text className="text-xs leading-5 text-body">{section.body}</Text>
        </View>
      )}
    </View>
  );
}

export default function PrivacyScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Screen>
      <Header inlineTitle="Privacy Policy" actions />

      <View className="items-center px-5 pt-2">
        {/* TODO: replace with Figma illustration (green shield + document) */}
        <IconTile name="shield-checkmark" size={110} iconSize={60} rounded="rounded-full" />
        <Text className="mt-4 font-inter-bold text-2xl text-brand-dark">Privacy Policy</Text>
        <Text className="mt-1 text-center text-sm text-body">
          Learn how RUSH collects, uses and protects your information.
        </Text>
      </View>

      <View className="px-5 pt-5">
        {SECTIONS.map((s, i) => (
          <PolicyRow
            key={s.title}
            section={s}
            open={openIndex === i}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpenIndex(openIndex === i ? null : i);
            }}
          />
        ))}

        <InfoBanner icon="shield-checkmark-outline" className="mt-2">
          By using RUSH, you agree to the terms of this Privacy Policy.
        </InfoBanner>
        <Text className="mt-4 text-center text-xs text-muted">Last updated: 1 November 2026</Text>
      </View>
    </Screen>
  );
}
