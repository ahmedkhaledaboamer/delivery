import { Text as RNText, TextProps } from "react-native";
import { useAppSelector } from "@/store";

/** Inter has no Arabic letters — in Arabic we switch to Cairo at the same weight. */
const CAIRO = {
  regular: "Cairo_400Regular",
  medium: "Cairo_500Medium",
  semibold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
} as const;

export function arabicFontFor(className: string) {
  if (/\bfont-inter-bold\b/.test(className)) return CAIRO.bold;
  if (/\bfont-inter-semibold\b/.test(className)) return CAIRO.semibold;
  if (/\bfont-inter-medium\b/.test(className)) return CAIRO.medium;
  return CAIRO.regular;
}

/**
 * Use this instead of react-native's Text so the brand font is applied (Inter in English, Cairo in Arabic).
 * Weight via className: font-inter (400), font-inter-medium, font-inter-semibold, font-inter-bold.
 * Do NOT use font-bold / font-semibold (fontWeight breaks custom fonts on Android).
 */
export function Text({ className = "", style, ...props }: TextProps & { className?: string }) {
  const arabic = useAppSelector((s) => s.settings.language === "ar");
  const hasFamily = /\bfont-inter/.test(className);
  const hasColor = /\btext-(ink|body|muted|white|brand|danger|black|transparent|\[)/.test(className);
  return (
    <RNText
      className={`${hasFamily ? "" : "font-inter"} ${hasColor ? "" : "text-ink"} ${className}`}
      style={arabic ? [style, { fontFamily: arabicFontFor(className) }] : style}
      {...props}
    />
  );
}
