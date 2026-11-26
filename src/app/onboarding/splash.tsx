import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Logo } from "@/components/ui";
import { RouteLine } from "@/components/onboarding";

/** Splash: small R mark grows into the full RUSH logo, then moves on to Welcome. */
export default function Splash() {
  const scale = useRef(new Animated.Value(0.6)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const fullOpacity = useRef(new Animated.Value(0)).current;
  const routeOpacity = useRef(new Animated.Value(1)).current;
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 550, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(routeOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setShowFull(true);
      Animated.timing(fullOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    });
    const t = setTimeout(() => router.replace("/onboarding/welcome"), 1800);
    return () => clearTimeout(t);
  }, [fullOpacity, markOpacity, routeOpacity, scale]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center">
        {/* TODO: replace with Figma illustration (logo mark / full logo assets) */}
        {!showFull ? (
          <Animated.View style={{ opacity: markOpacity, transform: [{ scale }] }}>
            <Logo size="lg" markOnly />
          </Animated.View>
        ) : (
          <Animated.View style={{ opacity: fullOpacity }}>
            <Logo size="lg" />
          </Animated.View>
        )}
      </View>
      <Animated.View style={{ opacity: routeOpacity }} className="px-8 pb-16">
        <RouteLine height={90} />
      </Animated.View>
    </SafeAreaView>
  );
}
