import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card, DirIcon, Text } from "@/components/ui";
import { useT } from "@/i18n";
import { colors } from "@/constants/theme";
import { formatAED } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPromoCode, setUseLoyaltyPoints } from "@/store/slices/deliverySlice";
import { PROMO_DISCOUNT } from "@/lib/pricing";

/** Discount from the current draft (promo code + loyalty points). */
export function useDraftDiscount() {
  const { promoCode, useLoyaltyPoints } = useAppSelector((s) => s.delivery);
  return (promoCode ? PROMO_DISCOUNT : 0) + (useLoyaltyPoints ? PROMO_DISCOUNT : 0);
}

function Row({
  icon,
  title,
  subtitle,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 rounded-xl bg-white px-3 py-3 active:opacity-70">
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-light">
        <Ionicons name={icon} size={18} color={colors.brand} />
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-sm">{title}</Text>
        <Text className="text-[11px] text-muted">{subtitle}</Text>
      </View>
      <DirIcon name={active ? "checkmark-circle" : "chevron-forward"} size={18} color={active ? colors.brand : colors.body} />
    </Pressable>
  );
}

/** "Offers & Rewards" block: promo code + redeem loyalty points + Total Discount. */
export function OffersRewards() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { promoCode, useLoyaltyPoints } = useAppSelector((s) => s.delivery);
  const discount = useDraftDiscount();
  const [editing, setEditing] = useState(false);
  const [code, setCode] = useState(promoCode ?? "");

  return (
    <Card tone="tint">
      <View className="mb-3 flex-row items-center gap-2">
        <Ionicons name="gift-outline" size={18} color={colors.brand} />
        <Text className="font-inter-semibold text-sm">{t("payment.offersTitle")}</Text>
      </View>
      <View className="gap-2">
        <Row
          icon="pricetag-outline"
          title={promoCode ? t("payment.promoApplied", { code: promoCode }) : t("payment.applyPromo")}
          subtitle={promoCode ? t("payment.tapToRemove") : t("payment.haveCode")}
          active={!!promoCode}
          onPress={() => {
            if (promoCode) {
              dispatch(setPromoCode(null));
              setCode("");
            } else setEditing((e) => !e);
          }}
        />
        {editing && !promoCode && (
          <View className="flex-row gap-2">
            <TextInput
              autoFocus
              autoCapitalize="characters"
              placeholder={t("payment.enterCode")}
              placeholderTextColor={colors.muted}
              value={code}
              onChangeText={setCode}
              className="h-11 flex-1 rounded-xl border border-line bg-white px-3 font-inter text-sm text-ink"
            />
            <Pressable
              onPress={() => {
                if (!code.trim()) return Alert.alert(t("payment.enterPromo"));
                dispatch(setPromoCode(code.trim().toUpperCase()));
                setEditing(false);
              }}
              className="h-11 items-center justify-center rounded-xl bg-brand px-4"
            >
              <Text className="font-inter-semibold text-sm text-white">{t("payment.apply")}</Text>
            </Pressable>
          </View>
        )}
        <Row
          icon="ribbon-outline"
          title={t("payment.redeemPoints")}
          subtitle={useLoyaltyPoints ? t("payment.pointsApplied") : t("payment.pointsHint")}
          active={useLoyaltyPoints}
          onPress={() => dispatch(setUseLoyaltyPoints(!useLoyaltyPoints))}
        />
      </View>
      <View className="mt-3 flex-row items-center justify-between border-t border-brand-light pt-3">
        <Text className="font-inter-semibold text-sm">{t("payment.totalDiscount")}</Text>
        <Text className="font-inter-bold text-sm">{formatAED(discount)}</Text>
      </View>
    </Card>
  );
}
