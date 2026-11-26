import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Header, SegmentedTabs, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store";
import { setRole, type Role } from "@/store/slices/authSlice";
import { colors } from "@/constants/theme";

/** Light green top band: back + small logo, eyebrow, title, subtitle. */
export function AuthHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) {
  return (
    <SafeAreaView edges={["top"]} className="bg-brand-lighter">
      <Header logo onBack={onBack} />
      <View className="px-5 pb-6 pt-2">
        <Text className="mb-1 font-inter-semibold text-[10px] uppercase tracking-wide text-brand">
          Your everyday delivery partner
        </Text>
        <Text className="font-inter-bold text-2xl">{title}</Text>
        <Text className="mt-1 text-xs text-body">{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

/** Customer / Store tabs bound to auth.role. */
export function RoleTabs() {
  const role = useAppSelector((s) => s.auth.role);
  const dispatch = useAppDispatch();
  return (
    <SegmentedTabs<Role>
      value={role}
      onChange={(r) => dispatch(setRole(r))}
      options={[
        { value: "customer", label: "Customer", icon: "person-outline" },
        { value: "store", label: "Store", icon: "storefront-outline" },
      ]}
    />
  );
}

export function OrDivider() {
  return (
    <View className="my-4 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-line" />
      <Text className="text-xs text-muted">or</Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

function SocialButton({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => Alert.alert(label, "Social login isn't connected yet. Please continue with your mobile number.")}
      className="mb-3 h-12 flex-row items-center justify-center gap-3 rounded-xl border border-line bg-white active:opacity-70"
    >
      <Ionicons name={icon} size={18} color={icon === "logo-google" ? "#EA4335" : colors.ink} />
      <Text className="font-inter-medium text-sm">{label}</Text>
    </Pressable>
  );
}

export function SocialButtons() {
  return (
    <View>
      <SocialButton label="Follow using Google" icon="logo-google" />
      <SocialButton label="Follow using Apple" icon="logo-apple" />
    </View>
  );
}

/** Centered green text link ("Continue as a guest"). */
export function TextLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress} className="items-center py-2">
      <Text className="font-inter-medium text-sm text-brand">{title}</Text>
    </Pressable>
  );
}

/** "New to RUSH? Create an account" style footer line. */
export function SwitchAuthLine({ prompt, action, to }: { prompt: string; action: string; to: "/auth/sign-in" | "/auth/sign-up" }) {
  return (
    <View className="mt-3 flex-row justify-center">
      <Text className="text-xs text-ink">{prompt} </Text>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={() => router.replace(to)}>
        <Text className="font-inter-medium text-xs text-brand">{action}</Text>
      </Pressable>
    </View>
  );
}

/** "Photo of licence" upload box; shows the picked image. */
export function LicenceUpload({ uri, onChange }: { uri: string | null; onChange: (uri: string | null) => void }) {
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to upload your licence.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!res.canceled && res.assets[0]) onChange(res.assets[0].uri);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 font-inter-medium text-sm">Photo of licence</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upload photo of licence"
        onPress={pick}
        className="h-32 items-center justify-center overflow-hidden rounded-xl border border-brand bg-brand-lighter active:opacity-80"
      >
        {uri ? (
          <>
            <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
            <View className="absolute bottom-2 right-2 flex-row items-center gap-1 rounded-full bg-white px-3 py-1">
              <Ionicons name="camera-outline" size={14} color={colors.brandDark} />
              <Text className="font-inter-medium text-xs text-brand-dark">Change</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="camera-outline" size={22} color={colors.brand} />
            <Text className="mt-2 font-inter-semibold text-sm">Upload Photo</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
