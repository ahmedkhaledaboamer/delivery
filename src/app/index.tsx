import { Redirect } from "expo-router";
import { useAppSelector } from "@/store";

/**
 * Entry: first launch -> splash/onboarding; signed-in driver -> driver app;
 * signed-in customer/store or guest -> home; otherwise -> sign in.
 */
export default function Index() {
  const { hasOnboarded, user, isGuest } = useAppSelector((s) => s.auth);
  if (!hasOnboarded) return <Redirect href="/onboarding/splash" />;
  if (user?.role === "driver") return <Redirect href="/driver" />;
  if (user || isGuest) return <Redirect href="/(tabs)" />;
  return <Redirect href="/auth/sign-in" />;
}
