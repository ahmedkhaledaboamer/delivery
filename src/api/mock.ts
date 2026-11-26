/**
 * In-memory fake backend so every screen works before a real API exists.
 * Each function mimics a network call. Replace the bodies with `api.get/post(...)`
 * from ./client when the backend is ready — the hooks in ./hooks stay the same.
 */
import type {
  CreateOrderInput,
  CreateTicketInput,
  Loyalty,
  Notification,
  Order,
  Profile,
  Ticket,
  Wallet,
} from "./types";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const db: {
  orders: Order[];
  profile: Profile;
  notifications: Notification[];
  wallet: Wallet;
  loyalty: Loyalty;
  tickets: Ticket[];
} = {
  orders: [
    {
      id: "10428",
      code: "#APX-10428",
      flow: "send",
      status: "rider-assigned",
      createdAt: minutesAgo(20),
      pickup: { address: "Dubai Marina, Dubai, UAE.", contactName: "Mohamed Ahmed", contactPhone: "+971 50 123 4567" },
      dropoffs: [
        {
          address: "Marina Plaza, Dubai Marina, Dubai.",
          contactName: "Laila Ahmed",
          contactPhone: "+971 55 765 4321",
          notes: "Call on arrival. Hand over at reception.",
        },
      ],
      packageSize: "Small box",
      contents: "Books",
      vehicle: "motorcycle",
      distanceKm: 4.2,
      etaMinutes: [25, 35],
      fee: 350,
      tip: 0,
      discount: 0,
      total: 350,
      paymentMethod: "card",
      transactionId: "TXN784203",
      paidAt: minutesAgo(20),
      rider: {
        name: "Ahmed Mohamed",
        initials: "AM",
        rating: 4.9,
        vehicle: "Motorcycle",
        plate: "WP BEX 4521",
        phone: "+971 50 000 0000",
      },
      timeline: [
        { label: "Order confirmed", time: "10:02" },
        { label: "Rider assigned", time: "10:04" },
        { label: "Picked up", time: null },
        { label: "Delivered", time: null },
      ],
    },
    {
      id: "10431",
      code: "#APX-10431",
      flow: "send",
      status: "scheduled",
      createdAt: minutesAgo(60),
      scheduledFor: new Date(now + 24 * 3600_000).toISOString(),
      pickup: { address: "24 Flower Road, Colombo 07", contactName: "Nethmi Perera", contactPhone: "+94 77 123 4567" },
      dropoffs: [{ address: "18 Park Road, Colombo 05", contactName: "Kavindu Silva", contactPhone: "+94 71 765 4321" }],
      packageSize: "Small box",
      contents: "Documents",
      vehicle: "motorcycle",
      distanceKm: 4.2,
      etaMinutes: [25, 35],
      fee: 260,
      tip: 0,
      discount: 0,
      total: 260,
      paymentMethod: "cash",
      transactionId: "TXN784190",
      paidAt: minutesAgo(60),
      timeline: [
        { label: "Order confirmed", time: "09:10" },
        { label: "Rider assigned", time: null },
        { label: "Picked up", time: null },
        { label: "Delivered", time: null },
      ],
    },
    {
      id: "10390",
      code: "#APX-10390",
      flow: "send",
      status: "delivered",
      createdAt: minutesAgo(60 * 26),
      pickup: { address: "24 Flower Road, Colombo 07", contactName: "Nethmi Perera", contactPhone: "+94 77 123 4567" },
      dropoffs: [{ address: "18 Park Road, Colombo 05", contactName: "Kavindu Silva", contactPhone: "+94 71 765 4321" }],
      packageSize: "Small box",
      contents: "Books",
      vehicle: "motorcycle",
      distanceKm: 4.2,
      etaMinutes: [25, 35],
      fee: 350,
      tip: 10,
      discount: 0,
      total: 360,
      paymentMethod: "card",
      transactionId: "TXN783911",
      paidAt: minutesAgo(60 * 26),
      rider: {
        name: "Ahmed Mohamed",
        initials: "AM",
        rating: 4.9,
        vehicle: "Motorcycle",
        plate: "WP BEX 4521",
        phone: "+971 50 000 0000",
      },
      timeline: [
        { label: "Order confirmed", time: "10:02" },
        { label: "Rider assigned", time: "10:04" },
        { label: "Picked up", time: "10:19" },
        { label: "Delivered", time: "10:46" },
      ],
    },
  ],
  profile: {
    id: "u1",
    name: "Nethmi Perera",
    email: "nethmi.perera@gmail.com",
    phone: "+971 50 123 4567",
    country: "Colombo, Sri Lanka",
    addresses: [
      { id: "a1", label: "Home", address: "24 Flower Road, Colombo 07", icon: "home" },
      { id: "a2", label: "Work", address: "Dubai Marina, Dubai, UAE.", icon: "work" },
    ],
  },
  notifications: [
    {
      id: "n1",
      title: "Olan is heading to you",
      body: "Your rider is assigned. Pickup in 10–15 min.",
      createdAt: minutesAgo(2),
      read: false,
      kind: "rider",
    },
    {
      id: "n2",
      title: "Your delivery is confirmed",
      body: "#APX-10428 · We're finding a nearby rider.",
      createdAt: minutesAgo(5),
      read: false,
      kind: "confirmed",
    },
    {
      id: "n3",
      title: "Delivered, safe and sound",
      body: "#APX-10390 was handed over at reception.",
      createdAt: minutesAgo(60 * 24),
      read: true,
      kind: "delivered",
    },
    {
      id: "n4",
      title: "Welcome to APEX AORA",
      body: "Your account is ready. Save an address for faster booking.",
      createdAt: minutesAgo(60 * 26),
      read: true,
      kind: "welcome",
    },
  ],
  wallet: {
    balance: 1678,
    transactions: [
      { id: "w1", title: "Delivery- #APX1234", date: "Nov 12, 2026 · 10:00 AM", amount: -34 },
      { id: "w2", title: "Delivery- #APX1234", date: "Nov 10, 2026 · 10:00 AM", amount: 34 },
      { id: "w3", title: "Delivery- #APX1234", date: "Nov 08, 2026 · 10:00 AM", amount: -34 },
      { id: "w4", title: "Delivery- #APX1234", date: "Nov 05, 2026 · 10:00 AM", amount: -34 },
      { id: "w5", title: "Delivery- #APX1234", date: "Nov 01, 2026 · 10:00 AM", amount: -34 },
    ],
  },
  loyalty: {
    points: 1765,
    tier: "Gold Member",
    nextTier: "Platinum",
    tierProgress: 1765 / 2000,
    tierTarget: 2000,
    rewards: [
      { id: "r1", title: "AED 10 Off", subtitle: "For orders above AED 50", points: 500 },
      { id: "r2", title: "Free Delivery", subtitle: "On your next order", points: 800 },
    ],
    history: [
      { id: "h1", title: "Reward Redemption", date: "Nov 8, 2026", points: -500 },
      { id: "h2", title: "Order #APX5821", date: "Nov 7, 2026", points: 100 },
      { id: "h3", title: "Order #APX5790", date: "Nov 5, 2026", points: 80 },
    ],
  },
  tickets: [
    { id: "t1", title: "Order Issue", orderCode: "#APX-78452", createdAt: "Nov 8, 2026, 10:24 AM", status: "in-progress", category: "order" },
    { id: "t2", title: "Payment & Refund", orderCode: "#APX-77109", createdAt: "Nov 4, 2026, 03:15 PM", status: "resolved", category: "payment" },
    { id: "t3", title: "Account Issue", orderCode: "#APX-76540", createdAt: "Nov 1, 2026, 06:18 PM", status: "closed", category: "account" },
  ],
};

let nextOrderId = 10500;

export const mockApi = {
  // ---- auth ----
  async sendOtp(phone: string) {
    await delay();
    return { phone, expiresInSeconds: 300 };
  },
  async verifyOtp(_phone: string, code: string) {
    await delay();
    if (code.length !== 6) throw new Error("Enter the 6-digit code");
    return { token: "mock-token", profile: clone(db.profile) };
  },

  // ---- orders ----
  async getOrders() {
    await delay();
    return clone(db.orders);
  },
  async getOrder(id: string) {
    await delay(300);
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    return clone(order);
  },
  async createOrder(input: CreateOrderInput) {
    await delay(800);
    const id = String(nextOrderId++);
    const t = new Date();
    const hhmm = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
    const order: Order = {
      id,
      code: `#APX-${id}`,
      flow: input.flow,
      status: "finding-rider",
      createdAt: t.toISOString(),
      pickup: input.pickup,
      dropoffs: input.dropoffs,
      packageSize: "Small box",
      contents: input.contents,
      vehicle: input.vehicle,
      distanceKm: 4.2,
      etaMinutes: [25, 35],
      fee: input.fee,
      tip: input.tip,
      discount: input.discount,
      total: input.fee + input.tip - input.discount,
      paymentMethod: "card",
      transactionId: `TXN${Math.floor(100000 + Math.random() * 899999)}`,
      paidAt: t.toISOString(),
      timeline: [
        { label: "Order confirmed", time: hhmm },
        { label: "Rider assigned", time: null },
        { label: "Picked up", time: null },
        { label: "Delivered", time: null },
      ],
    };
    db.orders.unshift(order);
    db.notifications.unshift({
      id: `n${Date.now()}`,
      title: "Your delivery is confirmed",
      body: `${order.code} · We're finding a nearby rider.`,
      createdAt: t.toISOString(),
      read: false,
      kind: "confirmed",
    });
    return clone(order);
  },
  async cancelOrder(id: string, reason: string) {
    await delay();
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    order.status = "cancelled";
    order.cancelReason = reason;
    return clone(order);
  },
  async rateOrder(id: string, rating: number, comment: string) {
    await delay();
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    order.rating = rating;
    order.ratingComment = comment;
    return clone(order);
  },

  // ---- profile ----
  async getProfile() {
    await delay(300);
    return clone(db.profile);
  },
  async updateProfile(patch: Partial<Pick<Profile, "name" | "email" | "phone" | "avatar">>) {
    await delay();
    Object.assign(db.profile, patch);
    return clone(db.profile);
  },

  // ---- misc ----
  async getNotifications() {
    await delay(300);
    return clone(db.notifications);
  },
  async markAllNotificationsRead() {
    await delay(200);
    db.notifications.forEach((n) => (n.read = true));
    return true;
  },
  async getWallet() {
    await delay(300);
    return clone(db.wallet);
  },
  async getLoyalty() {
    await delay(300);
    return clone(db.loyalty);
  },
  async redeemReward(rewardId: string) {
    await delay();
    const reward = db.loyalty.rewards.find((r) => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");
    if (db.loyalty.points < reward.points) throw new Error("Not enough points");
    db.loyalty.points -= reward.points;
    db.loyalty.history.unshift({ id: `h${Date.now()}`, title: "Reward Redemption", date: "Today", points: -reward.points });
    return clone(db.loyalty);
  },
  async getTickets() {
    await delay(300);
    return clone(db.tickets);
  },
  async createTicket(input: CreateTicketInput) {
    await delay(700);
    const ticket: Ticket = {
      id: `t${Date.now()}`,
      title: input.issueType,
      orderCode: input.orderNumber,
      createdAt: "Today",
      status: "in-progress",
      category: input.relatedTo === "order" ? "order" : "account",
    };
    db.tickets.unshift(ticket);
    return clone(ticket);
  },
};
