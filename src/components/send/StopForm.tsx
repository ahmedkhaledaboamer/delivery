import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, isValidPhone, PhoneField, RouteMap, Screen, Sheet, Text, TextField } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useProfile } from "@/api/hooks";
import type { Address } from "@/api/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { setDropoff, setPickup } from "@/store/slices/deliverySlice";

const stripCountry = (phone: string) => phone.replace(/^\+971\s*/, "");

const ADDRESS_ICON: Record<Address["icon"], keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "location-outline",
};

/**
 * Shared body of the pickup (Frame 96/99) and drop-off (Frame 98) screens:
 * map on top, sheet with location + saved addresses, notes and the contact.
 */
export function StopForm({ kind, onContinue }: { kind: "pickup" | "dropoff"; onContinue: () => void }) {
  const dispatch = useAppDispatch();
  const flow = useAppSelector((s) => s.delivery.flow);
  const stop = useAppSelector((s) => (kind === "pickup" ? s.delivery.pickup : s.delivery.dropoff));
  const profile = useProfile();
  const [focused, setFocused] = useState(false);

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
  const locationLabel = isPickup ? (flow === "shopping" ? "Store Location" : "Pickup Location") : "Drop-off Location";
  const notesLabel = isPickup ? "Notes for pickup" : "Notes for drop-off";
  const contactTitle = isPickup
    ? flow === "shopping"
      ? "Store contact"
      : "Sender"
    : flow === "receive"
      ? "Receiver (you)"
      : "Receiver";
  const contactSubtitle =
    flow === "receive" && isPickup ? "Who is sending you the package?" : flow === "receive" ? "Who will receive it at drop-off?" : undefined;

  const showSaved = focused || !stop.address.trim();
  const canContinue = !!stop.address.trim() && !!stop.contact.fullName.trim() && isValidPhone(stop.contact.phone);

  return (
    <Screen edges={["bottom"]}
      background="white"
      footer={<Button title="Continue" disabled={!canContinue} onPress={onContinue} />}
    >
      <RouteMap mode={kind} stepLabel="1 of 7 · Route" height={240} />
      <Sheet>
        <View className="mb-2 flex-row items-center gap-2">
          <Ionicons name="location-outline" size={18} color={colors.brand} />
          <Text className="font-inter-semibold text-sm">{locationLabel}</Text>
        </View>
        <TextField
          value={stop.address}
          onChangeText={(address) => update({ address })}
          placeholder={`Enter ${locationLabel}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          containerClassName={showSaved ? "mb-2" : "mb-4"}
          right={
            stop.address ? (
              <Pressable hitSlop={8} accessibilityLabel="Clear address" onPress={() => update({ address: "" })}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : undefined
          }
        />

        {showSaved && (
          <View className="mb-4 rounded-xl border border-line">
            {profile.isLoading && <ActivityIndicator style={{ paddingVertical: 12 }} color={colors.brand} />}
            {profile.isError && <Text className="px-4 py-3 text-xs text-danger">Couldn't load saved addresses.</Text>}
            {profile.data?.addresses.map((a, i, arr) => (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                onPress={() => {
                  update({ address: a.address });
                  setFocused(false);
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

        <TextField
          label={notesLabel}
          hint="optional"
          showCounter
          maxLength={200}
          multiline
          value={stop.notes}
          onChangeText={(notes) => update({ notes })}
          placeholder="Call on arrival. Hand over at reception."
        />

        <Text className="font-inter-semibold text-base">{contactTitle}</Text>
        {contactSubtitle && <Text className="text-xs text-muted">{contactSubtitle}</Text>}
        <View className="mt-3">
          <TextField
            label="Full name"
            hint="required"
            value={stop.contact.fullName}
            onChangeText={(fullName) => update({ contact: { ...stop.contact, fullName } })}
            placeholder="Enter full name"
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
