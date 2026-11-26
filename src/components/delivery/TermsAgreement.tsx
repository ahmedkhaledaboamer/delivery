import { router } from "expo-router";
import { Checkbox, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/store";
import { setAgreedToTerms } from "@/store/slices/deliverySlice";

/** "I agree to the Terms of Service and Disclaimer..." checkbox bound to the delivery draft. */
export function TermsAgreement({ className = "" }: { className?: string }) {
  const dispatch = useAppDispatch();
  const agreed = useAppSelector((s) => s.delivery.agreedToTerms);
  return (
    <Checkbox checked={agreed} onChange={(v) => dispatch(setAgreedToTerms(v))} className={className}>
      <Text className="text-xs leading-5 text-body">
        I agree to the{" "}
        <Text className="font-inter-semibold text-xs text-brand" onPress={() => router.push("/account/terms")}>
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text className="font-inter-semibold text-xs text-brand" onPress={() => router.push("/account/terms")}>
          Disclaimer
        </Text>
        , and confirm that Rush is not responsible for the contents of my package.
      </Text>
    </Checkbox>
  );
}
