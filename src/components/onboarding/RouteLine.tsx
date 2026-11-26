import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { colors } from "@/constants/theme";

/** Teardrop map pin centred horizontally on x, with its tip at y. */
export function PinShape({ x, y, size = 1, color = colors.brandAccent }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <G transform={`translate(${x}, ${y}) scale(${size})`}>
      <Path d="M0 0 C-3 -6 -10 -11 -10 -18 A10 10 0 0 1 10 -18 C10 -11 3 -6 0 0 Z" fill={color} />
      <Circle cx={0} cy={-18} r={4} fill={colors.white} />
    </G>
  );
}

/**
 * Decorative "pin → pin" route: a wavy violet line between two map pins
 * (splash bottom, Home bottom). Draws at the measured width.
 * TODO: replace with Figma illustration
 */
export function RouteLine({ height = 90, className = "" }: { height?: number; className?: string }) {
  const [w, setW] = useState(0);
  const startX = 24;
  const endX = w - 24;
  const baseY = height - 8;
  const topY = 34;
  const mid = (startX + endX) / 2;
  const d =
    w > 0
      ? `M ${startX} ${baseY - 24} C ${startX + 30} ${baseY + 4}, ${mid - 50} ${baseY + 6}, ${mid - 20} ${baseY - 18} ` +
        `S ${mid + 30} ${topY - 10}, ${mid + 60} ${topY + 18} S ${endX - 20} ${topY + 18}, ${endX} ${topY - 6}`
      : "";
  return (
    <View className={className} style={{ height }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Path d={d} stroke={colors.brandAccent} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <Circle cx={mid - 20} cy={baseY - 18} r={3} fill={colors.brandDark} />
          <PinShape x={startX} y={baseY - 18} />
          <PinShape x={endX} y={topY} />
        </Svg>
      )}
    </View>
  );
}
