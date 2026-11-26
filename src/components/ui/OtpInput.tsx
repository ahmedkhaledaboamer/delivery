import { useEffect, useRef } from "react";
import { TextInput, TextInputInstance, View } from "react-native";
import { Text } from "./Text";

/**
 * 6 boxes driven by one TextInput (works with SMS autofill).
 * The input is invisible but covers the whole row, so any tap lands on it and opens the keyboard —
 * a tiny 1px hidden input can't reliably take focus on Android.
 */
export function OtpInput({ value, onChange, length = 6 }: { value: string; onChange: (v: string) => void; length?: number }) {
  const input = useRef<TextInputInstance>(null);

  // autoFocus is unreliable on Android while the screen transition is running; focus once it settles.
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="relative">
      <View className="flex-row justify-between" pointerEvents="none">
        {Array.from({ length }).map((_, i) => {
          const char = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              className={`h-14 w-12 items-center justify-center rounded-xl border bg-white ${
                active ? "border-brand bg-brand-lighter" : "border-line"
              }`}
            >
              <Text className="font-inter-semibold text-xl">{char ?? "–"}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        contextMenuHidden
        accessibilityLabel="Verification code"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.01, color: "transparent" }}
      />
    </View>
  );
}
