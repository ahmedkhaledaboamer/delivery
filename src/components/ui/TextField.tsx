import { forwardRef, ReactNode } from "react";
import type { TextInputInstance } from "react-native";
import { TextInput, TextInputProps, View } from "react-native";
import { Text, arabicFontFor } from "./Text";
import { useT } from "@/i18n";
import { useAppSelector } from "@/store";
import { colors } from "@/constants/theme";

type Props = TextInputProps & {
  label?: string;
  /** Shows "· Required" or "(Optional)" after the label like the design. */
  hint?: "required" | "optional";
  error?: string;
  /** Shows "40 / 200" on the right of the label. Requires maxLength. */
  showCounter?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  containerClassName?: string;
};

/** Labelled input with the light border + white fill from the design. */
export const TextField = forwardRef<TextInputInstance, Props>(function TextField(
  { label, hint, error, showCounter, left, right, multiline, containerClassName = "", value, maxLength, ...props },
  ref,
) {
  const t = useT();
  const arabic = useAppSelector((s) => s.settings.language === "ar");
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {(label || showCounter) && (
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-inter-medium text-sm">
            {label}
            {hint === "required" && <Text className="text-xs text-muted">{t("common.requiredSuffix")}</Text>}
            {hint === "optional" && <Text className="text-xs text-muted">{t("common.optionalSuffix")}</Text>}
          </Text>
          {showCounter && maxLength && (
            <Text className="text-xs text-muted">
              {value?.length ?? 0} / {maxLength}
            </Text>
          )}
        </View>
      )}
      <View
        className={`flex-row rounded-xl border bg-white px-4 ${multiline ? "min-h-[96px] items-start py-3" : "h-14 items-center"} ${
          error ? "border-danger" : "border-line"
        }`}
      >
        {left}
        <TextInput
          ref={ref}
          className="flex-1 font-inter text-sm text-ink"
          placeholderTextColor={colors.muted}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          value={value}
          maxLength={maxLength}
          {...props}
          style={arabic ? [props.style, { fontFamily: arabicFontFor(""), textAlign: "right" }] : props.style}
        />
        {right}
      </View>
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}
    </View>
  );
});
