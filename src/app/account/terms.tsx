import { Image, View } from "react-native";
import { Header, Screen, Text } from "@/components/ui";
import { images } from "@/constants/images";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Responsibility for Shipments",
    body:
      "APEX AORA acts as an intermediary between customers and delivery drivers. We are not responsible for the contents of " +
      "packages sent through our platform.",
  },
  {
    title: "Prohibited Items",
    body:
      "Users are prohibited from sending illegal, dangerous, hazardous, prohibited, or restricted items through the service.",
  },
  {
    title: "Package Contents",
    body:
      "The sender is solely responsible for ensuring that the package contents are lawful, properly packed, and accurately declared.",
  },
  {
    title: "Loss or Damage",
    body:
      "APEX AORA shall not be held liable for loss, damage, theft, leakage, or any consequences arising from the contents of a " +
      "shipment, improper packaging, or inaccurate information provided by the sender.",
  },
  {
    title: "Legal Compliance",
    body:
      "The sender assumes full responsibility for any legal consequences, claims, penalties, or disputes related to the " +
      "contents of the shipment.",
  },
  {
    title: "Acceptance of Terms",
    body:
      "By proceeding with your shipment, you confirm that you have read, understood, and agreed to this disclaimer.",
  },
];

export default function TermsScreen() {
  return (
    <Screen background="white">
      <Header inlineTitle="Help & Support" actions />

      <View className="px-5 pt-2">
        <View className="flex-row items-center gap-3">
          <Text className="flex-1 font-inter-bold text-[22px] leading-7">Terms of Service &amp; Disclaimer</Text>
          <Image source={images.clipboard} resizeMode="contain" style={{ width: 96, height: 76 }} />
        </View>

        <Text className="mt-4 font-inter-bold text-base text-brand">Important Notice</Text>
        <Text className="mt-1 text-xs leading-5 text-brand-dark">
          By using APEX AORA delivery services, you acknowledge and agree to the following terms and conditions.
        </Text>

        {SECTIONS.map((s, i) => (
          <View key={s.title} className="mt-5">
            <Text className="font-inter-bold text-[15px]">
              {i + 1}. {s.title}
            </Text>
            <Text className="mt-1 text-sm leading-6 text-ink">{s.body}</Text>
          </View>
        ))}

        <View className="mt-6 pb-4">
          <Text className="font-inter-bold text-[15px]">APEX AORA Delivery Services</Text>
          <Text className="mt-1 text-sm text-ink">Delivering with care, moving with trust.</Text>
        </View>
      </View>
    </Screen>
  );
}
