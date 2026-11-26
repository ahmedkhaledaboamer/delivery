import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockApi } from "./mock";
import type { CreateOrderInput, CreateTicketInput, Notification, Profile } from "./types";

export const queryKeys = {
  orders: ["orders"] as const,
  order: (id: string) => ["orders", id] as const,
  profile: ["profile"] as const,
  notifications: ["notifications"] as const,
  wallet: ["wallet"] as const,
  loyalty: ["loyalty"] as const,
  tickets: ["tickets"] as const,
};

// ---------- auth ----------
export const useSendOtp = () => useMutation({ mutationFn: (phone: string) => mockApi.sendOtp(phone) });

export const useVerifyOtp = () =>
  useMutation({ mutationFn: (v: { phone: string; code: string }) => mockApi.verifyOtp(v.phone, v.code) });

// ---------- orders ----------
export const useOrders = () => useQuery({ queryKey: queryKeys.orders, queryFn: mockApi.getOrders });

export const useOrder = (id: string | undefined) =>
  useQuery({ queryKey: queryKeys.order(id ?? ""), queryFn: () => mockApi.getOrder(id!), enabled: !!id });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => mockApi.createOrder(input),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: queryKeys.orders });
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; reason: string }) => mockApi.cancelOrder(v.id, v.reason),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
};

export const useRateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; rating: number; comment: string }) => mockApi.rateOrder(v.id, v.rating, v.comment),
    onSuccess: (order) => qc.setQueryData(queryKeys.order(order.id), order),
  });
};

// ---------- profile ----------
export const useProfile = () => useQuery({ queryKey: queryKeys.profile, queryFn: mockApi.getProfile });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<Profile, "name" | "email" | "phone" | "avatar">>) => mockApi.updateProfile(patch),
    onSuccess: (profile) => qc.setQueryData(queryKeys.profile, profile),
  });
};

// ---------- notifications / wallet / loyalty / support ----------
export const useNotifications = () => useQuery({ queryKey: queryKeys.notifications, queryFn: mockApi.getNotifications });

/** True when at least one notification is unread — drives the dot on the bell icon. */
export const useHasUnreadNotifications = () => {
  const { data } = useNotifications();
  return !!data?.some((n) => !n.read);
};

/** Marks one notification read; updates the list immediately so the unread dot disappears on tap. */
export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockApi.markNotificationRead(id),
    onMutate: (id) => {
      qc.setQueryData<Notification[]>(queryKeys.notifications, (list) => list?.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mockApi.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
};

export const useWallet = () => useQuery({ queryKey: queryKeys.wallet, queryFn: mockApi.getWallet });

export const useLoyalty = () => useQuery({ queryKey: queryKeys.loyalty, queryFn: mockApi.getLoyalty });

export const useRedeemReward = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) => mockApi.redeemReward(rewardId),
    onSuccess: (loyalty) => qc.setQueryData(queryKeys.loyalty, loyalty),
  });
};

export const useTickets = () => useQuery({ queryKey: queryKeys.tickets, queryFn: mockApi.getTickets });

export const useCreateTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => mockApi.createTicket(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tickets }),
  });
};
