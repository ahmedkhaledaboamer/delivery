import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, InfoBanner, OtpInput, Screen, Text } from "@/components/ui";
import { AuthHeader } from "@/components/auth";
import { useSendOtp, useVerifyOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { maskPhone } from "@/lib/format";
import { colors } from "@/constants/theme";

const RESEND_SECONDS = 30;

const goBack = () => (router.canGoBack() ? router.back() : router.replace("/auth/sign-in"));

export default function Verify() {
  const dispatch = useAppDispatch();
  const { storeName } = useLocalSearchParams<{ storeName?: string }>();
  const { pendingPhone, role } = useAppSelector((s) => s.auth);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const verify = useVerifyOtp();
  const resend = useSendOtp();

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const canResend = seconds <= 0 && !resend.isPending && !!pendingPhone;

  const onResend = () => {
    if (!canResend || !pendingPhone) return;
    resend.mutate(pendingPhone, {
      onSuccess: () => {
        setCode("");
        setSeconds(RESEND_SECONDS);
      },
    });
  };

  const onVerify = () => {
    if (!pendingPhone) return;
    const phone = pendingPhone;
    verify.mutate(
      { phone, code },
      {
        onSuccess: ({ token, profile }) => {
          dispatch(
            setCredentials({
              token,
              user: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar,
                phone,
                role,
                ...(role === "store" ? { storeName: storeName || profile.name } : {}),
              },
            }),
          );
          router.replace("/(tabs)");
        },
      },
    );
  };

  const mmss = `00:${String(Math.max(0, seconds)).padStart(2, "0")}`;

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        <Button
          title="Verify number"
          disabled={code.length !== 6 || !pendingPhone}
          loading={verify.isPending}
          onPress={onVerify}
        />
      }
    >
      <AuthHeader title="Verify your number" subtitle="Enter the 6-digit code we sent by SMS." onBack={goBack} />
      <View className="px-5 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="font-inter-semibold text-sm">{pendingPhone ? maskPhone(pendingPhone) : "No number entered"}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={goBack}>
            <Text className="font-inter-medium text-xs text-brand">Change</Text>
          </Pressable>
        </View>

        <OtpInput value={code} onChange={setCode} />
        <Text className="mt-3 text-xs text-muted">The code is valid for 5 minutes.</Text>

        {verify.isError && <Text className="mt-2 text-xs text-danger">{verify.error.message}</Text>}
        {resend.isError && <Text className="mt-2 text-xs text-danger">{resend.error.message}</Text>}

        <View className="mt-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-inter-medium text-sm">
              {seconds > 0 ? `Resend code in ${mmss}` : resend.isPending ? "Sending a new code…" : "Didn't get the code?"}
            </Text>
            <Text className="mt-0.5 text-xs text-muted">Didn't receive it? Check your signal and number.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Resend code"
            accessibilityState={{ disabled: !canResend }}
            disabled={!canResend}
            onPress={onResend}
            hitSlop={8}
            className={`h-9 w-9 items-center justify-center rounded-full ${canResend ? "bg-brand-light" : ""}`}
          >
            <Ionicons name="refresh" size={18} color={canResend ? colors.brandDark : colors.muted} />
          </Pressable>
        </View>

        <InfoBanner className="mt-6">Never share your verification code with anyone, including a rider.</InfoBanner>
      </View>
    </Screen>
  );
}
