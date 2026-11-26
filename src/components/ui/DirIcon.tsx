import { ComponentProps } from "react";
import { I18nManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

/** Icons that point left/right and must be mirrored in Arabic (RTL). */
const DIRECTIONAL = /(arrow-back|arrow-forward|chevron-back|chevron-forward|caret-back|caret-forward|arrow-undo|arrow-redo|log-out|log-in|send|paper-plane|bicycle|car|exit|enter|return-up-back|return-up-forward)/;

export const isDirectionalIcon = (name: string) => DIRECTIONAL.test(name);

/** Style that mirrors a directional icon when the layout is RTL. */
export const rtlFlip = (name: string) =>
  I18nManager.isRTL && isDirectionalIcon(name) ? { transform: [{ scaleX: -1 }] } : undefined;

/**
 * Ionicons that automatically mirrors arrows/chevrons in Arabic (RTL).
 * Use for any icon that points "forward" or "back".
 */
export function DirIcon({ name, style, ...props }: ComponentProps<typeof Ionicons> & { name: IconName }) {
  const flip = rtlFlip(name);
  return <Ionicons name={name} style={flip ? [style, flip] : style} {...props} />;
}
