import { ComponentType, ReactElement, ReactNode } from "react";
import type { ViewProps } from "react-native";
import RNMaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "./Text";
import { brandGradient, brandGradientEnd, brandGradientStart } from "@/constants/theme";

// The package ships class types that React 19's JSX types reject; the runtime component is fine.
const MaskedView = RNMaskedView as unknown as ComponentType<ViewProps & { maskElement: ReactElement }>;

/**
 * Text filled with the logo gradient (purple → blue → cyan).
 * Use for highlighted words: "Anywhere", "APEX AORA", "Confirmed", big titles.
 * className sets font/size exactly like <Text>.
 */
export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <MaskedView maskElement={<Text className={`${className} text-black`}>{children}</Text>}>
      <LinearGradient colors={[...brandGradient]} start={brandGradientStart} end={brandGradientEnd}>
        {/* invisible copy sizes the gradient to the text */}
        <Text className={className} style={{ opacity: 0 }}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
