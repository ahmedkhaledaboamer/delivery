import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { router } from "expo-router";
import { Button, InfoBanner, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AccountHeader, AvatarPicker, QueryState } from "@/components/account";
import { useProfile, useUpdateProfile } from "@/api/hooks";
import { useAppDispatch } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import { useT } from "@/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "+971 50 123 4567" -> ["+971", "50 123 4567"] */
function splitPhone(phone: string): [string, string] {
  const m = phone.trim().match(/^(\+\d{1,4})\s*(.*)$/);
  return m ? [m[1], m[2]] : ["+971", phone];
}

export default function EditProfileScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const profile = useProfile();
  const update = useUpdateProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();

  const [countryCode, initialLocal] = useMemo(() => splitPhone(profile.data?.phone ?? ""), [profile.data?.phone]);

  useEffect(() => {
    if (!profile.data) return;
    setName(profile.data.name);
    setEmail(profile.data.email);
    setPhone(initialLocal);
    setAvatar(profile.data.avatar);
  }, [profile.data, initialLocal]);

  const p = profile.data;
  const changed =
    !!p && (name.trim() !== p.name || email.trim() !== p.email || phone.trim() !== initialLocal.trim() || avatar !== p.avatar);
  const nameValid = name.trim().length >= 2;
  const emailValid = EMAIL_RE.test(email.trim());
  const phoneValid = isValidPhone(phone);
  const canSave = changed && nameValid && emailValid && phoneValid;

  const save = () => {
    const patch = { name: name.trim(), email: email.trim(), phone: `${countryCode} ${phone.trim()}`, avatar };
    update.mutate(patch, {
      onSuccess: () => {
        dispatch(updateUser(patch));
        router.back();
      },
      onError: (e) => Alert.alert(t("account.couldntSave"), e instanceof Error ? e.message : t("account.tryAgain")),
    });
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title={t("account.saveChanges")} disabled={!canSave} loading={update.isPending} onPress={save} />}
    >
      <AccountHeader title={t("account.editProfile")} subtitle={t("account.editProfileSubtitle")} />

      <QueryState isLoading={profile.isLoading} error={profile.error}>
        <View className="px-5 pt-6">
          <View className="mb-6 flex-row items-center gap-4">
            <AvatarPicker name={name} uri={avatar} size={64} onChange={setAvatar} />
            <Text className="font-inter-medium text-sm text-brand">{t("account.changePhoto")}</Text>
          </View>

          <TextField
            label={t("common.fullName")}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={name.length > 0 && !nameValid ? t("account.enterFullName") : undefined}
          />
          <TextField
            label={t("account.emailAddress")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={email.length > 0 && !emailValid ? t("account.enterValidEmail") : undefined}
          />
          <PhoneField
            label={t("account.mobileSriLanka")}
            countryCode={countryCode}
            value={phone}
            onChangeText={setPhone}
            error={phone.length > 0 && !phoneValid ? t("account.enterValidMobile") : undefined}
          />
          <InfoBanner>
            {t("account.changeMobileNote")}
          </InfoBanner>
        </View>
      </QueryState>
    </Screen>
  );
}
