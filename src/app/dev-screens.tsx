import { Pressable, View } from "react-native";
import { router, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header, PageTitle, Screen, SectionLabel, Text } from "@/components/ui";
import { colors } from "@/constants/theme";
import { useAppDispatch } from "@/store";
import { setStoreOrderType, startFlow, type FlowType } from "@/store/slices/deliverySlice";

/**
 * DEV ONLY — jump straight to any screen to compare it with the Figma design.
 * Opened from the "All screens" button on Home (only visible in development builds).
 */
type Item = { label: string; href: Href; flow?: FlowType; storeMultiple?: boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Onboarding & auth (1.png, 2.png, 3.png)",
    items: [
      { label: "Splash", href: "/onboarding/splash" },
      { label: "Welcome to APEX AORA", href: "/onboarding/welcome" },
      { label: "Pick up / Drop off", href: "/onboarding/pickup-dropoff" },
      { label: "Always in sight", href: "/onboarding/live-tracking" },
      { label: "Sign in", href: "/auth/sign-in" },
      { label: "Sign up", href: "/auth/sign-up" },
      { label: "Verify your number", href: "/auth/verify" },
    ],
  },
  {
    title: "Customer — send / receive (4.png, 5.png)",
    items: [
      { label: "Home", href: "/(tabs)" },
      { label: "Choose service (Frame 94)", href: "/send/service" },
      { label: "Delivery type (Frame 95)", href: "/send/delivery-type", flow: "send" },
      { label: "Pickup location", href: "/send/pickup", flow: "send" },
      { label: "Drop-off location", href: "/send/dropoff", flow: "send" },
      { label: "Confirm your route", href: "/send/confirm-route", flow: "send" },
      { label: "What are you sending?", href: "/send/package", flow: "send" },
      { label: "Ready to send? (review)", href: "/send/review", flow: "send" },
      { label: "Payment Successful", href: "/payment-success?orderId=10428" },
    ],
  },
  {
    title: "Customer — personal shopping (6.png, 7.png)",
    items: [
      { label: "Personal Shopping form", href: "/send/shopping", flow: "shopping" },
      { label: "Confirm route + cost summary", href: "/send/confirm-route", flow: "shopping" },
      { label: "Package (shopping)", href: "/send/package", flow: "shopping" },
      { label: "Review (shopping)", href: "/send/review", flow: "shopping" },
    ],
  },
  {
    title: "Store (8.png, 9.png)",
    items: [
      { label: "Create Delivery Request", href: "/store/create-request" },
      { label: "Order #1", href: "/store/order-details?index=0", storeMultiple: true },
      { label: "Order #2", href: "/store/order-details?index=1", storeMultiple: true },
      { label: "Confirm route (multiple)", href: "/store/confirm-route", storeMultiple: true },
      { label: "Order Confirmed", href: "/store/order-confirmed", storeMultiple: true },
    ],
  },
  {
    title: "Orders (10.png)",
    items: [
      { label: "My orders", href: "/(tabs)/orders" },
      { label: "Tracking — rider on the way", href: "/orders/10428/track" },
      { label: "Delivered + rating", href: "/orders/10390/delivered" },
      { label: "Order details", href: "/orders/10431" },
      { label: "Cancel this delivery", href: "/orders/10431/cancel" },
    ],
  },
  {
    title: "Account (11.png, 12.png, 13.png)",
    items: [
      { label: "My profile", href: "/(tabs)/profile" },
      { label: "Edit profile", href: "/account/edit-profile" },
      { label: "Settings", href: "/account/settings" },
      { label: "Choose your language", href: "/account/language" },
      { label: "Notifications", href: "/notifications" },
      { label: "About APEX AORA", href: "/account/about" },
      { label: "Privacy Policy", href: "/account/privacy" },
      { label: "Terms of Service", href: "/account/terms" },
      { label: "My Wallet", href: "/account/wallet" },
      { label: "Loyalty Point", href: "/account/loyalty" },
      { label: "Support Tickets", href: "/account/support" },
      { label: "Create New Ticket", href: "/account/new-ticket" },
    ],
  },
  {
    title: "Driver",
    items: [
      { label: "Driver jobs", href: "/driver" },
      { label: "Driver earnings", href: "/driver/earnings" },
      { label: "Driver profile", href: "/driver/profile" },
    ],
  },
  {
    title: "Location",
    items: [{ label: "Location picker (pickup)", href: "/location-picker?target=pickup" }],
  },
];

export default function DevScreens() {
  const dispatch = useAppDispatch();

  const open = (item: Item) => {
    if (item.storeMultiple) {
      dispatch(startFlow("store"));
      dispatch(setStoreOrderType("multiple"));
    } else if (item.flow) {
      dispatch(startFlow(item.flow));
    }
    router.push(item.href);
  };

  return (
    <Screen>
      <Header />
      <PageTitle title="All screens" subtitle="Development only — tap a screen to open it directly." className="mb-4" />
      <View className="px-5">
        {SECTIONS.map((s) => (
          <View key={s.title} className="mb-5">
            <SectionLabel>{s.title}</SectionLabel>
            <View className="overflow-hidden rounded-2xl border border-line bg-white">
              {s.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={() => open(item)}
                  className={`flex-row items-center justify-between px-4 py-3.5 active:bg-brand-lighter ${
                    i < s.items.length - 1 ? "border-b border-line" : ""
                  }`}
                >
                  <Text className="text-sm">{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}
