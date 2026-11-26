import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header, Logo, Screen, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

type IconName = keyof typeof Ionicons.glyphMap;

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: "flash-outline", label: "Fast\nDelivery" },
  { icon: "shield-checkmark-outline", label: "Safe\n& Secure" },
  { icon: "headset-outline", label: "Dedicated\nSupport" },
];

const WHY = ["On-time and reliable delivery", "Real-time order tracking", "A smooth and secure experience"];

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 };

function InfoCard({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View className="mb-3 flex-row items-center gap-4 rounded-3xl bg-white p-4" style={cardShadow}>
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-lighter">
        <Ionicons name={icon} size={26} color={colors.brand} />
      </View>
      <View className="flex-1">
        <Text className="font-inter-bold text-lg text-brand-dark">{title}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-body">{body}</Text>
      </View>
    </View>
  );
}

/** About RUSH — matches design/about-reference.png. */
export default function AboutScreen() {
  return (
    <Screen>
      <Header inlineTitle="About RUSH" right={<Logo size="sm" />} />

      {/* Hero */}
      <View className="mt-2 flex-row items-center px-5">
        <View className="flex-1 pr-2">
          <Text className="font-inter-bold text-[32px] text-ink">About RUSH</Text>
          <Text className="mt-2 text-sm leading-6 text-body">A fast, reliable and convenient delivery service across the UAE.</Text>
          <View className="mt-3 h-1.5 w-14 rounded-full bg-brand" />
        </View>
        <View style={{ width: 150, height: 130 }} className="items-center justify-center">
          <View className="absolute h-20 w-36 rounded-full border-4 border-brand-accent opacity-50" style={{ transform: [{ rotate: "-12deg" }], top: 56 }} />
          <Image source={images.box} resizeMode="contain" style={{ width: 130, height: 96, marginTop: 24 }} />
          <View className="absolute top-0">
            <Ionicons name="location" size={42} color={colors.brandAccent} />
          </View>
        </View>
      </View>

      {/* Feature strip */}
      <View className="mx-5 mt-6 flex-row rounded-3xl bg-brand-lighter py-5">
        {FEATURES.map((f, i) => (
          <View key={f.icon} className={`flex-1 items-center ${i > 0 ? "border-l border-brand-light" : ""}`}>
            <Ionicons name={f.icon} size={30} color={colors.brand} />
            <Text className="mt-2 text-center font-inter-semibold text-sm leading-5">{f.label}</Text>
          </View>
        ))}
      </View>

      <View className="mx-5 mt-4">
        <InfoCard icon="locate-outline" title="Our Mission" body="To make delivery simple, fast, and reliable for everyone in the UAE." />
        <InfoCard icon="eye-outline" title="Our Vision" body="To be the most trusted and preferred delivery service in the region." />
      </View>

      {/* Why choose */}
      <View className="mx-5 mt-3 flex-row items-center rounded-3xl bg-brand-lighter p-4">
        <Image source={images.trophy} resizeMode="contain" style={{ width: 110, height: 90 }} />
        <View className="mx-3 h-20 w-px bg-brand-light" />
        <View className="flex-1">
          <Text className="mb-2 font-inter-bold text-base">Why Choose RUSH?</Text>
          {WHY.map((w) => (
            <View key={w} className="mb-1.5 flex-row items-center gap-2">
              <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-light">
                <Ionicons name="checkmark" size={12} color={colors.brandDark} />
              </View>
              <Text className="flex-1 text-xs text-body">{w}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Green city skyline. TODO: replace with the Figma skyline image when exported. */}
      <LinearGradient colors={[colors.surface, colors.brandLighter]} style={{ marginTop: 28, height: 120, justifyContent: "flex-end" }}>
        <View className="flex-row items-end justify-center gap-1 px-5">
          {[30, 46, 38, 64, 52, 110, 58, 44, 70, 36, 28].map((h, i) => (
            <View
              key={i}
              style={{ height: h }}
              className={`${i === 5 ? "w-3" : "w-6"} rounded-t-md ${i % 2 ? "bg-brand-accent" : "bg-brand"} opacity-40`}
            />
          ))}
        </View>
        <View className="h-1 bg-brand opacity-40" />
      </LinearGradient>
    </Screen>
  );
}
