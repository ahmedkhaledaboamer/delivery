import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Keyboard, Linking, Pressable, ScrollView, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, IconButton, Text, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useLanguage, useT } from "@/i18n";
import { Place, useDebouncedValue, usePlaceSearch, useReverseGeocode } from "@/api/places";
import { coordsOf, DUBAI_CENTER, LatLng, regionAround } from "@/lib/geo";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDropoff, setPickup, Stop, updateStoreOrder } from "@/store/slices/deliverySlice";

type Target = { kind: "pickup" } | { kind: "dropoff" } | { kind: "store"; index: number };

function parseTarget(raw: string | undefined): Target {
  if (raw === "pickup") return { kind: "pickup" };
  const m = /^store-(\d)$/.exec(raw ?? "");
  if (m) return { kind: "store", index: Number(m[1]) };
  return { kind: "dropoff" };
}

const PIN_SIZE = 46;
const near = (a: LatLng, b: LatLng) =>
  Math.abs(a.latitude - b.latitude) < 1e-4 && Math.abs(a.longitude - b.longitude) < 1e-4;

/**
 * Full-screen map with a fixed centre pin. Route: /location-picker?target=pickup|dropoff|store-0..3
 * Writes { address, latitude, longitude } into the delivery draft and goes back.
 */
export default function LocationPickerScreen() {
  const t = useT();
  const lang = useLanguage();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ target?: string }>();
  const target = useMemo(() => parseTarget(params.target), [params.target]);

  const current: Stop | undefined = useAppSelector((s) =>
    target.kind === "pickup"
      ? s.delivery.pickup
      : target.kind === "dropoff"
        ? s.delivery.dropoff
        : s.delivery.storeOrders[target.index]?.dropoff,
  );
  const pickupCoords = useAppSelector((s) => coordsOf(s.delivery.pickup));

  // Start at the saved point, else near the pickup (for a drop-off), else Dubai.
  const initial = useMemo<LatLng>(
    () => coordsOf(current) ?? (target.kind !== "pickup" ? pickupCoords : undefined) ?? DUBAI_CENTER,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const hasInitial = !!coordsOf(current);

  const mapRef = useRef<MapView>(null);
  const [center, setCenter] = useState<LatLng>(initial);
  const [moving, setMoving] = useState(false);
  const [picked, setPicked] = useState<{ point: LatLng; address: string } | null>(
    hasInitial && current?.address ? { point: initial, address: current.address } : null,
  );
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [locating, setLocating] = useState(false);

  // Pin lifts while the map is being dragged.
  const [lift] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(lift, { toValue: moving ? 1 : 0, useNativeDriver: true, friction: 6 }).start();
  }, [moving, lift]);

  const showPicked = !!picked && near(picked.point, center);
  const reverse = useReverseGeocode(moving || showPicked ? null : center, lang);
  const address = showPicked ? picked!.address : reverse.data;
  const addressLoading = moving || (!showPicked && reverse.isFetching && !reverse.data);

  const debounced = useDebouncedValue(query, 500);
  const search = usePlaceSearch(debounced, lang);
  const showSuggestions = searchFocused && query.trim().length >= 3;

  const moveTo = (p: LatLng, delta = 0.006) => mapRef.current?.animateToRegion(regionAround(p, delta), 500);

  // If the user already allowed location and nothing is saved, start at their position.
  useEffect(() => {
    if (hasInitial) return;
    let cancelled = false;
    (async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (!perm.granted) return;
        const last = await Location.getLastKnownPositionAsync();
        if (last && !cancelled) moveTo({ latitude: last.coords.latitude, longitude: last.coords.longitude });
      } catch {
        // ignore — the user can still search or drag the map
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToMyLocation = async () => {
    Keyboard.dismiss();
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t("location.permissionTitle"), t("location.permissionBody"), [
          { text: t("common.cancel"), style: "cancel" },
          ...(perm.canAskAgain ? [] : [{ text: t("location.openSettings"), onPress: () => Linking.openSettings() }]),
        ]);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPicked(null);
      moveTo({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }, 0.005);
    } catch {
      Alert.alert(t("location.locationErrorTitle"), t("location.locationError"));
    } finally {
      setLocating(false);
    }
  };

  const choosePlace = (p: Place) => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setQuery("");
    setPicked({ point: { latitude: p.latitude, longitude: p.longitude }, address: p.address });
    moveTo(p);
  };

  const onRegionChangeComplete = (r: Region) => {
    setMoving(false);
    setCenter({ latitude: r.latitude, longitude: r.longitude });
  };

  const fallbackAddress = t("location.pinnedAt", { lat: center.latitude.toFixed(5), lng: center.longitude.toFixed(5) });

  const confirm = () => {
    const value = { address: address || fallbackAddress, latitude: center.latitude, longitude: center.longitude };
    if (target.kind === "pickup") dispatch(setPickup(value));
    else if (target.kind === "dropoff") dispatch(setDropoff(value));
    else dispatch(updateStoreOrder({ index: target.index, dropoff: value }));
    router.back();
  };

  const title =
    target.kind === "pickup"
      ? t("location.pickerTitlePickup")
      : target.kind === "dropoff"
        ? t("location.pickerTitleDropoff")
        : t("location.pickerTitleStore", { n: target.index + 1 });

  const pinTranslate = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const shadowScale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={regionAround(initial, hasInitial ? 0.006 : 0.05)}
          toolbarEnabled={false}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChange={(_r, details) => {
            if (!moving && (details?.isGesture ?? true)) setMoving(true);
          }}
          onRegionChangeComplete={onRegionChangeComplete}
          onPanDrag={() => {
            if (searchFocused) Keyboard.dismiss();
          }}
        />

        {/* Fixed centre pin: its tip marks the map centre. */}
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <Animated.View
            style={{ position: "absolute", width: 14, height: 6, borderRadius: 7, backgroundColor: "rgba(30,27,75,0.25)", transform: [{ scaleX: shadowScale }] }}
          />
          <Animated.View style={{ marginBottom: PIN_SIZE, transform: [{ translateY: pinTranslate }] }}>
            <Ionicons name="location" size={PIN_SIZE} color={colors.brand} />
          </Animated.View>
        </View>

        {/* Top bar: back + search + suggestions */}
        <View style={{ paddingTop: insets.top + 8 }} className="absolute inset-x-0 top-0 px-4">
          <View className="flex-row items-center gap-2">
            <IconButton name="arrow-back" accessibilityLabel={t("common.back")} onPress={() => router.back()} className="h-12 w-12" />
            <TextField
              containerClassName="mb-0 flex-1"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={t("location.searchPlaceholder")}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel={t("location.searchPlaceholder")}
              left={<Ionicons name="search" size={18} color={colors.muted} style={{ marginEnd: 8 }} />}
              right={
                query ? (
                  <Pressable hitSlop={8} accessibilityLabel={t("location.clearSearch")} onPress={() => setQuery("")}>
                    <Ionicons name="close-circle" size={18} color={colors.muted} />
                  </Pressable>
                ) : undefined
              }
            />
          </View>

          {showSuggestions && (
            <View className="mt-2 max-h-72 overflow-hidden rounded-xl border border-line bg-white">
              {(search.isFetching || debounced !== query) && !search.data ? (
                <ActivityIndicator style={{ paddingVertical: 14 }} color={colors.brand} />
              ) : search.isError ? (
                <Text className="px-4 py-3 text-xs text-danger">{t("location.searchError")}</Text>
              ) : search.data && search.data.length === 0 ? (
                <Text className="px-4 py-3 text-xs text-muted">{t("location.noResults")}</Text>
              ) : (
                <ScrollView keyboardShouldPersistTaps="handled">
                  {search.data?.map((p, i, arr) => (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      onPress={() => choosePlace(p)}
                      className={`flex-row items-center gap-3 px-4 py-3 active:bg-brand-lighter ${i < arr.length - 1 ? "border-b border-line" : ""}`}
                    >
                      <Ionicons name="location-outline" size={18} color={colors.brand} />
                      <View className="flex-1">
                        <Text className="font-inter-medium text-sm" numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text className="text-[11px] text-muted" numberOfLines={1}>
                          {p.address}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>

        <View className="absolute bottom-4 left-0 right-0 items-center">
          <Pressable
            accessibilityRole="button"
            onPress={goToMyLocation}
            disabled={locating}
            className="flex-row items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 active:opacity-70"
          >
            {locating ? <ActivityIndicator size="small" color={colors.brand} /> : <Ionicons name="locate" size={18} color={colors.brand} />}
            <Text className="font-inter-medium text-xs text-brand-dark">
              {locating ? t("location.locating") : t("location.useMyLocation")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom card: address + confirm */}
      <View style={{ paddingBottom: insets.bottom + 12 }} className="-mt-4 rounded-t-3xl bg-white px-5 pt-3">
        <View className="mb-3 h-1 w-12 self-center rounded-full bg-line" />
        <Text className="font-inter-semibold text-[11px] uppercase tracking-wide text-brand">{title}</Text>
        <View className="mt-2 min-h-[56px] flex-row items-center gap-3 rounded-xl bg-brand-lighter px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-light">
            <Ionicons name="location" size={18} color={colors.brand} />
          </View>
          <View className="flex-1">
            {addressLoading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={colors.brand} />
                <Text className="text-xs text-muted">{t("location.findingAddress")}</Text>
              </View>
            ) : (
              <>
                <Text className="font-inter-medium text-sm" numberOfLines={2}>
                  {address || fallbackAddress}
                </Text>
                {!address && reverse.isError && <Text className="mt-0.5 text-[11px] text-muted">{t("location.addressUnavailable")}</Text>}
              </>
            )}
          </View>
        </View>
        <Text className="mt-2 text-[11px] text-muted">{t("location.moveMapHint")}</Text>
        <Button className="mt-3" title={t("location.confirmLocation")} disabled={moving} onPress={confirm} />
      </View>
    </View>
  );
}
