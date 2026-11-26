import { Image } from "react-native";
import { images } from "@/constants/images";

const FULL_RATIO = 535 / 263; // logo-full-*.png
const MARK_RATIO = 376 / 191; // logo-mark.png (scooter only)

const FULL_HEIGHT = { sm: 40, md: 72, lg: 150 } as const;
const MARK_HEIGHT = { sm: 26, md: 44, lg: 90 } as const;

/**
 * APEX AORA logo.
 * - default: scooter + dark "APEX AORA" wordmark (for light backgrounds)
 * - tone="light": white wordmark (for dark backgrounds)
 * - markOnly: just the scooter (small headers, avatars)
 */
export function Logo({
  size = "md",
  markOnly = false,
  tone = "dark",
}: {
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
  tone?: "dark" | "light";
}) {
  if (markOnly) {
    const h = MARK_HEIGHT[size];
    return <Image source={images.logoMark} style={{ height: h, width: h * MARK_RATIO }} resizeMode="contain" accessibilityLabel="APEX AORA" />;
  }
  const h = FULL_HEIGHT[size];
  return (
    <Image
      source={tone === "light" ? images.logoFullLight : images.logoFullDark}
      style={{ height: h, width: h * FULL_RATIO }}
      resizeMode="contain"
      accessibilityLabel="APEX AORA"
    />
  );
}
