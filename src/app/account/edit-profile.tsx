import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button, InfoBanner, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AccountHeader, Avatar, QueryState } from "@/components/account";
import { useProfile, useUpdateProfile } from "@/api/hooks";
import { useAppDispatch } from "@/store";
import { updateUser } from "@/store/slices/authSlice";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "+971 50 123 4567" -> ["+971", "50 123 4567"] */
function splitPhone(phone: string): [string, string] {
  const m = phone.trim().match(/^(\+\d{1,4})\s*(.*)$/);
  return m ? [m[1], m[2]] : ["+971", phone];
}

export default function EditProfileScreen() {
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

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to change your profile photo.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!res.canceled && res.assets[0]) setAvatar(res.assets[0].uri);
  };

  const save = () => {
    const patch = { name: name.trim(), email: email.trim(), phone: `${countryCode} ${phone.trim()}`, avatar };
    update.mutate(patch, {
      onSuccess: () => {
        dispatch(updateUser(patch));
        router.back();
      },
      onError: (e) => Alert.alert("Couldn't save", e instanceof Error ? e.message : "Please try again."),
    });
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={<Button title="Save changes" disabled={!canSave} loading={update.isPending} onPress={save} />}
    >
      <AccountHeader title="Edit profile" subtitle="Keep your contact details up to date." />

      <QueryState isLoading={profile.isLoading} error={profile.error}>
        <View className="px-5 pt-6">
          <Pressable onPress={pickPhoto} className="mb-6 flex-row items-center gap-4 active:opacity-70">
            <Avatar name={name} uri={avatar} size={60} />
            <Text className="font-inter-medium text-sm text-brand">Change photo</Text>
          </Pressable>

          <TextField
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={name.length > 0 && !nameValid ? "Enter your full name" : undefined}
          />
          <TextField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={email.length > 0 && !emailValid ? "Enter a valid email address" : undefined}
          />
          <PhoneField
            label="Mobile number · Sri Lanka"
            countryCode={countryCode}
            value={phone}
            onChangeText={setPhone}
            error={phone.length > 0 && !phoneValid ? "Enter a valid mobile number" : undefined}
          />
          <InfoBanner>
            Changing your mobile number requires SMS verification. Existing orders keep their original contact details.
          </InfoBanner>
        </View>
      </QueryState>
    </Screen>
  );
}
