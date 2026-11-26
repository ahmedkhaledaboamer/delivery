import { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, GradientIcon, Header, InfoBanner, RouteMap, RouteStops, Screen, Sheet, Text } from "@/components/ui";
import { ContactCard, STEP_STATUS_KEY, StepTracker, aed, vehicleLabel } from "@/components/driver";
import { jobEarning, nextStep, useAdvanceJob, useDriverJob, type DriverJob, type JobStep } from "@/api/driver";
import type { OrderStop } from "@/api/types";
import { useT } from "@/i18n";
import { useAppDispatch } from "@/store";
import { setActiveOrder } from "@/store/slices/driverSlice";
import { colors } from "@/constants/theme";

const BUTTON_KEY: Record<JobStep, string> = {
  "arrive-pickup": "driver.btnArrivedPickup",
  "pick-up": "driver.btnPickedUp",
  "arrive-dropoff": "driver.btnArrivedDropoff",
  deliver: "driver.btnDelivered",
};

const BUTTON_ICON: Record<JobStep, "flag-outline" | "cube-outline" | "location-outline" | "checkmark-done"> = {
  "arrive-pickup": "flag-outline",
  "pick-up": "cube-outline",
  "arrive-dropoff": "location-outline",
  deliver: "checkmark-done",
};

const toLatLng = (s?: OrderStop) =>
  s?.latitude != null && s?.longitude != null ? { latitude: s.latitude, longitude: s.longitude } : undefined;

function backToJobs() {
  if (router.canGoBack()) router.back();
  else router.replace("/driver");
}

/** Shown after "Delivered" (or when opening a finished / cancelled job). */
function FinishedState({ job }: { job: DriverJob }) {
  const t = useT();
  const cancelled = job.status === "cancelled";
  return (
    <Screen background="white" footer={<Button title={t("driver.backToJobs")} onPress={backToJobs} />}>
      <View className="flex-1 items-center justify-center px-6 pt-16">
        <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-lighter">
          {cancelled ? (
            <Ionicons name="close-circle-outline" size={64} color={colors.danger} />
          ) : (
            <GradientIcon name="checkmark-circle" size={72} />
          )}
        </View>
        <Text className="mt-6 text-center font-inter-bold text-2xl">
          {t(cancelled ? "driver.cancelledTitle" : "driver.deliveredTitle")}
        </Text>
        <Text className="mt-2 text-center text-sm text-body">
          {cancelled ? t("driver.cancelledBody") : t("driver.deliveredBody", { name: job.dropoffs[0]?.contactName ?? "" })}
        </Text>
        {!cancelled && (
          <Card tone="tint" className="mt-6 w-full items-center">
            <Text className="text-xs text-body">{t("driver.youEarned")}</Text>
            <Text className="mt-1 font-inter-bold text-[28px] text-brand-dark">{aed(t, jobEarning(job))}</Text>
            <Text className="mt-1 text-[11px] text-muted" style={{ direction: "ltr" }}>
              {job.code} · {t("common.km", { km: job.distanceKm })}
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}

export default function ActiveJobScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading, error, refetch } = useDriverJob(id);
  const advance = useAdvanceJob();
  const [finished, setFinished] = useState<DriverJob | null>(null);

  if (finished) return <FinishedState job={finished} />;

  if (!job) {
    return (
      <Screen>
        <Header />
        <View className="flex-1 items-center justify-center py-16">
          {isLoading ? (
            <ActivityIndicator color={colors.brand} />
          ) : (
            <>
              <Text className="text-sm text-danger">{error ? t("common.somethingWrong") : t("driver.jobNotFound")}</Text>
              <Button title={t("common.retry")} variant="ghost" size="sm" className="mt-2" onPress={() => void refetch()} />
            </>
          )}
        </View>
      </Screen>
    );
  }

  if (job.status === "delivered" || job.status === "cancelled") return <FinishedState job={job} />;

  const step = nextStep(job);

  const run = (s: JobStep) =>
    advance.mutate(
      { id: job.id, step: s },
      {
        onSuccess: (updated) => {
          if (updated.status === "delivered") {
            dispatch(setActiveOrder(null));
            setFinished(updated);
          }
        },
        onError: (e) =>
          Alert.alert(e instanceof Error && e.message === "cancelled" ? t("driver.cancelledTitle") : t("common.somethingWrong")),
      },
    );

  const onPrimary = () => {
    if (!step) return;
    if (step === "deliver") {
      Alert.alert(t("driver.confirmDeliverTitle"), t("driver.confirmDeliverBody", { name: job.dropoffs[0]?.contactName ?? "" }), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("driver.confirmDeliverYes"), onPress: () => run("deliver") },
      ]);
    } else {
      run(step);
    }
  };

  const headingToDropoff = job.status === "picked-up";
  const destination = headingToDropoff ? job.dropoffs[0]?.address : job.pickup.address;
  const cash = job.paymentMethod === "cash";

  return (
    <Screen
      edges={["bottom"]}
      background="white"
      footer={
        step && (
          <Button
            title={t(BUTTON_KEY[step])}
            icon={BUTTON_ICON[step]}
            loading={advance.isPending}
            onPress={onPrimary}
          />
        )
      }
    >
      <RouteMap
        mode="route"
        stepLabel={job.code}
        pickup={toLatLng(job.pickup)}
        dropoff={job.dropoffs.length === 1 ? toLatLng(job.dropoffs[0]) : undefined}
        stops={job.dropoffs.length > 1 ? job.dropoffs.map(toLatLng).filter((p) => !!p) : undefined}
      />
      <Sheet>
        <Text className="font-inter-semibold text-[11px] uppercase tracking-wide text-brand">{t("driver.activeJob")}</Text>
        <Text className="mt-1 font-inter-bold text-xl">{step ? t(STEP_STATUS_KEY[step]) : ""}</Text>
        {!!destination && <Text className="mt-1 text-xs text-body">{destination}</Text>}

        <Card className="mt-4">
          <StepTracker current={step} />
        </Card>

        <Text className="mb-3 mt-5 font-inter-bold text-base">{t("driver.contacts")}</Text>
        <ContactCard
          role={t("driver.sender")}
          icon="person-outline"
          name={job.pickup.contactName}
          phone={job.pickup.contactPhone}
          address={job.pickup.address}
          notes={job.pickup.notes}
        />
        {job.dropoffs.map((d, i) => (
          <ContactCard
            key={i}
            role={job.dropoffs.length > 1 ? t("driver.receiverN", { n: i + 1 }) : t("driver.receiver")}
            icon="home-outline"
            name={d.contactName}
            phone={d.contactPhone}
            address={d.address}
            notes={d.notes}
          />
        ))}

        <Card className="mt-2">
          <RouteStops
            stops={[
              { label: t("common.pickupUpper"), address: job.pickup.address },
              ...job.dropoffs.map((d, i) => ({
                label: job.dropoffs.length > 1 ? t("driver.dropoffN", { n: i + 1 }) : t("common.dropoffUpper"),
                address: d.address,
              })),
            ]}
          />
          <View className="mt-4 flex-row gap-3 border-t border-line pt-4">
            <View className="flex-1">
              <Text className="text-[11px] text-muted">{t("driver.package")}</Text>
              <Text className="mt-0.5 font-inter-medium text-xs">{[job.packageSize, job.contents].filter(Boolean).join(" · ")}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-muted">{t("driver.vehicle")}</Text>
              <Text className="mt-0.5 font-inter-medium text-xs">
                {vehicleLabel(t, job.vehicle)} · {t("common.km", { km: job.distanceKm })}
              </Text>
            </View>
          </View>
        </Card>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-body">{t("driver.yourEarning")}</Text>
          <Text className="font-inter-bold text-sm">{aed(t, jobEarning(job))}</Text>
        </View>
        <InfoBanner icon={cash ? "cash-outline" : "card-outline"} className="mt-3">
          {cash ? t("driver.collectCash", { amount: aed(t, job.total || job.fee) }) : t("driver.paidByCard")}
        </InfoBanner>
      </Sheet>
    </Screen>
  );
}
