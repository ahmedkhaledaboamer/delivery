import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AuthHeader, OrDivider, RoleTabs, SocialButtons, SwitchAuthLine, TextLink } from "@/components/auth";
import { useSendOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { continueAsGuest, startVerification } from "@/store/slices/authSlice";

export default function SignIn() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.role);
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const sendOtp = useSendOtp();
  const isStore = role === "store";
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
          <Button title="Sign in" disabled={!valid} loading={sendOtp.isPending} onPress={submit} />
          <SwitchAuthLine prompt="New to APEX AORA?" action="Create an account" to="/auth/sign-up" />
        </View>
      }
    >
      <AuthHeader
        title="Good to see you again"
        subtitle="Sign in to send, track and manage deliveries."
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/onboarding/welcome"))}
      />
      <View className="px-5 pt-5">
        <View className="mb-5">
          <RoleTabs />
        </View>
        {isStore && (
          <TextField label="Store Name (option)" value={storeName} onChangeText={setStoreName} placeholder="Store name" />
        )}
        <PhoneField label="mobile number" value={phone} onChangeText={setPhone} />
        {sendOtp.isError && <Text className="-mt-2 mb-2 text-xs text-danger">{sendOtp.error.message}</Text>}
        <OrDivider />
        <SocialButtons />
        {isStore && (
          <TextLink
            title="Continue as a guest"
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
