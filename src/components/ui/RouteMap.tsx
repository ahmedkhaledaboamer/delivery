import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { useT } from "@/i18n";
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

type LatLng = { latitude: number; longitude: number };

type Props = {
  /** "pickup" = only pickup pin, "dropoff" = only dropoff, "route" = both + line + rider. */
  mode: "pickup" | "dropoff" | "route";
  /** Pill next to the back button, e.g. "1 of 7 · Route". */
  stepLabel?: string;
  height?: number;
  showBack?: boolean;
  /**
   * Real points. When any of these is given the map shows them instead of the demo route
   * (pins where given, a line from pickup to each drop-off, camera fitted to all points).
   */
  pickup?: LatLng;
  dropoff?: LatLng;
  rider?: LatLng;
  /** Several drop-offs (store orders), numbered #1, #2… */
  stops?: LatLng[];
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

/** Gently curved line between two points (looks like a route, not a ruler line). */
function curve(a: LatLng, b: LatLng, steps = 16): LatLng[] {
  const dLat = b.latitude - a.latitude;
  const dLng = b.longitude - a.longitude;
  // Control point: midpoint pushed sideways by 12% of the length.
  const c = { latitude: a.latitude + dLat / 2 - dLng * 0.12, longitude: a.longitude + dLng / 2 + dLat * 0.12 };
  const out: LatLng[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      latitude: u * u * a.latitude + 2 * u * t * c.latitude + t * t * b.latitude,
      longitude: u * u * a.longitude + 2 * u * t * c.longitude + t * t * b.longitude,
    });
  }
  return out;
}

const keyOf = (pts: LatLng[]) => pts.map((p) => `${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`).join("|");

/** Map block at the top of the route screens (pickup, dropoff, confirm route, tracking). */
export function RouteMap({ mode, stepLabel, height = 260, showBack = true, pickup, dropoff, rider, stops }: Props) {
  // Map is drawn under the status bar; push the back button below it.
  const insets = useSafeAreaInsets();
  const t = useT();
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);

  const drops = useMemo(() => [...(dropoff ? [dropoff] : []), ...(stops ?? [])], [dropoff, stops]);
  const custom = !!pickup || drops.length > 0 || !!rider;
  const points = useMemo(
    () => [...(pickup ? [pickup] : []), ...drops, ...(rider ? [rider] : [])],
    [pickup, drops, rider],
  );
  const pointsKey = keyOf(points);

  const fit = useCallback(() => {
    const map = mapRef.current;
    if (!map || !custom || points.length === 0) return;
    if (points.length === 1) {
      map.animateToRegion({ ...points[0], latitudeDelta: 0.015, longitudeDelta: 0.015 }, 300);
    } else {
      map.fitToCoordinates(points, {
        edgePadding: { top: insets.top + 80, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, custom, insets.top]);

  useEffect(() => {
    if (ready) fit();
  }, [ready, fit]);

  const center = custom
    ? (points[0] ?? PICKUP)
    : mode === "dropoff"
      ? DROPOFF
      : mode === "pickup"
        ? PICKUP
        : { latitude: 25.0863, longitude: 55.1482 };
  const delta = custom || mode !== "route" ? 0.015 : 0.03;

  return (
    <View style={{ height: height + insets.top }} className="w-full overflow-hidden">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{ ...center, latitudeDelta: delta, longitudeDelta: delta }}
        toolbarEnabled={false}
        onMapReady={() => setReady(true)}
      >
        {custom ? (
          <>
            {pickup && drops.map((d, i) => <Polyline key={`line-${i}`} coordinates={curve(pickup, d)} strokeColor={colors.brand} strokeWidth={4} />)}
            {pickup && (
              <Marker coordinate={pickup} anchor={{ x: 0.5, y: 1 }}>
                <Pin label={t("common.pickup")} />
              </Marker>
            )}
            {drops.map((d, i) => (
              <Marker key={`drop-${i}`} coordinate={d} anchor={{ x: 0.5, y: 1 }}>
                <Pin label={stops && stops.length > 0 && !dropoff ? `#${i + 1}` : t("common.dropoff")} />
              </Marker>
            ))}
            {rider && (
              <Marker coordinate={rider}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
                  <Ionicons name="bicycle" size={20} color={colors.white} />
                </View>
              </Marker>
            )}
          </>
        ) : (
          <>
            <Polyline coordinates={ROUTE} strokeColor={colors.brand} strokeWidth={4} />
            {(mode === "pickup" || mode === "route") && (
              <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 1 }}>
                <Pin label={t("common.pickup")} />
              </Marker>
            )}
            {(mode === "dropoff" || mode === "route") && (
              <Marker coordinate={DROPOFF} anchor={{ x: 0.5, y: 1 }}>
                <Pin label={t("common.dropoff")} />
              </Marker>
            )}
            {mode === "route" && (
              <Marker coordinate={ROUTE[2]}>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-ink">
                  <Ionicons name="bicycle" size={20} color={colors.white} />
                </View>
              </Marker>
            )}
          </>
        )}
      </MapView>
      {showBack && (
        <View style={{ top: insets.top + 12 }} className="absolute left-4 flex-row items-center gap-2">
          <IconButton name="arrow-back" accessibilityLabel={t("common.back")} onPress={() => router.back()} />
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
