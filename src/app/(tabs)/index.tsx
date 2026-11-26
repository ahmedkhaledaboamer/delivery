import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button, GradientText, IconButton, Logo, TAB_BAR_SPACE, Text } from "@/components/ui";
import { useAppSelector } from "@/store";
import { useHasUnreadNotifications } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

/** The two Home variants in the design (car, then scooter) — slow cross-fade between them. */
function HeroBackground() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(fade, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(fade, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade]);
  const fill = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, width: "100%" as const, height: "100%" as const };
  return (
    <>
      <Image source={images.homeBgCar} resizeMode="cover" style={fill} />
      <Animated.Image source={images.homeBgScooter} resizeMode="cover" style={[fill, { opacity: fade }]} />
    </>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-white px-4 py-4 active:opacity-80"
      style={cardShadow}
    >
      <Ionicons name={icon} size={24} color={colors.brand} />
      <View className="flex-1">
        <Text className="font-inter-semibold text-sm">{title}</Text>
        <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
      </View>
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-brand-light">
        <Ionicons name="arrow-forward" size={16} color={colors.brandDark} />
      </View>
    </Pressable>
  );
}

export default function Home() {
  const role = useAppSelector((s) => s.auth.role);
  const language = useAppSelector((s) => s.settings.language);
  const hasUnread = useHasUnreadNotifications();

  const deliverNow = () => router.push(role === "store" ? "/store/create-request" : "/send/service");

  return (
    <View className="flex-1 bg-surface">
      {/* Full-screen hero backgrounds from the design (car / scooter), cross-fading. */}
      <HeroBackground />

      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between px-5 py-3">
            <Logo size="sm" />
            <View className="flex-row items-center gap-2">
              {__DEV__ && (
                // DEV ONLY: list of every screen for comparing with the Figma design. Hidden in release builds.
                <IconButton name="grid-outline" accessibilityLabel="All screens" onPress={() => router.push("/dev-screens")} />
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change language"
                onPress={() => router.push("/account/language")}
                className="h-10 flex-row items-center gap-1 rounded-full border border-line bg-white px-3 active:opacity-70"
              >
                <Text className="text-sm">🇦🇪</Text>
                <Text className="font-inter-medium text-xs">{language === "ar" ? "Ar" : "En"}</Text>
                <Ionicons name="chevron-down" size={12} color={colors.body} />
              </Pressable>
              <IconButton
                name="notifications-outline"
                accessibilityLabel="Notifications"
                badge={hasUnread}
                onPress={() => router.push("/notifications")}
              />
            </View>
          </View>

          <View className="px-5 pb-8 pt-10">
            <Text className="font-inter-bold text-[34px] leading-[40px]">Fast, Safe.</Text>
            <GradientText className="font-inter-bold text-[34px] leading-[40px]">Anywhere</GradientText>
          </View>

          <View className="px-5">
            <View className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-4" style={cardShadow}>
              <View className="flex-1 pr-3">
                <Text className="font-inter-bold text-base">Deliver a Package</Text>
                <Text className="mt-1 text-[11px] leading-4 text-body">
                  Cash On Delivery and Bulk orders are included. Don't worry.
                </Text>
                <Button title="Deliver Now" size="sm" className="mt-3 self-start px-8" onPress={deliverNow} />
              </View>
              <Image source={images.box} resizeMode="contain" style={{ width: 120, height: 92 }} accessibilityIgnoresInvertColors />
            </View>

            <ActionRow
              icon="speedometer-outline"
              title="Track Package"
              subtitle="Real-Time Tracking"
              onPress={() => router.push("/(tabs)/orders")}
            />
            <ActionRow
              icon="time-outline"
              title="Delivery History"
              subtitle="View Your Order"
              onPress={() => router.push("/(tabs)/orders?tab=past")}
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
