import { useState } from "react";
import { Alert, Image, Modal, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, Header, RadioDot, Screen, Text, TextField } from "@/components/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useCreateTicket } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";
import { useT } from "@/i18n";

/** `value` is what's sent to the API (stable English); `labelKey` is what's shown. */
const ISSUE_TYPES: { value: string; labelKey: string }[] = [
  { value: "Order Issue", labelKey: "account.issueOrder" },
  { value: "Payment & Refund", labelKey: "account.issuePayment" },
  { value: "Account Issue", labelKey: "account.issueAccount" },
  { value: "App & Technical", labelKey: "account.issueTechnical" },
  { value: "Rider Behaviour", labelKey: "account.issueRider" },
  { value: "Other", labelKey: "account.issueOther" },
];
const MAX_DESCRIPTION = 500;
const MAX_ATTACHMENTS = 5;

type Attachment = { uri: string; name: string };

function IssueTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const selected = ISSUE_TYPES.find((i) => i.value === value);
  return (
    <View className="mb-4">
      <Text className="mb-2 font-inter-medium text-sm">{t("account.issueType")}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("account.selectIssueType")}
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center gap-3 rounded-xl border border-line bg-white px-4"
      >
        <Ionicons name="cube-outline" size={18} color={colors.brandDark} />
        <Text className={`flex-1 text-sm ${value ? "text-ink" : "text-muted"}`}>{selected ? t(selected.labelKey) : t("account.selectIssueType")}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.body} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-3xl bg-white px-5 pb-10 pt-3" onPress={() => {}}>
            <View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
            <Text className="mb-2 font-inter-bold text-base">{t("account.selectIssueType")}</Text>
            {ISSUE_TYPES.map((it) => (
              <Pressable
                key={it.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: it.value === value }}
                onPress={() => {
                  onChange(it.value);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-line py-4"
              >
                <Text className="font-inter-medium text-sm">{t(it.labelKey)}</Text>
                <RadioDot selected={it.value === value} />
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function RelatedOption({ selected, label, icon, onPress }: { selected: boolean; label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-12 flex-1 flex-row items-center gap-2 rounded-xl border px-3 ${selected ? "border-brand bg-brand-lighter" : "border-line bg-white"}`}
    >
      <Ionicons name={icon} size={16} color={selected ? colors.brand : colors.body} />
      <Text className="flex-1 font-inter-medium text-sm">{label}</Text>
      <RadioDot selected={selected} />
    </Pressable>
  );
}

export default function NewTicketScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ issueType?: string }>();
  const createTicket = useCreateTicket();

  const [issueType, setIssueType] = useState(params.issueType && ISSUE_TYPES.some((i) => i.value === params.issueType) ? params.issueType : "");
  const [relatedTo, setRelatedTo] = useState<"order" | "account">("order");
  const [orderNumber, setOrderNumber] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const canSubmit = issueType.length > 0 && description.trim().length > 0;

  const pickAttachments = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t("account.permissionNeeded"), t("account.attachPermission"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_ATTACHMENTS - attachments.length,
      quality: 0.7,
    });
    if (res.canceled) return;
    const picked = res.assets.map((a, i) => ({ uri: a.uri, name: a.fileName ?? `photo-${Date.now()}-${i}.jpg` }));
    setAttachments((prev) => [...prev, ...picked].slice(0, MAX_ATTACHMENTS));
  };

  const submit = () => {
    createTicket.mutate(
      {
        issueType,
        relatedTo,
        orderNumber: relatedTo === "order" && orderNumber.trim() ? orderNumber.trim() : undefined,
        description: description.trim(),
        // TODO: upload the files themselves once the support API accepts attachments.
        attachmentNames: attachments.map((a) => a.name),
      },
      {
        onSuccess: () => {
          Alert.alert(t("account.ticketSubmitted"), t("account.ticketSubmittedBody"));
          router.back();
        },
        onError: (e) => Alert.alert(t("account.couldntSubmit"), e instanceof Error ? e.message : t("account.tryAgain")),
      },
    );
  };

  return (
    <Screen
      footer={
        <Button title={t("account.submitTicket")} icon="paper-plane-outline" disabled={!canSubmit} loading={createTicket.isPending} onPress={submit} />
      }
    >
      <LinearGradient colors={[colors.brandLighter, colors.brandLight]}>
        <Header inlineTitle={t("account.createNewTicket")} actions />
        <View className="flex-row items-center px-5 pb-8">
          <View className="flex-1 pe-2">
            <Text className="font-inter-bold text-2xl text-brand-dark">{t("account.tellUsIssue")}</Text>
            <Text className="mt-1 text-xs leading-5 text-body">{t("account.tellUsIssueSub")}</Text>
          </View>
          <Image source={images.headset} resizeMode="contain" style={{ width: 100, height: 80 }} />
        </View>
      </LinearGradient>

      {/* White form panel overlapping the tinted header */}
      <View className="-mt-5 rounded-t-3xl bg-white px-5 pt-5">

        <IssueTypeSelect value={issueType} onChange={setIssueType} />

        <Text className="mb-2 font-inter-medium text-sm">
          {t("account.relatedTo")}<Text className="text-xs text-muted">{t("common.optionalSuffix")}</Text>
        </Text>
        <View className="mb-4 flex-row gap-3">
          <RelatedOption selected={relatedTo === "order"} label={t("account.order")} icon="cube-outline" onPress={() => setRelatedTo("order")} />
          <RelatedOption selected={relatedTo === "account"} label={t("account.account")} icon="person-outline" onPress={() => setRelatedTo("account")} />
        </View>

        {relatedTo === "order" && (
          <TextField
            label={t("account.orderNumber")}
            hint="optional"
            placeholder={t("account.orderNumberPlaceholder")}
            value={orderNumber}
            onChangeText={setOrderNumber}
            autoCapitalize="characters"
            left={<Text className="me-2 font-inter-semibold text-sm text-muted">#</Text>}
          />
        )}

        <TextField
          label={t("account.describeIssue")}
          placeholder={t("account.describeIssuePlaceholder")}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={MAX_DESCRIPTION}
          showCounter
          style={{ minHeight: 110 }}
        />

        <Text className="mb-2 font-inter-medium text-sm">
          {t("account.attachments")}<Text className="text-xs text-muted">{t("common.optionalSuffix")}</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={pickAttachments}
          disabled={attachments.length >= MAX_ATTACHMENTS}
          className={`items-center rounded-xl border border-dashed border-brand bg-white py-5 ${attachments.length >= MAX_ATTACHMENTS ? "opacity-50" : "active:opacity-70"}`}
        >
          <Ionicons name="image-outline" size={24} color={colors.brandDark} />
          <Text className="mt-1 font-inter-medium text-sm">{t("account.uploadFiles")}</Text>
          <Text className="mt-0.5 text-[11px] text-muted">{t("account.uploadHint")}</Text>
        </Pressable>

        {attachments.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-3">
            {attachments.map((a) => (
              <View key={a.uri}>
                <Image source={{ uri: a.uri }} style={{ width: 64, height: 64, borderRadius: 12 }} />
                <Pressable
                  accessibilityLabel={t("account.removeAttachment")}
                  hitSlop={6}
                  onPress={() => setAttachments((prev) => prev.filter((x) => x.uri !== a.uri))}
                  className="absolute -end-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-ink"
                >
                  <Ionicons name="close" size={12} color={colors.white} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
