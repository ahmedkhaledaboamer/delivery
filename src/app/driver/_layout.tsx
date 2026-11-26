import { Stack } from "expo-router";

/**
 * Driver (rider) app: the tab screens live in the (tabs) group, the active-job screen is pushed on top.
 * (A hidden tab can't be opened in this expo-router version — it redirects to the first tab — so the job
 * screen sits in this stack instead of using `href: null`.)
 */
export default function DriverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAFAFF" }, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
      <Stack.Screen name="job/[id]" />
    </Stack>
  );
}
