import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Screen, Text, TextField } from "@/components/ui";
import { TermsAgreement } from "@/components/delivery";
import { FlowHeader, FlowSheet, PREFERENCES } from "@/components/send";
import { brandGradient, colors } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setDeliveryNotes,
  setPackageContents,
  togglePreference,
} from "@/store/slices/deliverySlice";


/** Package and notes (4 of 7). Contents are hidden for personal shopping (7.png). */
export default function PackageScreen() {
  const dispatch = useAppDispatch();
  const { flow, packageContents, preferences, deliveryNotes, agreedToTerms } = useAppSelector((s) => s.delivery);
  const isShopping = flow === "shopping";
  const canContinue = agreedToTerms && (isShopping || !!packageContents.trim());

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title="Continue" disabled={!canContinue} onPress={() => router.push("/send/review")} />}
    >
      <FlowHeader step="4 of 7 · Package" title="What are you sending?" subtitle="A few details help us handle it with care." />
      <FlowSheet>
        <View>
          {!isShopping && (
            <TextField
              label="What's inside?"
              hint="required"
              value={packageContents}
              onChangeText={(t) => dispatch(setPackageContents(t))}
              placeholder="e.g. Books, documents, clothes"
            />
          )}

          <Text className="mb-2 font-inter-medium text-sm">
            Delivery Preference <Text className="text-xs text-muted">· Optional</Text>
          </Text>
          <View className="mb-5 flex-row gap-2">
            {PREFERENCES.map((p) => {
              const active = preferences.includes(p.value);
              return (
                <Pressable
                  key={p.value}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  onPress={() => dispatch(togglePreference(p.value))}
                  className={`aspect-square flex-1 items-center justify-center overflow-hidden rounded-xl border px-1 ${
                    active ? "border-brand bg-brand" : "border-brand-light bg-white"
                  }`}
                >
                  {active && (
                    <LinearGradient
                      colors={[...brandGradient]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                  )}
                  <Ionicons name={p.icon} size={18} color={active ? colors.white : colors.brand} />
                  <Text
                    className={`mt-1 text-center text-[10px] leading-3 ${active ? "font-inter-semibold text-white" : "text-ink"}`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Delivery notes"
            hint="optional"
            showCounter
            maxLength={200}
            multiline
            value={deliveryNotes}
            onChangeText={(t) => dispatch(setDeliveryNotes(t))}
            placeholder="Call on arrival. Hand over at reception."
          />

          <Text className="mb-5 text-xs text-muted">Please seal your package before pickup.</Text>
          <View className="mb-4 rounded-xl border border-brand-light bg-brand-lighter p-4">
            <TermsAgreement />
          </View>
        </View>
      </FlowSheet>
    </Screen>
  );
}
