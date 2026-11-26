import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, PhoneField, Screen, Text, TextField, isValidPhone } from "@/components/ui";
import { AuthHeader, LicenceUpload, OrDivider, RoleTabs, SocialButtons, SwitchAuthLine, TextLink } from "@/components/auth";
import { useSendOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { continueAsGuest, startVerification } from "@/store/slices/authSlice";

export default function SignUp() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.role);
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [licence, setLicence] = useState("");
  const [licencePhoto, setLicencePhoto] = useState<string | null>(null);
  const sendOtp = useSendOtp();
  const isStore = role === "store";
  const valid = isValidPhone(phone) && (!isStore || (storeName.trim().length > 1 && licence.trim().length > 3 && !!licencePhoto));

  const submit = () => {
    const full = `+971 ${phone.trim()}`;
    sendOtp.mutate(full, {
      onSuccess: () => {
        dispatch(startVerification({ phone: full, mode: "sign-up" }));
        router.push({ pathname: "/auth/verify", params: isStore ? { storeName: storeName.trim() } : {} });
      },
    });
  };

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        <View>
          <Button title="Create account" disabled={!valid} loading={sendOtp.isPending} onPress={submit} />
          <TextLink
            title="Continue as a guest"
            onPress={() => {
              dispatch(continueAsGuest());
              router.replace("/(tabs)");
            }}
          />
          <SwitchAuthLine prompt="Already have an account?" action="Sign in" to="/auth/sign-in" />
        </View>
      }
    >
      <AuthHeader
        title="Let's get you moving"
        subtitle="Create your RUSH account in a few simple steps."
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/auth/sign-in"))}
      />
      <View className="px-5 pt-5">
        <View className="mb-5">
          <RoleTabs />
        </View>
        {isStore && <TextField label="Store Name" value={storeName} onChangeText={setStoreName} placeholder="Store name" />}
        <PhoneField label="mobile number" value={phone} onChangeText={setPhone} />
        {isStore && (
          <>
            <TextField
              label="Licence number"
              value={licence}
              onChangeText={setLicence}
              placeholder="Trade licence number"
              autoCapitalize="characters"
            />
            <LicenceUpload uri={licencePhoto} onChange={setLicencePhoto} />
          </>
        )}
        {sendOtp.isError && <Text className="-mt-2 mb-2 text-xs text-danger">{sendOtp.error.message}</Text>}
        {!isStore && (
          <>
            <OrDivider />
            <SocialButtons />
          </>
        )}
      </View>
    </Screen>
  );
}
