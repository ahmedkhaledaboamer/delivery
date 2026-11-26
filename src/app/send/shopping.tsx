import { Alert, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, RadioDot, Screen, Text, TextField } from "@/components/ui";
import { ArrowContinueButton, parseAmount } from "@/components/send";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";
import { useAppDispatch, useAppSelector } from "@/store";
import { setShopping } from "@/store/slices/deliverySlice";

/** Personal Shopping form (6.png). */
export default function ShoppingScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const shopping = useAppSelector((s) => s.delivery.shopping);
  const canContinue = !!shopping.storeName.trim() && parseAmount(shopping.expectedValue) > 0;

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: false,
      });
      if (!res.canceled && res.assets[0]) dispatch(setShopping({ attachmentName: res.assets[0].name }));
    } catch {
      Alert.alert(t("send.pickerErrorTitle"), t("send.pickerErrorBody"));
    }
  };

  const paidOption = (paid: boolean, label: string) => {
    const active = shopping.alreadyPaid === paid;
    return (
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        onPress={() => dispatch(setShopping({ alreadyPaid: paid }))}
        className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-xl border ${
          active ? "border-brand bg-brand-lighter" : "border-line bg-white"
        }`}
      >
        {active && <RadioDot selected />}
        <Text className={`text-sm ${active ? "font-inter-semibold text-ink" : "text-muted"}`}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <Screen
      background="white"
      edges={["bottom"]}
      footer={<ArrowContinueButton disabled={!canContinue} onPress={() => router.push("/send/pickup")} />}
    >
      {/* Curved violet header band with the shopping-bag banner from the design. */}
      <LinearGradient
        colors={[colors.brandLight, colors.brandLighter]}
        style={{ paddingTop: insets.top, overflow: "hidden" }}
      >
        <View className="flex-row items-center ps-5 pt-3">
          <IconButton name="arrow-back" accessibilityLabel={t("common.back")} onPress={() => router.back()} />
          <View className="ms-3 flex-1">
            <Text className="font-inter-bold text-xl">{t("send.shoppingTitle")}</Text>
            <Text className="mt-0.5 text-xs text-body">{t("send.shoppingSub")}</Text>
          </View>
        </View>
        <Image source={images.shoppingBanner} resizeMode="contain" style={{ width: "100%", aspectRatio: 3, marginTop: -40 }} />
      </LinearGradient>

      <View className="-mt-4 rounded-t-3xl bg-white px-5 pt-3">
        <View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
        <TextField
          label={t("send.storeName")}
          hint="required"
          value={shopping.storeName}
          onChangeText={(storeName) => dispatch(setShopping({ storeName }))}
          placeholder={t("send.storeNamePlaceholder")}
          left={<Ionicons name="storefront-outline" size={18} color={colors.brand} style={{ marginEnd: 10 }} />}
        />
        <TextField
          label={t("send.shoppingRequest")}
          hint="required"
          multiline
          value={shopping.request}
          onChangeText={(request) => dispatch(setShopping({ request }))}
          placeholder={t("send.shoppingRequestPlaceholder")}
          maxLength={500}
        />

        <Text className="mb-2 font-inter-medium text-sm">{t("send.alreadyPaidQuestion")}</Text>
        <View className="mb-4 flex-row gap-3">
          {paidOption(true, t("send.alreadyPaid"))}
          {paidOption(false, t("send.notPaid"))}
        </View>

        <TextField
          label={t("send.expectedValue")}
          hint="required"
          value={shopping.expectedValue}
          onChangeText={(v) => dispatch(setShopping({ expectedValue: v.replace(/[^\d.]/g, "") }))}
          placeholder={t("send.expectedValuePlaceholder")}
          keyboardType="decimal-pad"
          left={<Text className="me-2 font-inter-medium text-sm text-body">{t("send.aedPrefix")}</Text>}
        />

        <Text className="mb-2 font-inter-medium text-sm">
          {t("send.attachInvoice")} <Text className="text-xs text-muted">{t("send.optionalParen")}</Text>
        </Text>
        {shopping.attachmentName ? (
          <View className="flex-row items-center gap-3 rounded-xl border border-brand bg-brand-lighter px-4 py-4">
            <Ionicons name="document-attach-outline" size={20} color={colors.brand} />
            <Text className="flex-1 font-inter-medium text-sm" numberOfLines={1}>
              {shopping.attachmentName}
            </Text>
            <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel={t("send.removeFile")} onPress={() => dispatch(setShopping({ attachmentName: null }))}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("send.uploadFile")}
            onPress={pickFile}
            className="items-center rounded-xl border border-brand-light bg-brand-lighter py-6 active:opacity-70"
          >
            <Ionicons name="arrow-up-outline" size={24} color={colors.brandDark} />
            <Text className="mt-1 font-inter-semibold text-sm text-brand-dark">{t("send.uploadFile")}</Text>
            <Text className="mt-0.5 text-[11px] text-muted">{t("send.uploadFileTypes")}</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
