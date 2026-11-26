import { Alert, Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Header, SegmentedTabs, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store";
import { setRole, type Role } from "@/store/slices/authSlice";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";

/** Light violet top band: back + small logo, eyebrow, title, subtitle. */
export function AuthHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack?: () => void }) {
  const t = useT();
  return (
    <SafeAreaView edges={["top"]} className="bg-brand-lighter">
      <Header logo onBack={onBack} />
      <View className="px-5 pb-6 pt-2">
        <Text className="mb-1 font-inter-semibold text-[10px] uppercase tracking-wide text-brand">
          {t("auth.eyebrow")}
        </Text>
        <Text className="font-inter-bold text-2xl">{title}</Text>
        <Text className="mt-1 text-xs text-body">{subtitle}</Text>
      </View>
    </SafeAreaView>
  );
}

/** Customer / Store / Driver tabs bound to auth.role. */
export function RoleTabs() {
  const t = useT();
  const role = useAppSelector((s) => s.auth.role);
  const dispatch = useAppDispatch();
  return (
    <SegmentedTabs<Role>
      value={role}
      onChange={(r) => dispatch(setRole(r))}
      options={[
        { value: "customer", label: t("auth.roleCustomer"), icon: "person-outline" },
        { value: "store", label: t("auth.roleStore"), icon: "storefront-outline" },
        { value: "driver", label: t("auth.roleDriver"), icon: "bicycle-outline" },
      ]}
    />
  );
}

export function OrDivider() {
  const t = useT();
  return (
    <View className="my-4 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-line" />
      <Text className="text-xs text-muted">{t("auth.or")}</Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

function SocialButton({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  const t = useT();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => Alert.alert(label, t("auth.socialNotConnected"))}
      className="mb-3 h-12 flex-row items-center justify-center gap-3 rounded-xl border border-line bg-white active:opacity-70"
    >
      <Ionicons name={icon} size={18} color={icon === "logo-google" ? "#EA4335" : colors.ink} />
      <Text className="font-inter-medium text-sm">{label}</Text>
    </Pressable>
  );
}

export function SocialButtons() {
  const t = useT();
  return (
    <View>
      <SocialButton label={t("auth.google")} icon="logo-google" />
      <SocialButton label={t("auth.apple")} icon="logo-apple" />
    </View>
  );
}

/** Centered violet text link ("Continue as a guest"). */
export function TextLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress} className="items-center py-2">
      <Text className="font-inter-medium text-sm text-brand">{title}</Text>
    </Pressable>
  );
}

/** "New to APEX AORA? Create an account" style footer line. */
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
  const t = useT();
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("auth.permissionNeeded"), t("auth.licencePermission"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!res.canceled && res.assets[0]) onChange(res.assets[0].uri);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 font-inter-medium text-sm">{t("auth.licencePhoto")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("auth.uploadLicenceA11y")}
        onPress={pick}
        className="h-32 items-center justify-center overflow-hidden rounded-xl border border-brand bg-brand-lighter active:opacity-80"
      >
        {uri ? (
          <>
            <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
            <View className="absolute bottom-2 end-2 flex-row items-center gap-1 rounded-full bg-white px-3 py-1">
              <Ionicons name="camera-outline" size={14} color={colors.brandDark} />
              <Text className="font-inter-medium text-xs text-brand-dark">{t("auth.change")}</Text>
            </View>
          </>
        ) : (
          <>
            <Ionicons name="camera-outline" size={22} color={colors.brand} />
            <Text className="mt-2 font-inter-semibold text-sm">{t("auth.uploadPhoto")}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
