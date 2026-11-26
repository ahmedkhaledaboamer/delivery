import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Button, InfoBanner, SectionLabel, TAB_BAR_SPACE, Text } from "@/components/ui";
import {
  ActiveJobBanner,
  DriverHeader,
  OnlineSwitch,
  RequestCard,
  greetingKey,
  useDriverIdentity,
  useDriverState,
} from "@/components/driver";
import { nextStep, useAcceptJob, useCreateDemoRequest, useDriverJob, useJobRequests, useMyJobs } from "@/api/driver";
import { useT } from "@/i18n";
import { useAppDispatch } from "@/store";
import { setActiveOrder, setOnline, skipRequest } from "@/store/slices/driverSlice";
import { colors } from "@/constants/theme";
import { images } from "@/constants/images";

function OfflineState({ onGoOnline }: { onGoOnline: () => void }) {
  const t = useT();
  return (
    <View className="items-center px-5 pt-8">
      <Image source={images.scooter} resizeMode="contain" style={{ width: 200, height: 140 }} />
      <Text className="mt-5 text-center font-inter-bold text-xl">{t("driver.offlineTitle")}</Text>
      <Text className="mt-2 px-6 text-center text-sm text-body">{t("driver.offlineBody")}</Text>
      <Button className="mt-6 w-full" title={t("driver.goOnline")} icon="radio-outline" onPress={onGoOnline} />
      <InfoBanner className="mt-5 w-full">{t("driver.offlineTip")}</InfoBanner>
    </View>
  );
}

export default function DriverJobsScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const me = useDriverIdentity();
  const { online, activeOrderId, skippedIds, plate } = useDriverState();

  const requests = useJobRequests(online);
  const myJobs = useMyJobs(me?.phone);
  const active = useDriverJob(activeOrderId);
  const accept = useAcceptJob();
  const demo = useCreateDemoRequest();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const activeJob = active.data && (active.data.status === "rider-assigned" || active.data.status === "picked-up") ? active.data : null;

  // Keep activeOrderId in sync: clear it once the job is finished/cancelled; restore it if the app lost it.
  useEffect(() => {
    if (activeOrderId && active.data && !activeJob) dispatch(setActiveOrder(null));
    if (activeOrderId && active.isError) dispatch(setActiveOrder(null));
  }, [activeOrderId, active.data, active.isError, activeJob, dispatch]);
  useEffect(() => {
    if (activeOrderId || !myJobs.data) return;
    const ongoing = myJobs.data.find((o) => o.status === "rider-assigned" || o.status === "picked-up");
    if (ongoing) dispatch(setActiveOrder(ongoing.id));
  }, [activeOrderId, myJobs.data, dispatch]);

  const list = (requests.data ?? []).filter((o) => !skippedIds.includes(o.id));
  const firstName = (me?.name ?? "").split(" ")[0];

  const onAccept = (id: string) => {
    if (!me) return;
    if (activeJob) {
      Alert.alert(t("driver.busyTitle"), t("driver.busyBody"));
      return;
    }
    setAcceptingId(id);
    accept.mutate(
      { id, me },
      {
        onSuccess: (job) => {
          dispatch(setActiveOrder(job.id));
          router.push(`/driver/job/${job.id}`);
        },
        onError: (e) =>
          e instanceof Error && e.message === "taken"
            ? Alert.alert(t("driver.takenTitle"), t("driver.takenBody"))
            : Alert.alert(t("common.somethingWrong")),
        onSettled: () => setAcceptingId(null),
      },
    );
  };

  const refreshing = requests.isRefetching || myJobs.isRefetching || active.isRefetching;
  const onRefresh = () => {
    if (online) void requests.refetch();
    void myJobs.refetch();
    if (activeOrderId) void active.refetch();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: TAB_BAR_SPACE }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <DriverHeader
          title={firstName ? t(greetingKey(), { name: firstName }) : t("driver.hello")}
          subtitle={t(online ? "driver.jobsSubtitleOnline" : "driver.jobsSubtitleOffline")}
        >
          <OnlineSwitch online={online} onChange={(v) => dispatch(setOnline(v))} />
        </DriverHeader>

        <View className="px-5 pt-5">
          {activeJob && (
            <ActiveJobBanner job={activeJob} step={nextStep(activeJob)} onPress={() => router.push(`/driver/job/${activeJob.id}`)} />
          )}

          {online && !plate && (
            <Pressable onPress={() => router.push("/driver/profile")} className="mb-4">
              <InfoBanner icon="card-outline">{t("driver.addPlateTip")}</InfoBanner>
            </Pressable>
          )}

          {!online ? (
            <OfflineState onGoOnline={() => dispatch(setOnline(true))} />
          ) : (
            <>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-inter-bold text-base">{t("driver.newRequests")}</Text>
                <View className="flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full bg-brand-accent" />
                  <Text className="text-xs text-body">{t("driver.liveCount", { n: list.length })}</Text>
                </View>
              </View>

              {requests.isLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color={colors.brand} />
                </View>
              ) : requests.isError ? (
                <View className="items-center py-10">
                  <Text className="text-sm text-danger">{t("common.somethingWrong")}</Text>
                  <Button title={t("common.retry")} variant="ghost" size="sm" className="mt-2" onPress={() => void requests.refetch()} />
                </View>
              ) : list.length === 0 ? (
                <View className="items-center rounded-2xl border border-dashed border-line px-6 py-10">
                  <Image source={images.box} resizeMode="contain" style={{ width: 110, height: 90 }} />
                  <Text className="mt-4 font-inter-semibold text-base">{t("driver.noRequestsTitle")}</Text>
                  <Text className="mt-1 text-center text-xs text-body">{t("driver.noRequestsBody")}</Text>
                  {__DEV__ && (
                    <Button
                      title={t("driver.demoRequest")}
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      loading={demo.isPending}
                      onPress={() => demo.mutate()}
                    />
                  )}
                </View>
              ) : (
                <>
                  <SectionLabel>{t("driver.nearbyLabel")}</SectionLabel>
                  {list.map((job) => (
                    <RequestCard
                      key={job.id}
                      job={job}
                      accepting={acceptingId === job.id}
                      disabled={!!acceptingId && acceptingId !== job.id}
                      onAccept={() => onAccept(job.id)}
                      onSkip={() => dispatch(skipRequest(job.id))}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
