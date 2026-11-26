import { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "@/components/ui";
import { images } from "@/constants/images";

/** Same colour as the native splash (app.json) so the hand-off is seamless. */
export const SPLASH_BG = "#140B34";

/** Splash: the scooter rides in from the left, then the APEX AORA wordmark fades in. Moves on to Welcome. */
export default function Splash() {
  const ride = useRef(new Animated.Value(0)).current; // 0 = off-screen left, 1 = centred
  const word = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(ride, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(word, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => router.replace("/onboarding/welcome"), 2000);
    return () => clearTimeout(t);
  }, [ride, word]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: SPLASH_BG }}>
      <StatusBar style="light" />
      {/* soft violet glow behind the logo */}
      <LinearGradient
        colors={["rgba(124,58,237,0.35)", "rgba(20,11,52,0)"]}
        style={{ position: "absolute", width: 420, height: 420, borderRadius: 210 }}
      />
      <Animated.View
        style={{
          opacity: ride,
          transform: [{ translateX: ride.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] }) }],
        }}
      >
        <Logo size="lg" markOnly />
      </Animated.View>
      <Animated.View style={{ opacity: word, marginTop: 8 }}>
        <Image source={images.logoWordmarkLight} resizeMode="contain" style={{ width: 240, height: 240 * (54 / 531) }} />
      </Animated.View>
    </View>
  );
}
