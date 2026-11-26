import { Alert, Switch, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { DirIcon, ListRow, Screen, SectionLabel, StaticTabBar } from "@/components/ui";
import { AccountHeader } from "@/components/account";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPushNotifications } from "@/store/slices/settingsSlice";
import { logout } from "@/store/slices/authSlice";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";

const icon = (name: keyof typeof Ionicons.glyphMap, color: string = colors.body) => (
  <DirIcon name={name} size={18} color={color} />
);

export default function SettingsScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.settings.language);
  const push = useAppSelector((s) => s.settings.pushNotifications);

  const signOut = () =>
    Alert.alert(t("account.signOutTitle"), t("account.signOutBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("account.signOut"),
        style: "destructive",
        onPress: () => {
          dispatch(logout());
          router.replace("/auth/sign-in");
        },
      },
    ]);

  return (
    <Screen edges={["bottom"]} background="white" footer={<StaticTabBar active="profile" />}>
      <AccountHeader title={t("account.settings")} subtitle={t("account.settingsSubtitle")} />

      <View className="px-5 pt-3">
        <ListRow
          title={t("account.language")}
          subtitle={language === "ar" ? "العربية" : "English"}
          trailing={icon("globe-outline")}
          onPress={() => router.push("/account/language")}
        />
        <ListRow
          title={t("account.pushNotifications")}
          subtitle={t("account.pushNotificationsSub")}
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

        <SectionLabel className="mt-4">{t("account.privacySecurity")}</SectionLabel>
        <ListRow
          title={t("account.changePassword")}
          trailing={icon("lock-closed-outline")}
          onPress={() => Alert.alert(t("account.changePassword"), t("account.changePasswordSoon"))} // TODO: build change-password flow
        />
        <ListRow title={t("account.myWallet")} trailing={icon("wallet-outline")} onPress={() => router.push("/account/wallet")} />
        <ListRow title={t("account.loyaltyPoint")} trailing={icon("people-outline")} onPress={() => router.push("/account/loyalty")} />
        <ListRow title={t("account.privacyPolicy")} trailing={icon("shield-checkmark-outline")} onPress={() => router.push("/account/privacy")} />
        <ListRow
          title={t("account.helpSupportTitle")}
          subtitle={t("account.helpSupportSettingsSub")}
          trailing={icon("headset-outline")}
          onPress={() => router.push("/account/support")}
        />
        <ListRow title={t("account.aboutApex")} trailing={icon("information-circle-outline")} onPress={() => router.push("/account/about")} />
        <ListRow title={t("account.signOut")} destructive divider={false} trailing={icon("log-out-outline", colors.danger)} onPress={signOut} />
      </View>
    </Screen>
  );
}
