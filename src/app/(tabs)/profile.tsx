import { useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, InfoBanner, ListRow, Screen, TAB_BAR_SPACE, Text, TextField } from "@/components/ui";
import { AccountHeader, AvatarPicker, IconTile, QueryState, RowIcon } from "@/components/account";
import { useProfile, useUpdateProfile } from "@/api/hooks";
import type { Address } from "@/api/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import { maskPhone } from "@/lib/format";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";

const ADDRESS_ICON: Record<Address["icon"], keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "location-outline",
};

function GuestCard() {
  const t = useT();
  return (
    <Card className="mx-5 mt-6 items-center py-8">
      <IconTile name="person-outline" size={56} iconSize={26} rounded="rounded-full" />
      <Text className="mt-4 font-inter-semibold text-base">{t("account.guestTitle")}</Text>
      <Text className="mt-1 px-4 text-center text-sm text-body">
        {t("account.guestBody")}
      </Text>
      <Button title={t("account.signIn")} className="mt-5 w-full" onPress={() => router.replace("/auth/sign-in")} />
      <Button title={t("account.createAccount")} variant="ghost" className="mt-1 w-full" onPress={() => router.replace("/auth/sign-up")} />
    </Card>
  );
}

function AddAddressForm({ onAdd, onCancel }: { onAdd: (a: Address) => void; onCancel: () => void }) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const valid = label.trim().length > 0 && address.trim().length > 4;
  return (
    <Card tone="tint" className="mt-3">
      <TextField label={t("account.addressLabel")} placeholder={t("account.addressLabelPlaceholder")} value={label} onChangeText={setLabel} />
      <TextField label={t("account.address")} placeholder={t("account.addressPlaceholder")} value={address} onChangeText={setAddress} />
      <View className="flex-row gap-3">
        <Button title={t("common.cancel")} variant="outline" size="sm" className="flex-1" onPress={onCancel} />
        <Button
          title={t("account.saveAddress")}
          size="sm"
          className="flex-1"
          disabled={!valid}
          onPress={() => {
            const lower = label.trim().toLowerCase();
            onAdd({
              id: `local-${Date.now()}`,
              label: label.trim(),
              address: address.trim(),
              icon: lower === "home" ? "home" : lower === "work" || lower === "office" ? "work" : "other",
            });
          }}
        />
      </View>
    </Card>
  );
}

export default function ProfileScreen() {
  const t = useT();
  const isGuest = useAppSelector((s) => s.auth.isGuest);
  const user = useAppSelector((s) => s.auth.user);
  const profile = useProfile();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (profile.data) setAddresses(profile.data.addresses);
  }, [profile.data]);

  const name = user?.name ?? profile.data?.name ?? "";
  const phone = user?.phone ?? profile.data?.phone ?? "";
  const avatar = user ? user.avatar : profile.data?.avatar;
  const dispatch = useAppDispatch();
  const updateProfile = useUpdateProfile();

  // TODO: upload the image file to the backend (multipart) and store the returned URL instead of the local uri.
  const changePhoto = (uri: string | undefined) =>
    updateProfile.mutateAsync({ avatar: uri }).then(
      () => {
        dispatch(updateUser({ avatar: uri }));
      },
      () => Alert.alert(t("account.photoUpdateFailed"), t("account.tryAgain")),
    );

  return (
    <Screen edges={[]} background="white">
      <View style={{ paddingBottom: TAB_BAR_SPACE }}>
        <AccountHeader
          title={t("account.profileTitle")}
          subtitle={t("account.profileSubtitle")}
          onBack={() => router.navigate("/(tabs)")}
        />

        {isGuest ? (
          <GuestCard />
        ) : (
          <QueryState isLoading={profile.isLoading} error={profile.error}>
            <View className="px-5">
              <View className="flex-row items-center gap-4 pb-2 pt-5">
                <AvatarPicker name={name} uri={avatar} size={64} onChange={changePhoto} busy={updateProfile.isPending} />
                <View className="flex-1">
                  <Text className="font-inter-semibold text-base">{name}</Text>
                  <View className="self-start" style={{ direction: "ltr" }}>
                    <Text className="mt-1 text-xs text-muted">{maskPhone(phone)}</Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => router.push("/account/edit-profile")}>
                    <Text className="mt-1.5 font-inter-medium text-xs text-brand">{t("account.editProfile")}</Text>
                  </Pressable>
                </View>
              </View>

              <Text className="mt-4 font-inter-semibold text-sm">{t("account.savedAddresses")}</Text>
              {addresses.map((a) => (
                <ListRow
                  key={a.id}
                  title={a.label}
                  subtitle={a.address}
                  trailing={<RowIcon name={ADDRESS_ICON[a.icon]} />}
                />
              ))}
              {adding ? (
                <AddAddressForm
                  onCancel={() => setAdding(false)}
                  onAdd={(a) => {
                    // TODO: persist via the API (POST /profile/addresses) once the backend endpoint exists.
                    setAddresses((prev) => [...prev, a]);
                    setAdding(false);
                  }}
                />
              ) : (
                <ListRow title={t("account.addAddress")} trailing={<RowIcon name="add" />} onPress={() => setAdding(true)} />
              )}

              <Text className="mt-4 font-inter-semibold text-sm">{t("account.hereToHelp")}</Text>
              <ListRow
                title={t("account.helpSupport")}
                subtitle={t("account.helpSupportSub")}
                trailing={<RowIcon name="headset-outline" />}
                onPress={() => router.push("/account/support")}
              />
              <ListRow
                title={t("account.settings")}
                subtitle={t("account.settingsSub")}
                trailing={<RowIcon name="options-outline" />}
                onPress={() => router.push("/account/settings")}
              />

              <InfoBanner className="mt-4">{t("account.deliveringAcross")}</InfoBanner>
            </View>
          </QueryState>
        )}
      </View>
    </Screen>
  );
}
