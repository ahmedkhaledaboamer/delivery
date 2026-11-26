import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { colors } from "@/constants/theme";

const STROKE = colors.brandDark;

function Ring({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={5} fill={colors.white} stroke={STROKE} strokeWidth={2} />
      <Circle cx={cx} cy={cy} r={1.8} fill={STROKE} />
    </>
  );
}

function LiveDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={9} fill={colors.brandLight} />
      <Circle cx={cx} cy={cy} r={5} fill={colors.brandAccent} stroke={STROKE} strokeWidth={1.5} />
    </>
  );
}

function useWidth() {
  const [w, setW] = useState(0);
  return { w, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setW(e.nativeEvent.layout.width) };
}

/** "Pick up. → We take it from here. → Drop off." curved route (onboarding page 1). */
export function PickupDropoffVisual() {
  const { w, onLayout } = useWidth();
  const H = 320;
  const L = 8; // left rail x
  const R = w - 8; // right rail x
  const r = 22; // corner radius
  const d =
    `M ${L} 10 L ${L} ${92 - r} Q ${L} 92 ${L + r} 92 L ${R - r} 92 Q ${R} 92 ${R} ${92 + r} L ${R} 150 ` +
    `M ${R} 150 L ${R} ${206 - r} Q ${R} 206 ${R - r} 206 L ${L + r} 206 Q ${L} 206 ${L} ${206 + r} L ${L} ${H - 10}`;
  return (
    <View style={{ height: H }} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={H} style={{ position: "absolute" }}>
          <Path d={d} stroke={STROKE} strokeWidth={1.8} fill="none" />
          <Ring cx={L} cy={10} />
          <LiveDot cx={R} cy={150} />
          <Ring cx={L} cy={H - 10} />
        </Svg>
      )}
      <View className="absolute left-6 top-0">
        <Text className="font-inter-bold text-[44px] leading-[52px] text-brand-dark">Pick up.</Text>
        <Text className="font-inter-medium text-[9px] tracking-[2px] text-muted">YOUR DOOR</Text>
      </View>
      <View className="absolute left-6 top-[118px] flex-row items-center">
        <Text className="font-inter-semibold text-xl leading-7">{"We take it\nfrom here."}</Text>
      </View>
      <View className="absolute right-7 top-[140px]">
        <Ionicons name="speedometer-outline" size={18} color={colors.muted} />
      </View>
      <View className="absolute left-6 top-[222px]">
        <Text className="font-inter-bold text-[44px] leading-[52px] text-brand-dark">Drop off.</Text>
        <Text className="font-inter-medium text-[9px] tracking-[2px] text-muted">THEIR DOOR</Text>
      </View>
    </View>
  );
}

/** "Always in sight." with the 12 min · LIVE card on the route (onboarding page 2). */
export function LiveTrackingVisual() {
  const { w, onLayout } = useWidth();
  const H = 300;
  const L = 8;
  const R = w - 8;
  const r = 22;
  const y1 = 128; // first horizontal
  const y2 = 240; // second horizontal
  const dotX = w * 0.45;
  const d =
    `M ${R} 12 L ${R} ${y1 - r} Q ${R} ${y1} ${R - r} ${y1} L ${L + r} ${y1} Q ${L} ${y1} ${L} ${y1 + r} ` +
    `L ${L} ${y2 - r} Q ${L} ${y2} ${L + r} ${y2} L ${R - r} ${y2} Q ${R} ${y2} ${R} ${y2 + r} L ${R} ${H - 12}`;
  return (
    <View style={{ height: H }} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={H} style={{ position: "absolute" }}>
          <Path d={d} stroke={STROKE} strokeWidth={1.8} fill="none" />
          <Ring cx={R} cy={12} />
          <LiveDot cx={dotX} cy={y2} />
          <Ring cx={R} cy={H - 12} />
        </Svg>
      )}
      <View className="absolute left-0 top-0">
        <Text className="font-inter-bold text-[44px] leading-[52px] text-brand-dark">{"Always\nin sight."}</Text>
      </View>
      <View
        className="absolute left-7 right-7 top-[150px] flex-row items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
        style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}
      >
        <View className="flex-row items-end gap-1">
          <Text className="font-inter-bold text-[40px] leading-[46px]">12</Text>
          <Text className="mb-1.5 font-inter-medium text-sm text-body">min</Text>
        </View>
        <View className="items-start">
          <View className="mb-1 flex-row items-center gap-1 rounded-full bg-brand-light px-2 py-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-brand" />
            <Text className="font-inter-bold text-[9px] tracking-wider text-brand-dark">LIVE</Text>
          </View>
          <Text className="text-[10px] leading-4 text-body">{"Your rider is\non the way"}</Text>
        </View>
      </View>
      <View className="absolute right-7 top-[252px]">
        <Text className="font-inter-medium text-[9px] tracking-[2px] text-muted">CLOSER TO YOUR DOOR</Text>
      </View>
    </View>
  );
}
