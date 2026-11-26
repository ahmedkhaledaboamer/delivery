import { Text as RNText, TextProps } from "react-native";

/**
 * Use this instead of react-native's Text so the Inter font is applied.
 * Weight via className: font-inter (400), font-inter-medium, font-inter-semibold, font-inter-bold.
 * Do NOT use font-bold / font-semibold (fontWeight breaks custom fonts on Android).
 */
export function Text({ className = "", ...props }: TextProps & { className?: string }) {
  const hasFamily = /\bfont-inter/.test(className);
  const hasColor = /\btext-(ink|body|muted|white|brand|danger|black|transparent|\[)/.test(className);
  return (
    <RNText
      className={`${hasFamily ? "" : "font-inter"} ${hasColor ? "" : "text-ink"} ${className}`}
      {...props}
    />
  );
}
