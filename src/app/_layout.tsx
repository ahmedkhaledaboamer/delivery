import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { store } from "@/store";
import { queryClient } from "@/api/client";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAFAFF" }, animation: "slide_from_right" }}>
            <Stack.Screen name="index" options={{ animation: "none" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
