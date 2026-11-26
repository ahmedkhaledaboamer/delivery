import { router } from "expo-router";
import { Checkbox, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAgreedToTerms } from "@/store/slices/deliverySlice";
import { useT } from "@/i18n";

/** "I agree to the Terms of Service and Disclaimer..." checkbox bound to the delivery draft. */
export function TermsAgreement({ className = "" }: { className?: string }) {
  const t = useT();
  const dispatch = useAppDispatch();
  const agreed = useAppSelector((s) => s.delivery.agreedToTerms);
  return (
    <Checkbox checked={agreed} onChange={(v) => dispatch(setAgreedToTerms(v))} className={className}>
      <Text className="text-xs leading-5 text-body">
        {t("payment.termsPrefix")}
        <Text className="font-inter-semibold text-xs text-brand" onPress={() => router.push("/account/terms")}>
          {t("payment.termsOfService")}
        </Text>
        {t("payment.termsAnd")}
        <Text className="font-inter-semibold text-xs text-brand" onPress={() => router.push("/account/terms")}>
          {t("payment.disclaimer")}
        </Text>
        {t("payment.termsSuffix")}
      </Text>
    </Checkbox>
  );
}
