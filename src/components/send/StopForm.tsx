import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, DirIcon, isValidPhone, PhoneField, RouteMap, Screen, Sheet, Text, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useProfile } from "@/api/hooks";
import type { Address } from "@/api/types";
import { useT } from "@/i18n";
import { coordsOf, LatLng } from "@/lib/geo";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDropoff, setPickup } from "@/store/slices/deliverySlice";

const stripCountry = (phone: string) => phone.replace(/^\+971\s*/, "");

const ADDRESS_ICON: Record<Address["icon"], keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "location-outline",
};

/**
 * Demo coordinates for saved addresses (the profile doesn't store coordinates yet).
 * TODO: save latitude/longitude with each address once the backend supports it.
 */
export const SAVED_ADDRESS_COORDS: Record<Address["icon"], LatLng> = {
  home: { latitude: 25.1972, longitude: 55.2744 }, // Downtown Dubai
  work: { latitude: 25.0805, longitude: 55.1403 }, // Dubai Marina
  other: { latitude: 25.0693, longitude: 55.1413 }, // JLT
};

/**
 * Shared body of the pickup (Frame 96/99) and drop-off (Frame 98) screens:
 * map on top, sheet with location (opens the map picker) + saved addresses, notes and the contact.
 */
export function StopForm({ kind, onContinue }: { kind: "pickup" | "dropoff"; onContinue: () => void }) {
  const t = useT();
  const dispatch = useAppDispatch();
  const flow = useAppSelector((s) => s.delivery.flow);
  const stop = useAppSelector((s) => (kind === "pickup" ? s.delivery.pickup : s.delivery.dropoff));
  const otherStop = useAppSelector((s) => (kind === "pickup" ? s.delivery.dropoff : s.delivery.pickup));
  const profile = useProfile();
  const [savedOpen, setSavedOpen] = useState(false);

  const update = (patch: Parameters<typeof setPickup>[0]) =>
    dispatch(kind === "pickup" ? setPickup(patch) : setDropoff(patch));

  // The user is the sender when sending / shopping, and the receiver when receiving: prefill their details.
  const isMe = kind === "pickup" ? flow === "send" : flow === "receive" || flow === "shopping";
  useEffect(() => {
    if (!isMe || !profile.data) return;
    if (!stop.contact.fullName && !stop.contact.phone) {
      update({ contact: { fullName: profile.data.name, phone: stripCountry(profile.data.phone) } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMe, profile.data]);

  const isPickup = kind === "pickup";
  const locationLabel = isPickup
    ? flow === "shopping"
      ? t("location.storeLocation")
      : t("location.pickupLocation")
    : t("location.dropoffLocation");
  const notesLabel = isPickup ? t("location.notesPickup") : t("location.notesDropoff");
  const contactTitle = isPickup
    ? flow === "shopping"
      ? t("location.storeContact")
      : t("location.sender")
    : flow === "receive"
      ? t("location.receiverYou")
      : t("location.receiver");
  const contactSubtitle =
    flow === "receive" && isPickup
      ? t("location.whoSends")
      : flow === "receive"
        ? t("location.whoReceives")
        : undefined;

  const hasAddress = !!stop.address.trim();
  const showSaved = savedOpen || !hasAddress;
  const canContinue = hasAddress && !!stop.contact.fullName.trim() && isValidPhone(stop.contact.phone);

  const here = coordsOf(stop);
  const there = coordsOf(otherStop);

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title={t("common.continue")} disabled={!canContinue} onPress={onContinue} />}
    >
      <RouteMap
        mode={kind}
        stepLabel={t("location.stepRoute1")}
        height={240}
        pickup={isPickup ? here : there}
        dropoff={isPickup ? undefined : here}
      />
      <Sheet>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="location-outline" size={18} color={colors.brand} />
          <Text className="font-inter-semibold text-sm">{locationLabel}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locationLabel}
          onPress={() => router.push(`/location-picker?target=${kind}`)}
          className="mb-2 min-h-[56px] flex-row items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 active:bg-brand-lighter"
        >
          <Ionicons name="map-outline" size={18} color={colors.brand} />
          <View className="flex-1">
            <Text className={`text-sm ${hasAddress ? "font-inter-medium" : "text-muted"}`} numberOfLines={2}>
              {hasAddress ? stop.address : t("location.chooseOnMap")}
            </Text>
            {hasAddress && !here && <Text className="mt-0.5 text-[11px] text-muted">{t("location.notOnMap")}</Text>}
          </View>
          <DirIcon name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>

        {hasAddress && (
          <Pressable hitSlop={6} onPress={() => setSavedOpen((o) => !o)} className="mb-2 self-start">
            <Text className="font-inter-medium text-xs text-brand underline">
              {savedOpen ? t("location.hideSaved") : t("location.useSaved")}
            </Text>
          </Pressable>
        )}

        {showSaved && (
          <View className="mb-4 rounded-xl border border-line">
            {profile.isLoading && <ActivityIndicator style={{ paddingVertical: 12 }} color={colors.brand} />}
            {profile.isError && <Text className="px-4 py-3 text-xs text-danger">{t("location.savedError")}</Text>}
            {profile.data?.addresses.map((a, i, arr) => (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                onPress={() => {
                  update({ address: a.address, ...SAVED_ADDRESS_COORDS[a.icon] });
                  setSavedOpen(false);
                }}
                className={`flex-row items-center gap-3 px-4 py-3 active:bg-brand-lighter ${i < arr.length - 1 ? "border-b border-line" : ""}`}
              >
                <View className="h-8 w-8 items-center justify-center rounded-lg bg-brand-lighter">
                  <Ionicons name={ADDRESS_ICON[a.icon]} size={16} color={colors.brand} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-medium text-sm">{a.label}</Text>
                  <Text className="text-[11px] text-muted" numberOfLines={1}>
                    {a.address}
                  </Text>
                </View>
                {i === 0 && <Ionicons name="bookmark-outline" size={16} color={colors.brand} />}
              </Pressable>
            ))}
          </View>
        )}
        {!showSaved && <View className="mb-2" />}

        <TextField
          label={notesLabel}
          hint="optional"
          showCounter
          maxLength={200}
          multiline
          value={stop.notes}
          onChangeText={(notes) => update({ notes })}
          placeholder={t("location.notesPlaceholder")}
        />

        <Text className="font-inter-semibold text-base">{contactTitle}</Text>
        {contactSubtitle && <Text className="text-xs text-muted">{contactSubtitle}</Text>}
        <View className="mt-3">
          <TextField
            label={t("common.fullName")}
            hint="required"
            value={stop.contact.fullName}
            onChangeText={(fullName) => update({ contact: { ...stop.contact, fullName } })}
            placeholder={t("location.fullNamePlaceholder")}
            autoCapitalize="words"
            textContentType="name"
          />
          <PhoneField
            hint="required"
            value={stop.contact.phone}
            onChangeText={(phone) => update({ contact: { ...stop.contact, phone } })}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
