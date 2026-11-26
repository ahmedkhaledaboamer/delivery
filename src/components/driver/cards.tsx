import { Alert, Linking, Pressable, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, DirIcon, RouteStops, Text } from "@/components/ui";
import { useT } from "@/i18n";
import { brandGradient, brandGradientEnd, brandGradientStart, colors } from "@/constants/theme";
import { jobEarning, type DriverJob, type JobStep } from "@/api/driver";
import { aed, timeAgo, vehicleIcon, vehicleLabel } from "./helpers";

const cardShadow = { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };

/** Big Online / Offline switch shown in the Jobs header band. */
export function OnlineSwitch({ online, onChange }: { online: boolean; onChange: (v: boolean) => void }) {
  const t = useT();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: online }}
      accessibilityLabel={t(online ? "driver.online" : "driver.offline")}
      onPress={() => onChange(!online)}
      className="flex-row items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4"
      style={cardShadow}
    >
      <View className={`h-11 w-11 items-center justify-center rounded-full ${online ? "bg-brand-light" : "bg-surface"}`}>
        <Ionicons name={online ? "radio" : "moon-outline"} size={22} color={online ? colors.brand : colors.muted} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          {online && <View className="h-2 w-2 rounded-full bg-brand-accent" />}
          <Text className="font-inter-bold text-base">{t(online ? "driver.youreOnline" : "driver.youreOffline")}</Text>
        </View>
        <Text className="mt-0.5 text-xs text-body">{t(online ? "driver.onlineHint" : "driver.offlineHint")}</Text>
      </View>
      <Switch
        value={online}
        onValueChange={onChange}
        trackColor={{ false: colors.line, true: colors.brand }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.line}
        style={{ transform: [{ scale: 1.15 }] }}
      />
    </Pressable>
  );
}

/** One open delivery request with Accept / Skip. */
export function RequestCard({
  job,
  onAccept,
  onSkip,
  accepting,
  disabled,
}: {
  job: DriverJob;
  onAccept: () => void;
  onSkip: () => void;
  accepting?: boolean;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <View className="mb-4 rounded-2xl border border-line bg-white p-4" style={cardShadow}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[11px] text-muted">{t("driver.yourEarning")}</Text>
          <Text className="mt-0.5 font-inter-bold text-xl text-brand-dark">{aed(t, jobEarning(job))}</Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1 rounded-full bg-brand-lighter px-2.5 py-1">
            <Ionicons name="time-outline" size={12} color={colors.brandDark} />
            <Text className="font-inter-medium text-[11px] text-brand-dark">{timeAgo(t, job.createdAt)}</Text>
          </View>
          <Text className="mt-1 text-[11px] text-muted" style={{ direction: "ltr" }}>
            {job.code}
          </Text>
        </View>
      </View>

      <RouteStops
        className="mt-4"
        stops={[
          { label: t("common.pickupUpper"), address: job.pickup.address },
          ...job.dropoffs.map((d, i) => ({
            label: job.dropoffs.length > 1 ? t("driver.dropoffN", { n: i + 1 }) : t("common.dropoffUpper"),
            address: d.address,
          })),
        ]}
      />

      <View className="mt-4 flex-row flex-wrap gap-2">
        <Chip icon="navigate-outline" label={t("common.km", { km: job.distanceKm })} />
        <Chip icon={vehicleIcon(job.vehicle)} label={vehicleLabel(t, job.vehicle)} />
        <Chip icon="cash-outline" label={t("driver.feeShort", { amount: aed(t, job.fee) })} />
        {job.tip > 0 && <Chip icon="heart-outline" label={t("driver.tipShort", { amount: aed(t, job.tip) })} />}
      </View>

      <View className="mt-4 flex-row gap-3">
        <Button title={t("driver.skip")} variant="outline" size="sm" className="h-12 flex-1" onPress={onSkip} disabled={accepting} />
        <Button
          title={t("driver.accept")}
          size="sm"
          icon="checkmark"
          className="h-12 flex-[2]"
          onPress={onAccept}
          loading={accepting}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function Chip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
      <Ionicons name={icon} size={13} color={colors.body} />
      <Text className="font-inter-medium text-[11px] text-body">{label}</Text>
    </View>
  );
}

export const STEP_STATUS_KEY: Record<JobStep, string> = {
  "arrive-pickup": "driver.statusToPickup",
  "pick-up": "driver.statusAtPickup",
  "arrive-dropoff": "driver.statusToDropoff",
  deliver: "driver.statusAtDropoff",
};

/** Gradient "Active job" banner pinned on top of the Jobs list. */
export function ActiveJobBanner({ job, step, onPress }: { job: DriverJob; step: JobStep | null; onPress: () => void }) {
  const t = useT();
  const dest = job.status === "picked-up" ? job.dropoffs[0]?.address : job.pickup.address;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="mb-5 overflow-hidden rounded-2xl active:opacity-90">
      <LinearGradient
        colors={[...brandGradient]}
        start={brandGradientStart}
        end={brandGradientEnd}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center gap-3 p-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
          <Ionicons name="cube" size={22} color={colors.white} />
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-[11px] uppercase tracking-wide text-white opacity-80">
            {t("driver.activeJob")} · {job.code}
          </Text>
          <Text className="mt-0.5 font-inter-bold text-base text-white">{step ? t(STEP_STATUS_KEY[step]) : t("driver.activeJob")}</Text>
          {!!dest && (
            <Text className="mt-0.5 text-xs text-white opacity-90" numberOfLines={1}>
              {dest}
            </Text>
          )}
        </View>
        <DirIcon name="chevron-forward" size={20} color={colors.white} />
      </View>
    </Pressable>
  );
}

/** Contact card (sender / receiver) with a round call button. */
export function ContactCard({
  role,
  name,
  phone,
  address,
  notes,
  icon,
}: {
  role: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const t = useT();
  const call = async () => {
    try {
      await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
    } catch {
      Alert.alert(t("driver.callFailed"), phone);
    }
  };
  return (
    <Card className="mb-3">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-light">
          <Ionicons name={icon} size={20} color={colors.brandDark} />
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-[10px] uppercase tracking-wide text-muted">{role}</Text>
          <Text className="mt-0.5 font-inter-semibold text-sm">{name || "—"}</Text>
          <View style={{ direction: "ltr" }} className="self-start">
            <Text className="mt-0.5 text-xs text-body">{phone}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("driver.callName", { name })}
          onPress={call}
          disabled={!phone}
          className="h-11 w-11 items-center justify-center overflow-hidden rounded-full active:opacity-80"
        >
          <LinearGradient
            colors={[...brandGradient]}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <Ionicons name="call" size={18} color={colors.white} />
        </Pressable>
      </View>
      {(address || notes) && (
        <View className="mt-3 gap-1 border-t border-line pt-3">
          {address && (
            <View className="flex-row items-start gap-2">
              <Ionicons name="location-outline" size={14} color={colors.muted} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs text-body">{address}</Text>
            </View>
          )}
          {notes && (
            <View className="flex-row items-start gap-2">
              <Ionicons name="document-text-outline" size={14} color={colors.muted} style={{ marginTop: 2 }} />
              <Text className="flex-1 text-xs text-body">{notes}</Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
}

const TRACK_STEPS: { step: JobStep; key: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { step: "arrive-pickup", key: "driver.trackArrivePickup", icon: "storefront-outline" },
  { step: "pick-up", key: "driver.trackPickUp", icon: "cube-outline" },
  { step: "arrive-dropoff", key: "driver.trackArriveDropoff", icon: "navigate-outline" },
  { step: "deliver", key: "driver.trackDeliver", icon: "checkmark-done-outline" },
];

/** Horizontal 4-step tracker: done (violet check), current (gradient ring), upcoming (grey). */
export function StepTracker({ current }: { current: JobStep | null }) {
  const t = useT();
  const currentIndex = current ? TRACK_STEPS.findIndex((s) => s.step === current) : TRACK_STEPS.length;
  return (
    <View className="flex-row">
      {TRACK_STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <View key={s.step} className="flex-1 items-center">
            <View className="w-full flex-row items-center">
              <View className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : i <= currentIndex ? "bg-brand" : "bg-line"}`} />
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  done ? "bg-brand" : active ? "border-2 border-brand bg-brand-light" : "border border-line bg-white"
                }`}
              >
                <Ionicons
                  name={done ? "checkmark" : s.icon}
                  size={16}
                  color={done ? colors.white : active ? colors.brandDark : colors.muted}
                />
              </View>
              <View
                className={`h-0.5 flex-1 ${i === TRACK_STEPS.length - 1 ? "bg-transparent" : i < currentIndex ? "bg-brand" : "bg-line"}`}
              />
            </View>
            <Text
              className={`mt-1.5 px-1 text-center text-[10px] ${active ? "font-inter-semibold text-brand-dark" : done ? "text-ink" : "text-muted"}`}
            >
              {t(s.key)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
