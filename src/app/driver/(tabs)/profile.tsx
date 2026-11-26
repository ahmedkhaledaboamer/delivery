import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, ListRow, SegmentedTabs, TAB_BAR_SPACE, Text, TextField } from "@/components/ui";
import { AvatarPicker, RowIcon } from "@/components/account";
import { DriverHeader, useDriverState, vehicleIcon, vehicleLabel } from "@/components/driver";
import { useT, useLanguage } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, updateUser } from "@/store/slices/authSlice";
import { resetDriver, setVehicleDetails } from "@/store/slices/driverSlice";
import type { Vehicle } from "@/store/slices/deliverySlice";

function VehicleForm({
  vehicle,
  plate,
  onSave,
  onCancel,
}: {
  vehicle: Vehicle;
  plate: string;
  onSave: (v: { vehicle: Vehicle; plate: string }) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [v, setV] = useState<Vehicle>(vehicle);
  const [p, setP] = useState(plate);
  const valid = p.trim().length >= 3;
  return (
    <Card tone="tint" className="mt-3">
      <Text className="mb-2 font-inter-medium text-sm">{t("driver.vehicleType")}</Text>
      <SegmentedTabs<Vehicle>
        value={v}
        onChange={setV}
        options={[
          { value: "motorcycle", label: vehicleLabel(t, "motorcycle"), icon: vehicleIcon("motorcycle") },
          { value: "car", label: vehicleLabel(t, "car"), icon: vehicleIcon("car") },
        ]}
      />
      <TextField
        containerClassName="mt-4"
        label={t("driver.plate")}
        hint="required"
        placeholder={t("driver.platePlaceholder")}
        value={p}
        onChangeText={(x) => setP(x.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={16}
        style={{ writingDirection: "ltr" }}
      />
      <View className="flex-row gap-3">
        <Button title={t("common.cancel")} variant="outline" size="sm" className="flex-1" onPress={onCancel} />
        <Button
          title={t("common.save")}
          size="sm"
          className="flex-1"
          disabled={!valid}
          onPress={() => onSave({ vehicle: v, plate: p.trim() })}
        />
      </View>
    </Card>
  );
}

export default function DriverProfileScreen() {
  const t = useT();
  const lang = useLanguage();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { vehicle, plate, activeOrderId } = useDriverState();
  const [editing, setEditing] = useState(false);

  const name = user?.name ?? "";
  const phone = user?.phone ?? "";

  const signOut = () => {
    if (activeOrderId) {
      Alert.alert(t("driver.busyTitle"), t("driver.signOutBusy"));
      return;
    }
    Alert.alert(t("driver.signOutTitle"), t("driver.signOutBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("driver.signOut"),
        style: "destructive",
        onPress: () => {
          dispatch(resetDriver());
          dispatch(logout());
          router.replace("/auth/sign-in");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <DriverHeader title={t("driver.profileTitle")} subtitle={t("driver.profileSubtitle")} />

        <View className="px-5">
          <View className="flex-row items-center gap-4 pb-2 pt-5">
            <AvatarPicker name={name} uri={user?.avatar} size={64} onChange={(uri) => void dispatch(updateUser({ avatar: uri }))} />
            <View className="flex-1">
              <Text className="font-inter-semibold text-base">{name || t("driver.rider")}</Text>
              <View style={{ direction: "ltr" }} className="self-start">
                <Text className="mt-1 text-xs text-muted">{phone}</Text>
              </View>
              <View className="mt-1.5 flex-row items-center gap-1.5">
                <View className="rounded-full bg-brand-light px-2 py-0.5">
                  <Text className="font-inter-semibold text-[10px] text-brand-dark">{t("driver.riderBadge")}</Text>
                </View>
                <Text className="text-xs text-body">★ 4.9</Text>
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-sm">{t("driver.vehicleSection")}</Text>
            {!editing && (
              <Pressable hitSlop={8} onPress={() => setEditing(true)}>
                <Text className="font-inter-medium text-xs text-brand">{t("common.edit")}</Text>
              </Pressable>
            )}
          </View>
          {editing ? (
            <VehicleForm
              vehicle={vehicle}
              plate={plate}
              onCancel={() => setEditing(false)}
              onSave={(v) => {
                dispatch(setVehicleDetails(v));
                setEditing(false);
              }}
            />
          ) : (
            <>
              <ListRow
                title={t("driver.vehicleType")}
                subtitle={vehicleLabel(t, vehicle)}
                trailing={<RowIcon name={vehicleIcon(vehicle)} />}
                onPress={() => setEditing(true)}
              />
              <ListRow
                title={t("driver.plate")}
                subtitle={plate || t("driver.noPlate")}
                trailing={<RowIcon name="card-outline" />}
                onPress={() => setEditing(true)}
              />
            </>
          )}

          <Text className="mt-6 font-inter-semibold text-sm">{t("driver.preferences")}</Text>
          <ListRow
            title={t("driver.language")}
            subtitle={lang === "ar" ? "العربية" : "English"}
            trailing={<RowIcon name="language-outline" />}
            onPress={() => router.push("/account/language")}
          />
          <ListRow
            title={t("common.helpSupport")}
            subtitle={t("driver.supportSub")}
            trailing={<RowIcon name="headset-outline" />}
            onPress={() => router.push("/account/support")}
          />

          <Button title={t("driver.signOut")} variant="danger" icon="log-out-outline" className="mt-8" onPress={signOut} />
        </View>
      </ScrollView>
    </View>
  );
}
