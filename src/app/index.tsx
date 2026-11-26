import { Redirect } from "expo-router";
import { useAppSelector } from "@/store";

/** Entry: first launch -> splash/onboarding, signed in or guest -> home, otherwise -> sign in. */
export default function Index() {
  const { hasOnboarded, user, isGuest } = useAppSelector((s) => s.auth);
  if (!hasOnboarded) return <Redirect href="/onboarding/splash" />;
  if (user || isGuest) return <Redirect href="/(tabs)" />;
  return <Redirect href="/auth/sign-in" />;
}
