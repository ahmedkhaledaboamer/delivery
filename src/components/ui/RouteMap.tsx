import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { colors } from "@/constants/theme";

// Dubai Marina area — matches the addresses used in the design.
const PICKUP = { latitude: 25.0805, longitude: 55.1403 };
const DROPOFF = { latitude: 25.0921, longitude: 55.1561 };
const ROUTE = [
  PICKUP,
  { latitude: 25.0846, longitude: 55.1449 },
  { latitude: 25.0872, longitude: 55.1512 },
  DROPOFF,
];

type Props = {
  /** "pickup" = only pickup pin, "dropoff" = only dropoff, "route" = both + line + rider. */
  mode: "pickup" | "dropoff" | "route";
  /** Pill next to the back button, e.g. "1 of 7 · Route". */
  stepLabel?: string;
  height?: number;
  showBack?: boolean;
};

function Pin({ label }: { label: string }) {
  return (
    <View className="items-center">
      <View className="mb-1 rounded-full border border-brand bg-white px-3 py-1">
        <Text className="font-inter-semibold text-[11px] text-brand-dark">{label}</Text>
      </View>
      <Ionicons name="location" size={36} color={colors.brand} />
    </View>
  );
}

/** Map block at the top of the route screens (pickup, dropoff, confirm route, tracking). */
export function RouteMap({ mode, stepLabel, height = 260, showBack = true }: Props) {
  // Map is drawn under the status bar; push the back button below it.
  const insets = useSafeAreaInsets();
  const center = mode === "dropoff" ? DROPOFF : mode === "pickup" ? PICKUP : { latitude: 25.0863, longitude: 55.1482 };
  return (
    <View style={{ height: height + insets.top }} className="w-full overflow-hidden">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{ ...center, latitudeDelta: mode === "route" ? 0.03 : 0.015, longitudeDelta: mode === "route" ? 0.03 : 0.015 }}
        toolbarEnabled={false}
      >
        <Polyline coordinates={ROUTE} strokeColor={colors.brand} strokeWidth={4} />
        {(mode === "pickup" || mode === "route") && (
          <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 1 }}>
            <Pin label="Pickup" />
          </Marker>
        )}
        {(mode === "dropoff" || mode === "route") && (
          <Marker coordinate={DROPOFF} anchor={{ x: 0.5, y: 1 }}>
            <Pin label="Drop off" />
          </Marker>
        )}
        {mode === "route" && (
          <Marker coordinate={ROUTE[2]}>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
              <Ionicons name="bicycle" size={20} color={colors.white} />
            </View>
          </Marker>
        )}
      </MapView>
      {showBack && (
        <View style={{ top: insets.top + 12 }} className="absolute left-4 flex-row items-center gap-2">
          <IconButton name="arrow-back" accessibilityLabel="Back" onPress={() => router.back()} />
          {stepLabel && (
            <View className="rounded-full bg-white px-3 py-2">
              <Text className="font-inter-medium text-xs">{stepLabel}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
