import type { FlowType, Vehicle } from "@/store/slices/deliverySlice";

export type OrderStatus = "finding-rider" | "rider-assigned" | "picked-up" | "delivered" | "cancelled" | "scheduled";

export type OrderStop = {
  address: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
};

export type Rider = {
  name: string;
  initials: string;
  rating: number;
  vehicle: string;
  plate: string;
  phone: string;
};

export type TimelineStep = { label: string; time: string | null };

export type Order = {
  id: string;
  code: string; // "#APX-10428"
  flow: FlowType;
  status: OrderStatus;
  createdAt: string; // ISO
  scheduledFor?: string; // ISO
  pickup: OrderStop;
  dropoffs: OrderStop[]; // store "multiple orders" can have several
  packageSize: string; // "Small box"
  contents: string; // "Books"
  vehicle: Vehicle;
  distanceKm: number;
  etaMinutes: [number, number];
  fee: number; // AED
  tip: number;
  discount: number;
  total: number;
  paymentMethod: "card" | "cash";
  transactionId: string;
  paidAt: string;
  rider?: Rider;
  timeline: TimelineStep[];
  rating?: number;
  ratingComment?: string;
  cancelReason?: string;
};

export type CreateOrderInput = {
  flow: FlowType;
  vehicle: Vehicle;
  pickup: OrderStop;
  dropoffs: OrderStop[];
  contents: string;
  tip: number;
  discount: number;
  fee: number;
  /** Total estimated road distance (km). Falls back to 4.2 km when missing. */
  distanceKm?: number;
  /** Delivery window in minutes after pickup. Falls back to [25, 35] when missing. */
  etaMinutes?: [number, number];
};

export type Address = { id: string; label: string; address: string; icon: "home" | "work" | "other" };

export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  avatar?: string;
  addresses: Address[];
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: "rider" | "confirmed" | "delivered" | "welcome";
  /** Order the notification is about — used to open the right screen when tapped. */
  orderId?: string;
};

export type WalletTransaction = { id: string; title: string; date: string; amount: number };
export type Wallet = { balance: number; transactions: WalletTransaction[] };

export type LoyaltyReward = { id: string; title: string; subtitle: string; points: number };
export type LoyaltyHistory = { id: string; title: string; date: string; points: number };
export type Loyalty = {
  points: number;
  tier: string;
  nextTier: string;
  tierProgress: number; // 0..1
  tierTarget: number;
  rewards: LoyaltyReward[];
  history: LoyaltyHistory[];
};

export type TicketStatus = "in-progress" | "resolved" | "closed";
export type Ticket = {
  id: string;
  title: string;
  orderCode?: string;
  createdAt: string;
  status: TicketStatus;
  category: "order" | "payment" | "account" | "technical";
};

export type CreateTicketInput = {
  issueType: string;
  relatedTo: "order" | "account";
  orderNumber?: string;
  description: string;
  attachmentNames: string[];
};
