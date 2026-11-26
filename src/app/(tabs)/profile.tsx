import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, InfoBanner, ListRow, Screen, TAB_BAR_SPACE, Text, TextField } from "@/components/ui";
import { AccountHeader, Avatar, IconTile, QueryState, RowIcon } from "@/components/account";
import { useProfile } from "@/api/hooks";
import type { Address } from "@/api/types";
import { useAppSelector } from "@/store";
import { maskPhone } from "@/lib/format";
import { colors } from "@/constants/theme";

const ADDRESS_ICON: Record<Address["icon"], keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  work: "briefcase-outline",
  other: "location-outline",
};

function GuestCard() {
  return (
    <Card className="mx-5 mt-6 items-center py-8">
      <IconTile name="person-outline" size={56} iconSize={26} rounded="rounded-full" />
      <Text className="mt-4 font-inter-semibold text-base">You're browsing as a guest</Text>
      <Text className="mt-1 px-4 text-center text-sm text-body">
        Sign in to save addresses, track your deliveries and manage your account.
      </Text>
      <Button title="Sign in" className="mt-5 w-full" onPress={() => router.replace("/auth/sign-in")} />
      <Button title="Create an account" variant="ghost" className="mt-1 w-full" onPress={() => router.replace("/auth/sign-up")} />
    </Card>
  );
}

function AddAddressForm({ onAdd, onCancel }: { onAdd: (a: Address) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const valid = label.trim().length > 0 && address.trim().length > 4;
  return (
    <Card tone="tint" className="mt-3">
      <TextField label="Label" placeholder="e.g. Home, Gym, Mum's place" value={label} onChangeText={setLabel} />
      <TextField label="Address" placeholder="Street, area, city" value={address} onChangeText={setAddress} />
      <View className="flex-row gap-3">
        <Button title="Cancel" variant="outline" size="sm" className="flex-1" onPress={onCancel} />
        <Button
          title="Save address"
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
  const avatar = user?.avatar ?? profile.data?.avatar;

  return (
    <Screen edges={[]} background="white">
      <View style={{ paddingBottom: TAB_BAR_SPACE }}>
        <AccountHeader
          title="My profile"
          subtitle="The details that keep you moving."
          onBack={() => router.navigate("/(tabs)")}
        />

        {isGuest ? (
          <GuestCard />
        ) : (
          <QueryState isLoading={profile.isLoading} error={profile.error}>
            <View className="px-5">
              <View className="flex-row items-center gap-4 pb-2 pt-5">
                <Avatar name={name} uri={avatar} size={60} />
                <View className="flex-1">
                  <Text className="font-inter-semibold text-base">{name}</Text>
                  <Text className="mt-1 text-xs text-muted">{maskPhone(phone)}</Text>
                  <Pressable hitSlop={8} onPress={() => router.push("/account/edit-profile")}>
                    <Text className="mt-1.5 font-inter-medium text-xs text-brand">Edit profile</Text>
                  </Pressable>
                </View>
              </View>

              <Text className="mt-4 font-inter-semibold text-sm">Saved addresses</Text>
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
                <ListRow title="Add a new address" trailing={<RowIcon name="add" />} onPress={() => setAdding(true)} />
              )}

              <Text className="mt-4 font-inter-semibold text-sm">Here to help</Text>
              <ListRow
                title="Help & support"
                subtitle="Delivery questions? Talk to us."
                trailing={<RowIcon name="headset-outline" />}
                onPress={() => router.push("/account/support")}
              />
              <ListRow
                title="Settings"
                subtitle="Language, notifications and security"
                trailing={<RowIcon name="options-outline" />}
                onPress={() => router.push("/account/settings")}
              />

              <InfoBanner className="mt-4">Delivering across Colombo, Sri Lanka.</InfoBanner>
            </View>
          </QueryState>
        )}
      </View>
    </Screen>
  );
}
