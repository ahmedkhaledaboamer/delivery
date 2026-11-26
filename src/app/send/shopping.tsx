import { Alert, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header, Screen, Text, TextField } from "@/components/ui";
import { ArrowContinueButton, parseAmount } from "@/components/send";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useAppDispatch, useAppSelector } from "@/store";
import { setShopping } from "@/store/slices/deliverySlice";

/** Personal Shopping form (6.png). */
export default function ShoppingScreen() {
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
      Alert.alert("Couldn't open the file picker", "Please try again.");
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
          active ? "border-brand bg-brand-light" : "border-line bg-white"
        }`}
      >
        {active && <Ionicons name="checkmark-circle" size={16} color={colors.brand} />}
        <Text className={`text-sm ${active ? "font-inter-semibold text-brand-dark" : "font-inter-medium text-body"}`}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <Screen
      background="white"
      edges={["bottom"]}
      footer={<ArrowContinueButton disabled={!canContinue} onPress={() => router.push("/send/pickup")} />}
    >
      {/* Curved green header band with the shopping-bag banner from the design. */}
      <LinearGradient
        colors={[colors.brandLight, colors.brandLighter]}
        style={{ borderBottomLeftRadius: 40, borderBottomRightRadius: 40, paddingTop: insets.top, overflow: "hidden" }}
      >
        <Header />
        <View className="px-5">
          <Text className="font-inter-bold text-xl text-brand-dark">Personal Shopping</Text>
          <Text className="mt-1 w-3/5 text-xs text-body">We shop for you & deliver to your location</Text>
        </View>
        <Image source={images.shoppingBanner} resizeMode="contain" style={{ width: "100%", aspectRatio: 3, marginTop: -36 }} />
      </LinearGradient>

      <View className="mt-5 px-5">
        <TextField
          label="Store / Place Name *"
          value={shopping.storeName}
          onChangeText={(storeName) => dispatch(setShopping({ storeName }))}
          placeholder="Enter the store or place you want us to shop from."
          left={<Ionicons name="storefront-outline" size={18} color={colors.brand} style={{ marginRight: 10 }} />}
        />
        <TextField
          label="Describe your shopping request"
          multiline
          value={shopping.request}
          onChangeText={(request) => dispatch(setShopping({ request }))}
          placeholder="What the items you want us to buy, including quantities, sizes, colors, or any specific details."
          maxLength={500}
        />

        <Text className="mb-2 font-inter-medium text-sm">Is the order already paid?</Text>
        <View className="mb-4 flex-row gap-3">
          {paidOption(true, "Already paid")}
          {paidOption(false, "Not paid")}
        </View>

        <TextField
          label="Expected Order Value *"
          value={shopping.expectedValue}
          onChangeText={(t) => dispatch(setShopping({ expectedValue: t.replace(/[^\d.]/g, "") }))}
          placeholder="Enter the estimated total value of your shopping order."
          keyboardType="decimal-pad"
          left={<Text className="mr-2 font-inter-medium text-sm text-body">AED</Text>}
        />

        <Text className="mb-2 font-inter-medium text-sm">
          Attach Order Invoice or Document <Text className="text-xs text-muted">(optional)</Text>
        </Text>
        {shopping.attachmentName ? (
          <View className="flex-row items-center gap-3 rounded-xl border border-brand bg-brand-lighter px-4 py-4">
            <Ionicons name="document-attach-outline" size={20} color={colors.brand} />
            <Text className="flex-1 font-inter-medium text-sm" numberOfLines={1}>
              {shopping.attachmentName}
            </Text>
            <Pressable hitSlop={8} accessibilityLabel="Remove file" onPress={() => dispatch(setShopping({ attachmentName: null }))}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={pickFile}
            className="items-center rounded-xl border border-dashed border-brand bg-brand-lighter py-6 active:opacity-70"
          >
            <Ionicons name="cloud-upload-outline" size={26} color={colors.brand} />
            <Text className="mt-1 font-inter-semibold text-sm text-brand-dark">Upload File</Text>
            <Text className="mt-0.5 text-[11px] text-muted">PDF, JPG, PNG</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}
