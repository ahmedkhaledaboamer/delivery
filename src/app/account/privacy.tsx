import { useState } from "react";
import { LayoutAnimation, Pressable, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GradientIcon, Header, InfoBanner, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";

type Section = {
  icon: { set: "ion"; name: keyof typeof Ionicons.glyphMap } | { set: "mci"; name: keyof typeof MaterialCommunityIcons.glyphMap };
  title: string;
  subtitle: string;
  body: string;
};

const SECTIONS: Section[] = [
  {
    icon: { set: "ion", name: "shield-checkmark-outline" },
    title: "Information We Collect",
    subtitle: "The personal and usage information we may collect when you use APEX AORA.",
    body:
      "We collect your name, mobile number, email address, saved addresses, pickup and drop-off details, payment " +
      "confirmations and basic device information. Location is collected only while you book or track a delivery.",
  },
  {
    icon: { set: "ion", name: "layers-outline" },
    title: "How We Use Your Information",
    subtitle: "To provide, improve and personalize our services.",
    body:
      "Your information is used to create and fulfil deliveries, match you with riders, send order updates, " +
      "process payments and refunds, provide support and improve the app.",
  },
  {
    icon: { set: "ion", name: "lock-closed-outline" },
    title: "Data Security",
    subtitle: "How we keep your information safe and protected.",
    body:
      "Data is encrypted in transit and stored on secured servers. Access is limited to staff and partners who need " +
      "it to deliver your order, and we never store your full card details.",
  },
  {
    icon: { set: "ion", name: "people-outline" },
    title: "Information Sharing",
    subtitle: "When and with whom we may share your information.",
    body:
      "We share only what's needed: riders see pickup and drop-off contacts, payment providers process payments, and " +
      "we may disclose data when required by law. We never sell your personal data.",
  },
  {
    icon: { set: "mci", name: "cookie-outline" },
    title: "Cookies",
    subtitle: "How we use cookies to enhance your experience.",
    body:
      "Our app and website use cookies and similar technologies to keep you signed in, remember preferences and " +
      "understand how features are used. You can manage cookies in your device or browser settings.",
  },
];

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

function SectionIcon({ icon }: { icon: Section["icon"] }) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-lighter">
      {icon.set === "ion" ? (
        <Ionicons name={icon.name} size={20} color={colors.brandDark} />
      ) : (
        <MaterialCommunityIcons name={icon.name} size={20} color={colors.brandDark} />
      )}
    </View>
  );
}

function PolicyRow({ section, open, onToggle }: { section: Section; open: boolean; onToggle: () => void }) {
  return (
    <View className="mb-3 rounded-2xl border border-line bg-white" style={cardShadow}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        className="flex-row items-center gap-3 px-4 py-3.5"
      >
        <SectionIcon icon={section.icon} />
        <View className="flex-1">
          <Text className="font-inter-semibold text-sm">{section.title}</Text>
          <Text className="mt-0.5 text-[11px] leading-4 text-body">{section.subtitle}</Text>
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

/** Shield + lock in front of a document with a check, on a soft violet blob (stand-in for the Figma art). */
function ShieldIllustration() {
  return (
    <View style={{ width: 230, height: 150 }} className="items-center justify-center">
      <View className="absolute bottom-2 h-24 w-56 rounded-[60px] bg-brand-light opacity-70" />
      {/* box on the left */}
      <View className="absolute bottom-5 left-6 h-12 w-14 rounded-lg bg-brand-light" style={{ transform: [{ rotate: "-6deg" }] }} />
      {/* document on the right */}
      <View
        className="absolute right-8 top-10 h-24 w-20 rounded-lg bg-white px-2.5 pt-4"
        style={{ transform: [{ rotate: "8deg" }], ...cardShadow }}
      >
        <View className="h-1.5 w-12 rounded-full bg-line" />
        <View className="mt-2 h-1.5 w-9 rounded-full bg-line" />
        <View className="mt-2 h-1.5 w-11 rounded-full bg-line" />
        <View className="absolute -bottom-2 -right-2 h-7 w-7 items-center justify-center rounded-full bg-brand">
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      </View>
      {/* shield with lock */}
      <View className="items-center justify-center">
        <GradientIcon name="shield" size={112} />
        <View className="absolute">
          <Ionicons name="lock-closed" size={40} color={colors.white} />
        </View>
      </View>
    </View>
  );
}

/** Privacy Policy — matches the design, in APEX AORA colours. */
export default function PrivacyScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Screen>
      <Header inlineTitle="Privacy Policy" actions />

      <View className="items-center px-5 pt-1">
        <ShieldIllustration />
        <Text className="mt-3 font-inter-bold text-[26px] text-brand-dark">Privacy Policy</Text>
        <Text className="mt-1.5 px-6 text-center text-sm leading-5 text-body">
          Learn how APEX AORA collects, uses and protects your information.
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

        <InfoBanner className="mt-2">By using APEX AORA, you agree to the terms of this Privacy Policy.</InfoBanner>
        <Text className="mt-4 text-center text-xs text-muted">Last updated: 3 November 2026</Text>
      </View>
    </Screen>
  );
}
