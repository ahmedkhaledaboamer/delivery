import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  /** Pinned at the bottom (usually the Continue button). */
  footer?: ReactNode;
  scroll?: boolean;
  /** "surface" = the off-white app background, "white" for plain white screens. */
  background?: "surface" | "white";
  edges?: Edge[];
  contentClassName?: string;
};

/** Base layout for every screen: safe area, keyboard handling, optional scroll and sticky footer. */
export function Screen({
  children,
  footer,
  scroll = true,
  background = "surface",
  edges = ["top", "bottom"],
  contentClassName = "",
}: Props) {
  const bg = background === "white" ? "bg-white" : "bg-surface";
  return (
    <SafeAreaView edges={edges} className={`flex-1 ${bg}`}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName={`grow pb-6 ${contentClassName}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className={`flex-1 ${contentClassName}`}>{children}</View>
        )}
        {footer && <View className="px-5 pb-2 pt-3">{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
