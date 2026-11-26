import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { TIP_OPTIONS } from "@/lib/pricing";
import { formatAED } from "@/lib/format";
import { useT } from "@/i18n";

/** "Tip your driver (option)" — 5 / 10 / 15 / Custom. Pass 0 for no tip; tapping the selected amount clears it. */
export function TipSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const t = useT();
  const [custom, setCustom] = useState(!TIP_OPTIONS.includes(value) && value > 0);
  const chip = (active: boolean) =>
    `h-11 flex-1 items-center justify-center rounded-xl border ${active ? "border-brand bg-brand-light" : "border-line bg-white"}`;
  return (
    <Card>
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="cash-outline" size={18} color={colors.brand} />
        <Text className="font-inter-semibold text-sm">
          {t("payment.tipTitle")} <Text className="text-xs text-muted">{t("payment.tipOptional")}</Text>
        </Text>
      </View>
      <View className="flex-row gap-2">
        {TIP_OPTIONS.map((amount) => {
          const active = !custom && value === amount;
          return (
            <Pressable
              key={amount}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t("payment.tipAmountLabel", { amount: formatAED(amount) })}
              onPress={() => {
                setCustom(false);
                onChange(active ? 0 : amount);
              }}
              className={chip(active)}
            >
              <Text className="font-inter-medium text-sm">{amount}</Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: custom }}
          onPress={() => {
            setCustom(true);
            onChange(0);
          }}
          className={chip(custom)}
        >
          <Text className="font-inter-medium text-sm">{t("payment.tipCustom")}</Text>
        </Pressable>
      </View>
      {custom && (
        <TextInput
          autoFocus
          keyboardType="number-pad"
          placeholder={t("payment.tipPlaceholder")}
          placeholderTextColor={colors.muted}
          value={value ? String(value) : ""}
          onChangeText={(s) => onChange(Number(s.replace(/\D/g, "")) || 0)}
          className="mt-3 h-12 rounded-xl border border-line bg-white px-4 font-inter text-sm text-ink"
        />
      )}
    </Card>
  );
}
