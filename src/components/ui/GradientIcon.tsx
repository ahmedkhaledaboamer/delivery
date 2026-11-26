import { ComponentType, ReactElement } from "react";
import { View, type ViewProps } from "react-native";
import RNMaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { brandGradient } from "@/constants/theme";

const MaskedView = RNMaskedView as unknown as ComponentType<ViewProps & { maskElement: ReactElement }>;

/** Ionicon filled with the logo gradient (top-left purple → bottom-right cyan). */
export function GradientIcon({ name, size }: { name: keyof typeof Ionicons.glyphMap; size: number }) {
  return (
    <MaskedView
      style={{ width: size, height: size }}
      maskElement={
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={name} size={size} color="black" />
        </View>
      }
    >
      <LinearGradient colors={[...brandGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size }} />
    </MaskedView>
  );
}
