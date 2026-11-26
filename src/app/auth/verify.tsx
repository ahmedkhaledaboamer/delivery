import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, InfoBanner, OtpInput, Screen, Text } from "@/components/ui";
import { AuthHeader } from "@/components/auth";
import { useSendOtp, useVerifyOtp } from "@/api/hooks";
import { useAppDispatch, useAppSelector } from "@/store";
import { setCredentials } from "@/store/slices/authSlice";
import { setVehicleDetails } from "@/store/slices/driverSlice";
import type { Vehicle } from "@/store/slices/deliverySlice";
import { useT } from "@/i18n";
import { maskPhone } from "@/lib/format";
import { colors } from "@/constants/theme";

const RESEND_SECONDS = 30;

const goBack = () => (router.canGoBack() ? router.back() : router.replace("/auth/sign-in"));

export default function Verify() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { storeName, name, vehicle, plate } = useLocalSearchParams<{
    storeName?: string;
    name?: string;
    vehicle?: Vehicle;
    plate?: string;
  }>();
  const { pendingPhone, role } = useAppSelector((s) => s.auth);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const verify = useVerifyOtp();
  const resend = useSendOtp();

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
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
                name: role === "driver" && name ? name : profile.name,
                email: profile.email,
                avatar: profile.avatar,
                phone,
                role,
                ...(role === "store" ? { storeName: storeName || profile.name } : {}),
              },
            }),
          );
          if (role === "driver") {
            if (vehicle || plate) {
              dispatch(setVehicleDetails({ vehicle: vehicle === "car" ? "car" : "motorcycle", plate: plate ?? "" }));
            }
            router.replace("/driver");
          } else {
            router.replace("/(tabs)");
          }
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
          title={t("auth.verifyNumber")}
          disabled={code.length !== 6 || !pendingPhone}
          loading={verify.isPending}
          onPress={onVerify}
        />
      }
    >
      <AuthHeader title={t("auth.verifyTitle")} subtitle={t("auth.verifySubtitle")} onBack={goBack} />
      <View className="px-5 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <View style={pendingPhone ? { direction: "ltr" } : undefined}>
            <Text className="font-inter-semibold text-sm">{pendingPhone ? maskPhone(pendingPhone) : t("auth.noNumber")}</Text>
          </View>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={goBack}>
            <Text className="font-inter-medium text-xs text-brand">{t("auth.change")}</Text>
          </Pressable>
        </View>

        <OtpInput value={code} onChange={setCode} />
        <Text className="mt-3 text-xs text-muted">{t("auth.codeValid")}</Text>

        {verify.isError && (
          <Text className="mt-2 text-xs text-danger">
            {verify.error.message === "Enter the 6-digit code" ? t("auth.enterCode") : verify.error.message}
          </Text>
        )}
        {resend.isError && <Text className="mt-2 text-xs text-danger">{resend.error.message}</Text>}

        <View className="mt-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-inter-medium text-sm">
              {seconds > 0
                ? t("auth.resendIn", { time: mmss })
                : resend.isPending
                  ? t("auth.sendingCode")
                  : t("auth.didntGet")}
            </Text>
            <Text className="mt-0.5 text-xs text-muted">{t("auth.checkSignal")}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("auth.resendA11y")}
            accessibilityState={{ disabled: !canResend }}
            disabled={!canResend}
            onPress={onResend}
            hitSlop={8}
            className={`h-9 w-9 items-center justify-center rounded-full ${canResend ? "bg-brand-light" : ""}`}
          >
            <Ionicons name="refresh" size={18} color={canResend ? colors.brandDark : colors.muted} />
          </Pressable>
        </View>

        <InfoBanner className="mt-6">{t("auth.neverShare")}</InfoBanner>
      </View>
    </Screen>
  );
}
