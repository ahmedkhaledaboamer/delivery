import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AuthHeader, OrDivider, RoleTabs, SocialButtons, SwitchAuthLine, TextLink } from "@/components/auth";
import { useSendOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { continueAsGuest, startVerification } from "@/store/slices/authSlice";
import { useT } from "@/i18n";

export default function SignIn() {
  const t = useT();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.role);
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const sendOtp = useSendOtp();
  const isStore = role === "store";
  const isDriver = role === "driver";
  const valid = isValidPhone(phone);

  const submit = () => {
    const full = `+971 ${phone.trim()}`;
    sendOtp.mutate(full, {
      onSuccess: () => {
        dispatch(startVerification({ phone: full, mode: "sign-in" }));
        router.push({ pathname: "/auth/verify", params: isStore && storeName.trim() ? { storeName: storeName.trim() } : {} });
      },
    });
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        <View>
          <Button title={t("auth.signIn")} disabled={!valid} loading={sendOtp.isPending} onPress={submit} />
          <SwitchAuthLine prompt={t("auth.newHere")} action={t("auth.createAccountLink")} to="/auth/sign-up" />
        </View>
      }
    >
      <AuthHeader
        title={t("auth.signInTitle")}
        subtitle={isDriver ? t("auth.driverSignInSubtitle") : t("auth.signInSubtitle")}
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/welcome"))}
      />
      <View className="px-5 pt-5">
        <View className="mb-5">
          <RoleTabs />
        </View>
        {isStore && (
          <TextField
            label={t("auth.storeNameOptional")}
            value={storeName}
            onChangeText={setStoreName}
            placeholder={t("auth.storeName")}
          />
        )}
        <PhoneField label={t("auth.mobileNumber")} value={phone} onChangeText={setPhone} />
        {sendOtp.isError && <Text className="-mt-2 mb-2 text-xs text-danger">{sendOtp.error.message}</Text>}
        {!isDriver && (
          <>
            <OrDivider />
            <SocialButtons />
          </>
        )}
        {isStore && (
          <TextLink
            title={t("auth.continueGuest")}
            onPress={() => {
              dispatch(continueAsGuest());
              router.replace("/(tabs)");
            }}
          />
        )}
      </View>
    </Screen>
  );
}
