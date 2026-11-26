import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Header, Screen, Text, TextField } from "@/components/ui";
import { TermsAgreement } from "@/components/delivery";
import { PREFERENCES, StepPill } from "@/components/send";
import { colors } from "@/constants/theme";
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
    <Screen footer={<Button title="Continue" disabled={!canContinue} onPress={() => router.push("/send/review")} />}>
      <Header actions />
      <View className="px-5">
        <StepPill label="4 of 7 · Package" />
        <Text className="mt-3 font-inter-bold text-2xl">What are you sending?</Text>
        <Text className="mt-1 text-sm text-body">A few details help us handle it with care.</Text>

        <View className="mt-6">
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
                  className={`aspect-square flex-1 items-center justify-center rounded-xl border px-1 ${
                    active ? "border-brand bg-brand" : "border-line bg-white"
                  }`}
                >
                  <Ionicons name={p.icon} size={18} color={active ? colors.white : colors.brand} />
                  <Text
                    className={`mt-1 text-center text-[10px] leading-3 ${active ? "font-inter-semibold text-white" : "text-body"}`}
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
          <TermsAgreement />
        </View>
      </View>
    </Screen>
  );
}
