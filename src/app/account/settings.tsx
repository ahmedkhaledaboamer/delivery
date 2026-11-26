import { Alert, Switch, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header, ListRow, PageTitle, Screen, SectionLabel, StaticTabBar } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPushNotifications } from "@/store/slices/settingsSlice";
import { logout } from "@/store/slices/authSlice";
import { colors } from "@/constants/theme";

const icon = (name: keyof typeof Ionicons.glyphMap, color: string = colors.body) => (
  <Ionicons name={name} size={18} color={color} />
);

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.settings.language);
  const push = useAppSelector((s) => s.settings.pushNotifications);

  const signOut = () =>
    Alert.alert("Sign out?", "You'll need to verify your mobile number to sign in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/auth/sign-in");
        },
      },
    ]);

  return (
    <Screen footer={<StaticTabBar active="profile" />}>
      <View className="bg-brand-lighter pb-5">
        <Header actions />
        <PageTitle title="Settings" subtitle="Your APEX AORA, your way." />
      </View>

      <View className="px-5 pt-3">
        <ListRow
          title="Language"
          subtitle={language === "ar" ? "العربية" : "English"}
          trailing={icon("globe-outline")}
          onPress={() => router.push("/account/language")}
        />
        <ListRow
          title="Push notifications"
          subtitle="Pickup and delivery updates"
          trailing={
            <Switch
              value={push}
              onValueChange={(v) => {
                dispatch(setPushNotifications(v));
              }}
              trackColor={{ false: colors.line, true: colors.brand }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.line}
            />
          }
        />

        <SectionLabel className="mt-6">Privacy & Security</SectionLabel>
        <ListRow
          title="Change password"
          trailing={icon("lock-closed-outline")}
          onPress={() => Alert.alert("Change password", "Password change is coming soon.")} // TODO: build change-password flow
        />
        <ListRow title="My Wallet" trailing={icon("wallet-outline")} onPress={() => router.push("/account/wallet")} />
        <ListRow title="Loyalty Point" trailing={icon("ribbon-outline")} onPress={() => router.push("/account/loyalty")} />
        <ListRow title="Privacy Policy" trailing={icon("shield-checkmark-outline")} onPress={() => router.push("/account/privacy")} />
        <ListRow
          title="Help & Support"
          subtitle="We're here for your deliveries"
          trailing={icon("headset-outline")}
          onPress={() => router.push("/account/support")}
        />
        <ListRow title="About APEX AORA" trailing={icon("information-circle-outline")} onPress={() => router.push("/account/about")} />
        <ListRow title="Sign out" destructive divider={false} trailing={icon("log-out-outline", colors.danger)} onPress={signOut} />
      </View>
    </Screen>
  );
}
