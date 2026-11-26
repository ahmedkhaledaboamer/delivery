import { ReactNode } from "react";
import { View } from "react-native";

/**
 * White panel with rounded top corners and a grab handle — sits under <RouteMap />
 * (pickup / dropoff / confirm route screens). Use negative margin to overlap the map.
 */
export function Sheet({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <View className={`-mt-6 flex-1 rounded-t-3xl bg-white px-5 pt-3 ${className}`}>
      <View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
      {children}
    </View>
  );
}
