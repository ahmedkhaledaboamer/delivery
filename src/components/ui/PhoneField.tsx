import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "./TextField";
import { Text } from "./Text";
import { useT } from "@/i18n";
import { colors } from "@/constants/theme";

type Props = {
  label?: string;
  hint?: "required" | "optional";
  value: string;
  onChangeText: (v: string) => void;
  countryCode?: string;
  error?: string;
};

export const isValidPhone = (v: string) => v.replace(/\D/g, "").length >= 8;

/** Phone input with the "+971 |" prefix and a violet check once valid. */
export function PhoneField({ label, hint, value, onChangeText, countryCode = "+971", error }: Props) {
  const t = useT();
  return (
    <TextField
      label={label ?? t("common.mobileNumber")}
      hint={hint}
      value={value}
      onChangeText={(t) => onChangeText(t.replace(/[^\d\s]/g, ""))}
      keyboardType="phone-pad"
      placeholder="** **** ***"
      maxLength={13}
      error={error}
      left={
        <View className="mr-3 flex-row items-center border-r border-line pr-3">
          <Text className="text-sm text-body">{countryCode}</Text>
        </View>
      }
      right={isValidPhone(value) ? <Ionicons name="checkmark" size={18} color={colors.brand} /> : undefined}
    />
  );
}
