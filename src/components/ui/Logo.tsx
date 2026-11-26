import { View } from "react-native";
import { Text } from "./Text";

/**
 * Text-based stand-in for the RUSH logo.
 * TODO: export the real logo from Figma (assets/images/logo.png, logo-mark.png) and swap this for <Image>.
 */
export function Logo({ size = "md", markOnly = false }: { size?: "sm" | "md" | "lg"; markOnly?: boolean }) {
  const mark = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-20 w-20" }[size];
  const markText = { sm: "text-lg", md: "text-2xl", lg: "text-5xl" }[size];
  const word = { sm: "text-lg", md: "text-2xl", lg: "text-5xl" }[size];
  return (
    <View className="flex-row items-center gap-2">
      <View className={`${mark} items-center justify-center rounded-xl bg-brand`}>
        <Text className={`font-inter-bold italic text-white ${markText}`}>R</Text>
      </View>
      {!markOnly && (
        <View>
          <Text className={`font-inter-bold italic tracking-wider text-brand-dark ${word}`}>RUSH</Text>
          {size !== "sm" && (
            <Text className="font-inter-semibold text-[8px] tracking-[3px] text-brand">DELIVERY SERVICES</Text>
          )}
        </View>
      )}
    </View>
  );
}
