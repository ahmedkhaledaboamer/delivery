import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * The in-progress delivery request (the "draft") that the multi-step flows fill in.
 * - send / receive / shopping: customer flows (service picker -> ... -> Payment Successful)
 * - store: store flow (Create Delivery Request -> Order #1..n -> Confirm route -> Order Confirmed)
 */
export type FlowType = "send" | "receive" | "shopping" | "store";
export type Speed = "minutes" | "standard";
export type Vehicle = "motorcycle" | "car";
export type DeliveryPreference = "call" | "no-knock" | "leave-at-reception" | "ring-bell";

export type Contact = { fullName: string; phone: string };

export type Stop = {
  address: string;
  notes: string;
  contact: Contact;
  latitude?: number;
  longitude?: number;
};

export type StoreOrder = {
  dropoff: Stop;
  contents: string;
};

export type ShoppingDetails = {
  storeName: string;
  request: string;
  alreadyPaid: boolean;
  expectedValue: string;
  attachmentName: string | null;
};

type DeliveryState = {
  flow: FlowType;
  speed: Speed | null;
  vehicle: Vehicle | null;
  pickup: Stop;
  dropoff: Stop;
  packageContents: string;
  preferences: DeliveryPreference[];
  deliveryNotes: string;
  agreedToTerms: boolean;
  tip: number;
  promoCode: string | null;
  useLoyaltyPoints: boolean;
  shopping: ShoppingDetails;
  storeOrderType: "single" | "multiple" | null;
  storeOrders: StoreOrder[];
};

const emptyStop = (): Stop => ({ address: "", notes: "", contact: { fullName: "", phone: "" } });

const initialState: DeliveryState = {
  flow: "send",
  speed: null,
  vehicle: null,
  pickup: emptyStop(),
  dropoff: emptyStop(),
  packageContents: "",
  preferences: [],
  deliveryNotes: "",
  agreedToTerms: false,
  tip: 0,
  promoCode: null,
  useLoyaltyPoints: false,
  shopping: { storeName: "", request: "", alreadyPaid: false, expectedValue: "", attachmentName: null },
  storeOrderType: null,
  storeOrders: [],
};

export const MAX_STORE_ORDERS = 4;

function resize(orders: StoreOrder[], count: number): StoreOrder[] {
  const next = orders.slice(0, count);
  while (next.length < count) next.push({ dropoff: emptyStop(), contents: "" });
  return next;
}

const deliverySlice = createSlice({
  name: "delivery",
  initialState,
  reducers: {
    startFlow(_state, action: PayloadAction<FlowType>) {
      return { ...initialState, pickup: emptyStop(), dropoff: emptyStop(), flow: action.payload };
    },
    setSpeed(state, action: PayloadAction<Speed>) {
      state.speed = action.payload;
    },
    setVehicle(state, action: PayloadAction<Vehicle>) {
      state.vehicle = action.payload;
    },
    setPickup(state, action: PayloadAction<Partial<Stop>>) {
      Object.assign(state.pickup, action.payload);
    },
    setDropoff(state, action: PayloadAction<Partial<Stop>>) {
      Object.assign(state.dropoff, action.payload);
    },
    setPackageContents(state, action: PayloadAction<string>) {
      state.packageContents = action.payload;
    },
    togglePreference(state, action: PayloadAction<DeliveryPreference>) {
      const p = action.payload;
      state.preferences = state.preferences.includes(p)
        ? state.preferences.filter((x) => x !== p)
        : [...state.preferences, p];
    },
    setDeliveryNotes(state, action: PayloadAction<string>) {
      state.deliveryNotes = action.payload;
    },
    setAgreedToTerms(state, action: PayloadAction<boolean>) {
      state.agreedToTerms = action.payload;
    },
    setTip(state, action: PayloadAction<number>) {
      state.tip = action.payload;
    },
    setPromoCode(state, action: PayloadAction<string | null>) {
      state.promoCode = action.payload;
    },
    setUseLoyaltyPoints(state, action: PayloadAction<boolean>) {
      state.useLoyaltyPoints = action.payload;
    },
    setShopping(state, action: PayloadAction<Partial<ShoppingDetails>>) {
      Object.assign(state.shopping, action.payload);
    },
    setStoreOrderType(state, action: PayloadAction<"single" | "multiple">) {
      state.storeOrderType = action.payload;
      const count = action.payload === "single" ? 1 : Math.max(2, state.storeOrders.length);
      state.storeOrders = resize(state.storeOrders, count);
      if (action.payload === "multiple") state.vehicle = "car"; // design note: multiple orders are cars only
    },
    setStoreOrderCount(state, action: PayloadAction<number>) {
      const count = Math.min(MAX_STORE_ORDERS, Math.max(2, action.payload));
      state.storeOrders = resize(state.storeOrders, count);
    },
    updateStoreOrder(state, action: PayloadAction<{ index: number; dropoff?: Partial<Stop>; contents?: string }>) {
      const order = state.storeOrders[action.payload.index];
      if (!order) return;
      if (action.payload.dropoff) Object.assign(order.dropoff, action.payload.dropoff);
      if (action.payload.contents !== undefined) order.contents = action.payload.contents;
    },
    resetDelivery() {
      return { ...initialState, pickup: emptyStop(), dropoff: emptyStop() };
    },
  },
});

export const {
  startFlow,
  setSpeed,
  setVehicle,
  setPickup,
  setDropoff,
  setPackageContents,
  togglePreference,
  setDeliveryNotes,
  setAgreedToTerms,
  setTip,
  setPromoCode,
  setUseLoyaltyPoints,
  setShopping,
  setStoreOrderType,
  setStoreOrderCount,
  updateStoreOrder,
  resetDelivery,
} = deliverySlice.actions;
export default deliverySlice.reducer;
