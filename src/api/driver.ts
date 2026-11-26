/**
 * Fake backend + TanStack Query hooks for the driver (rider) app.
 * Works on the same in-memory database as the customer app (./mock.ts), so a job the driver
 * accepts / picks up / delivers updates the customer's order, tracking screen and notifications live.
 * Replace the mock functions with `api.get/post(...)` calls when the real backend exists.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDb, mockReady, saveMockDb } from "./mock";
import { queryKeys } from "./hooks";
import type { Order, Rider } from "./types";
import type { Vehicle } from "@/store/slices/deliverySlice";

/** Order with the extra timestamps the driver app records. */
export type DriverJob = Order & {
  acceptedAt?: string;
  arrivedPickupAt?: string;
  pickedUpAt?: string;
  arrivedDropoffAt?: string;
  deliveredAt?: string;
};

/** Who the driver is — taken from the signed-in user + vehicle details. */
export type DriverIdentity = { name: string; phone: string; vehicle: Vehicle; plate: string };

const delay = async (ms = 400) => {
  await mockReady();
  await new Promise((r) => setTimeout(r, ms));
};
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const samePhone = (a?: string, b?: string) => !!a && !!b && a.replace(/\D/g, "") === b.replace(/\D/g, "");
const hhmm = (d = new Date()) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const jobs = () => mockDb.orders as DriverJob[];

const findJob = (id: string) => {
  const job = jobs().find((o) => o.id === id);
  if (!job) throw new Error("Order not found");
  return job;
};

/** Sets the time on a timeline step ("Rider assigned" = 1, "Picked up" = 2, "Delivered" = 3). */
function stampTimeline(job: DriverJob, prefix: string, fallbackIndex: number) {
  const step = job.timeline.find((s) => s.label.toLowerCase().startsWith(prefix)) ?? job.timeline[fallbackIndex];
  if (step) step.time = hhmm();
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

/** What the driver earns for a job: 80% of the delivery fee plus the full tip. */
export const jobEarning = (o: Order) => Math.round(o.fee * 0.8) + (o.tip || 0);

/** True when the job belongs to this driver. */
export const isMine = (o: Order, me: { phone: string }) => samePhone(o.rider?.phone, me.phone);

export const driverApi = {
  /** Open requests: orders still looking for a rider. */
  async getRequests() {
    await delay(300);
    return clone(jobs().filter((o) => o.status === "finding-rider"));
  },
  /** Every order this driver has been assigned (active + history). */
  async getMyJobs(phone: string) {
    await delay(300);
    return clone(jobs().filter((o) => isMine(o, { phone })));
  },
  async getJob(id: string) {
    await delay(250);
    return clone(findJob(id));
  },
  async acceptJob(id: string, me: DriverIdentity) {
    await delay(600);
    const job = findJob(id);
    if (job.status !== "finding-rider") throw new Error("taken");
    const rider: Rider = {
      name: me.name,
      initials: initials(me.name),
      rating: 4.9,
      vehicle: me.vehicle === "car" ? "Car" : "Motorcycle",
      plate: me.plate || "—",
      phone: me.phone,
    };
    const now = new Date().toISOString();
    job.rider = rider;
    job.status = "rider-assigned";
    job.acceptedAt = now;
    stampTimeline(job, "rider", 1);
    mockDb.notifications.unshift({
      id: `n${Date.now()}`,
      title: `${me.name} is heading to you`,
      body: `${job.code} · Your rider is assigned. Pickup in 10–15 min.`,
      createdAt: now,
      read: false,
      kind: "rider",
      orderId: job.id,
    });
    await saveMockDb();
    return clone(job);
  },
  async markArrived(id: string, at: "pickup" | "dropoff") {
    await delay(300);
    const job = findJob(id);
    if (at === "pickup") job.arrivedPickupAt = new Date().toISOString();
    else job.arrivedDropoffAt = new Date().toISOString();
    await saveMockDb();
    return clone(job);
  },
  async pickUp(id: string) {
    await delay(500);
    const job = findJob(id);
    if (job.status === "cancelled") throw new Error("cancelled");
    job.status = "picked-up";
    job.pickedUpAt = new Date().toISOString();
    stampTimeline(job, "picked", 2);
    await saveMockDb();
    return clone(job);
  },
  async deliver(id: string) {
    await delay(600);
    const job = findJob(id);
    if (job.status === "cancelled") throw new Error("cancelled");
    const now = new Date().toISOString();
    job.status = "delivered";
    job.deliveredAt = now;
    stampTimeline(job, "delivered", 3);
    mockDb.notifications.unshift({
      id: `n${Date.now()}`,
      title: "Delivered, safe and sound",
      body: `${job.code} was handed over to ${job.dropoffs[0]?.contactName ?? "the receiver"}.`,
      createdAt: now,
      read: false,
      kind: "delivered",
      orderId: job.id,
    });
    await saveMockDb();
    return clone(job);
  },
  /** Dev helper: adds a request so the driver flow can be tried without placing an order as a customer. */
  async createDemoRequest() {
    await delay(300);
    const id = String(Math.max(10500, ...mockDb.orders.map((o) => Number(o.id) || 0)) + 1);
    const t = new Date();
    const fee = 30 + Math.floor(Math.random() * 40);
    const order: DriverJob = {
      id,
      code: `#APX-${id}`,
      flow: "send",
      status: "finding-rider",
      createdAt: t.toISOString(),
      pickup: { address: "Dubai Marina Mall, Dubai Marina, Dubai", contactName: "Sara Khalid", contactPhone: "+971 50 111 2233" },
      dropoffs: [
        {
          address: "Marina Plaza, Dubai Marina, Dubai",
          contactName: "Omar Hassan",
          contactPhone: "+971 55 444 5566",
          notes: "Call on arrival.",
        },
      ],
      packageSize: "Small box",
      contents: "Documents",
      vehicle: Math.random() > 0.5 ? "motorcycle" : "car",
      distanceKm: Number((2 + Math.random() * 8).toFixed(1)),
      etaMinutes: [20, 30],
      fee,
      tip: 0,
      discount: 0,
      total: fee,
      paymentMethod: "cash",
      transactionId: `TXN${Math.floor(100000 + Math.random() * 899999)}`,
      paidAt: t.toISOString(),
      timeline: [
        { label: "Order confirmed", time: hhmm(t) },
        { label: "Rider assigned", time: null },
        { label: "Picked up", time: null },
        { label: "Delivered", time: null },
      ],
    };
    mockDb.orders.unshift(order);
    await saveMockDb();
    return clone(order);
  },
};

// ---------- query keys ----------
export const driverKeys = {
  all: ["driver"] as const,
  requests: ["driver", "requests"] as const,
  myJobs: (phone: string) => ["driver", "jobs", phone] as const,
  job: (id: string) => ["driver", "job", id] as const,
};

// ---------- hooks ----------
/** Open requests. Refetches every 10 s while the driver is online. */
export const useJobRequests = (online: boolean) =>
  useQuery({
    queryKey: driverKeys.requests,
    queryFn: driverApi.getRequests,
    enabled: online,
    staleTime: 0,
    refetchInterval: online ? 10_000 : false,
  });

export const useMyJobs = (phone: string | undefined) =>
  useQuery({ queryKey: driverKeys.myJobs(phone ?? ""), queryFn: () => driverApi.getMyJobs(phone!), enabled: !!phone, staleTime: 0 });

export const useDriverJob = (id: string | null | undefined) =>
  useQuery({ queryKey: driverKeys.job(id ?? ""), queryFn: () => driverApi.getJob(id!), enabled: !!id, staleTime: 0 });

/** After any driver change: refresh the driver lists AND the customer's orders / notifications. */
function useRefreshAll() {
  const qc = useQueryClient();
  return (job?: DriverJob) => {
    if (job) {
      qc.setQueryData(driverKeys.job(job.id), job);
      qc.invalidateQueries({ queryKey: queryKeys.order(job.id) });
    }
    qc.invalidateQueries({ queryKey: driverKeys.all });
    qc.invalidateQueries({ queryKey: queryKeys.orders });
    qc.invalidateQueries({ queryKey: queryKeys.notifications });
  };
}

export const useAcceptJob = () => {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: (v: { id: string; me: DriverIdentity }) => driverApi.acceptJob(v.id, v.me),
    onSuccess: (job) => refresh(job),
    onError: () => refresh(),
  });
};

export type JobStep = "arrive-pickup" | "pick-up" | "arrive-dropoff" | "deliver";

/** Advances an active job one step. */
export const useAdvanceJob = () => {
  const refresh = useRefreshAll();
  return useMutation({
    mutationFn: ({ id, step }: { id: string; step: JobStep }) => {
      switch (step) {
        case "arrive-pickup":
          return driverApi.markArrived(id, "pickup");
        case "pick-up":
          return driverApi.pickUp(id);
        case "arrive-dropoff":
          return driverApi.markArrived(id, "dropoff");
        case "deliver":
          return driverApi.deliver(id);
      }
    },
    onSuccess: (job) => refresh(job),
    onError: () => refresh(),
  });
};

export const useCreateDemoRequest = () => {
  const refresh = useRefreshAll();
  return useMutation({ mutationFn: driverApi.createDemoRequest, onSuccess: (job) => refresh(job) });
};

/** Which step an active job is at (the next button to show). null = finished / not actionable. */
export function nextStep(job: DriverJob): JobStep | null {
  if (job.status === "rider-assigned") return job.arrivedPickupAt ? "pick-up" : "arrive-pickup";
  if (job.status === "picked-up") return job.arrivedDropoffAt ? "deliver" : "arrive-dropoff";
  return null;
}
