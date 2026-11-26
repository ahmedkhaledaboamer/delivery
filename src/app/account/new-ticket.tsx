import { useState } from "react";
import { Alert, Image, Modal, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Button, Header, RadioDot, Screen, Text, TextField } from "@/components/ui";
import { IconTile } from "@/components/account";
import { useCreateTicket } from "@/api/hooks";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

const ISSUE_TYPES = ["Order Issue", "Payment & Refund", "Account Issue", "App & Technical", "Rider Behaviour", "Other"];
const MAX_DESCRIPTION = 500;
const MAX_ATTACHMENTS = 5;

type Attachment = { uri: string; name: string };

function IssueTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="mb-4">
      <Text className="mb-2 font-inter-medium text-sm">Issue Type</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select issue type"
        onPress={() => setOpen(true)}
        className="h-14 flex-row items-center gap-3 rounded-xl border border-line bg-white px-4"
      >
        <Ionicons name="list-outline" size={18} color={colors.muted} />
        <Text className={`flex-1 text-sm ${value ? "text-ink" : "text-muted"}`}>{value || "Select issue type"}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.body} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-3xl bg-white px-5 pb-10 pt-3" onPress={() => {}}>
            <View className="mb-4 h-1 w-12 self-center rounded-full bg-line" />
            <Text className="mb-2 font-inter-bold text-base">Select issue type</Text>
            {ISSUE_TYPES.map((t) => (
              <Pressable
                key={t}
                accessibilityRole="radio"
                accessibilityState={{ selected: t === value }}
                onPress={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-line py-4"
              >
                <Text className="font-inter-medium text-sm">{t}</Text>
                <RadioDot selected={t === value} />
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
  const params = useLocalSearchParams<{ issueType?: string }>();
  const createTicket = useCreateTicket();

  const [issueType, setIssueType] = useState(params.issueType && ISSUE_TYPES.includes(params.issueType) ? params.issueType : "");
  const [relatedTo, setRelatedTo] = useState<"order" | "account">("order");
  const [orderNumber, setOrderNumber] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const canSubmit = issueType.length > 0 && description.trim().length > 0;

  const pickAttachments = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to attach screenshots.");
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
          Alert.alert("Ticket submitted", "We'll get back to you soon.");
          router.back();
        },
        onError: (e) => Alert.alert("Couldn't submit", e instanceof Error ? e.message : "Please try again."),
      },
    );
  };

  return (
    <Screen
      footer={
        <Button title="Submit Ticket" icon="paper-plane-outline" disabled={!canSubmit} loading={createTicket.isPending} onPress={submit} />
      }
    >
      <Header inlineTitle="Create New Ticket" actions />

      <View className="px-5 pt-2">
        <View className="mb-5 flex-row items-center rounded-2xl bg-brand-lighter p-4">
          <View className="flex-1 pr-2">
            <Text className="font-inter-bold text-xl text-brand-dark">Tell us about your issue</Text>
            <Text className="mt-1 text-xs leading-5 text-body">Create a support ticket and our team will get back to you shortly.</Text>
          </View>
          <Image source={images.headset} resizeMode="contain" style={{ width: 90, height: 72 }} />
        </View>

        <IssueTypeSelect value={issueType} onChange={setIssueType} />

        <Text className="mb-2 font-inter-medium text-sm">Related To</Text>
        <View className="mb-4 flex-row gap-3">
          <RelatedOption selected={relatedTo === "order"} label="Order" icon="cube-outline" onPress={() => setRelatedTo("order")} />
          <RelatedOption selected={relatedTo === "account"} label="Account" icon="person-outline" onPress={() => setRelatedTo("account")} />
        </View>

        {relatedTo === "order" && (
          <TextField
            label="Order Number"
            hint="optional"
            placeholder="e.g. RS-78451"
            value={orderNumber}
            onChangeText={setOrderNumber}
            autoCapitalize="characters"
          />
        )}

        <TextField
          label="Describe the issue"
          placeholder="Write the details of your issue..."
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={MAX_DESCRIPTION}
          showCounter
          style={{ minHeight: 110 }}
        />

        <Text className="mb-2 font-inter-medium text-sm">
          Attachments<Text className="text-xs text-muted"> (Optional)</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={pickAttachments}
          disabled={attachments.length >= MAX_ATTACHMENTS}
          className={`items-center rounded-xl border border-dashed border-brand bg-brand-lighter py-5 ${attachments.length >= MAX_ATTACHMENTS ? "opacity-50" : "active:opacity-70"}`}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={colors.brand} />
          <Text className="mt-1 font-inter-medium text-sm">Upload photos or files</Text>
          <Text className="mt-0.5 text-[11px] text-muted">PNG, JPG · up to {MAX_ATTACHMENTS} files</Text>
        </Pressable>

        {attachments.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-3">
            {attachments.map((a) => (
              <View key={a.uri}>
                <Image source={{ uri: a.uri }} style={{ width: 64, height: 64, borderRadius: 12 }} />
                <Pressable
                  accessibilityLabel="Remove attachment"
                  hitSlop={6}
                  onPress={() => setAttachments((prev) => prev.filter((x) => x.uri !== a.uri))}
                  className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-ink"
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
