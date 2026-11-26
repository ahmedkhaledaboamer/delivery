import { useState } from "react";
import { Image, View } from "react-native";
import { router } from "expo-router";
import { Button, OptionCard, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AuthHeader, LicenceUpload, OrDivider, RoleTabs, SocialButtons, SwitchAuthLine, TextLink } from "@/components/auth";
import { useSendOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { continueAsGuest, startVerification } from "@/store/slices/authSlice";
import type { Vehicle } from "@/store/slices/deliverySlice";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

export default function SignUp() {
  const t = useT();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.role);
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [licence, setLicence] = useState("");
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle>("motorcycle");
  const [plate, setPlate] = useState("");
  const sendOtp = useSendOtp();
  const isStore = role === "store";
  const isDriver = role === "driver";
  const valid =
    isValidPhone(phone) &&
    (!isStore || (storeName.trim().length > 1 && licence.trim().length > 3 && !!licencePhoto)) &&
    (!isDriver || (fullName.trim().length > 1 && plate.trim().length > 2));

  const params = (): Record<string, string> => {
    if (isStore) return { storeName: storeName.trim() };
    if (isDriver) return { name: fullName.trim(), vehicle, plate: plate.trim().toUpperCase() };
    return {};
  };

  const submit = () => {
    const full = `+971 ${phone.trim()}`;
    sendOtp.mutate(full, {
      onSuccess: () => {
        dispatch(startVerification({ phone: full, mode: "sign-up" }));
        router.push({ pathname: "/auth/verify", params: params() });
      },
    });
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        <View>
          <Button title={t("auth.createAccount")} disabled={!valid} loading={sendOtp.isPending} onPress={submit} />
          {!isDriver && (
            <TextLink
              title={t("auth.continueGuest")}
              onPress={() => {
                dispatch(continueAsGuest());
                router.replace("/(tabs)");
              }}
            />
          )}
          <SwitchAuthLine prompt={t("auth.haveAccount")} action={t("auth.signIn")} to="/auth/sign-in" />
        </View>
      }
    >
      <AuthHeader
        title={t("auth.signUpTitle")}
        subtitle={isDriver ? t("auth.driverSignUpSubtitle") : t("auth.signUpSubtitle")}
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/auth/sign-in"))}
      />
      <View className="px-5 pt-5">
        <View className="mb-5">
          <RoleTabs />
        </View>
        {isStore && (
          <TextField label={t("auth.storeName")} value={storeName} onChangeText={setStoreName} placeholder={t("auth.storeName")} />
        )}
        {isDriver && (
          <TextField
            label={t("common.fullName")}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t("auth.fullNamePlaceholder")}
            autoCapitalize="words"
          />
        )}
        <PhoneField label={t("auth.mobileNumber")} value={phone} onChangeText={setPhone} />
        {isStore && (
          <>
            <TextField
              label={t("auth.licenceNumber")}
              value={licence}
              onChangeText={setLicence}
              placeholder={t("auth.licencePlaceholder")}
              autoCapitalize="characters"
            />
            <LicenceUpload uri={licencePhoto} onChange={setLicencePhoto} />
          </>
        )}
        {isDriver && (
          <>
            <Text className="mb-2 font-inter-medium text-sm">{t("auth.vehicleType")}</Text>
            <View className="mb-4 flex-row gap-3">
              <OptionCard
                selected={vehicle === "motorcycle"}
                onPress={() => setVehicle("motorcycle")}
                title={t("auth.motorcycle")}
                description={t("auth.motorcycleDesc")}
                media={<Image source={images.scooter} resizeMode="contain" style={{ width: 80, height: 52 }} />}
              />
              <OptionCard
                selected={vehicle === "car"}
                onPress={() => setVehicle("car")}
                title={t("auth.car")}
                description={t("auth.carDesc")}
                media={<Image source={images.car} resizeMode="contain" style={{ width: 80, height: 52 }} />}
              />
            </View>
            <TextField
              label={t("auth.plateNumber")}
              value={plate}
              onChangeText={setPlate}
              placeholder={t("auth.platePlaceholder")}
              autoCapitalize="characters"
            />
          </>
        )}
        {sendOtp.isError && <Text className="-mt-2 mb-2 text-xs text-danger">{sendOtp.error.message}</Text>}
        {!isStore && !isDriver && (
          <>
            <OrDivider />
            <SocialButtons />
          </>
        )}
      </View>
    </Screen>
  );
}
