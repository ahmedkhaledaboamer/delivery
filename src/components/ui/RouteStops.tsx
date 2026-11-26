import { Pressable, View } from "react-native";
import { Text } from "./Text";

type Stop = { label: string; address: string; detail?: string; onEdit?: () => void };

/** Vertical PICKUP → DROP-OFF list with green dots and optional "Edit" links. */
export function RouteStops({ stops, className = "" }: { stops: Stop[]; className?: string }) {
  return (
    <View className={className}>
      {stops.map((s, i) => (
        <View key={i} className={`flex-row gap-3 ${i < stops.length - 1 ? "pb-3" : ""}`}>
          <View className="items-center pt-1">
            <View className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-brand-accent" : "bg-brand-dark"}`} />
            {i < stops.length - 1 && <View className="mt-1 w-px flex-1 bg-line" />}
          </View>
          <View className="flex-1">
            <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">{s.label}</Text>
            <Text className="mt-0.5 font-inter-medium text-sm">{s.address || "—"}</Text>
            {s.detail && <Text className="mt-0.5 text-xs text-muted">{s.detail}</Text>}
          </View>
          {s.onEdit && (
            <Pressable hitSlop={8} onPress={s.onEdit}>
              <Text className="font-inter-medium text-xs text-brand underline">Edit</Text>
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
