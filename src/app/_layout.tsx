import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold } from "@expo-google-fonts/cairo";
import { persistor, store } from "@/store";
import { queryClient } from "@/api/client";
import { applyLanguageDirection } from "@/i18n";

SplashScreen.preventAutoHideAsync();

/** After saved state loads, make sure the layout direction matches the saved language (Arabic = RTL). */
function useDirectionSync(rehydrated: boolean) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!rehydrated) return;
    applyLanguageDirection(store.getState().settings.language).then((reloading) => {
      if (!reloading) setReady(true);
    });
  }, [rehydrated]);
  return ready;
}

function AppShell({ rehydrated }: { rehydrated: boolean }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });
  const directionReady = useDirectionSync(rehydrated);
  const ready = fontsLoaded && directionReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAFAFF" }, animation: "slide_from_right" }}>
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="driver" options={{ animation: "fade" }} />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        {(rehydrated) => (
          <QueryClientProvider client={queryClient}>
            <AppShell rehydrated={rehydrated} />
          </QueryClientProvider>
        )}
      </PersistGate>
    </Provider>
  );
}
