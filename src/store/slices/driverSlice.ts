import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Vehicle } from "./deliverySlice";

/** Driver (rider) app state that lives on the phone. Jobs themselves come from the API (TanStack Query). */
type DriverState = {
  online: boolean;
  /** Order the driver is currently delivering, if any. */
  activeOrderId: string | null;
  /** Vehicle the driver rides — shown to customers on their tracking screen. */
  vehicle: Vehicle;
  /** Licence plate, e.g. "DXB A 12345". */
  plate: string;
  /** Requests the driver tapped "Skip" on — hidden from the list on this phone. */
  skippedIds: string[];
};

const initialState: DriverState = { online: false, activeOrderId: null, vehicle: "motorcycle", plate: "", skippedIds: [] };

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
    setActiveOrder(state, action: PayloadAction<string | null>) {
      state.activeOrderId = action.payload;
    },
    setVehicleDetails(state, action: PayloadAction<{ vehicle: Vehicle; plate: string }>) {
      state.vehicle = action.payload.vehicle;
      state.plate = action.payload.plate;
    },
    skipRequest(state, action: PayloadAction<string>) {
      // Older saved states (before this field existed) may not have the array yet.
      state.skippedIds = [...(state.skippedIds ?? []).slice(-49), action.payload];
    },
    resetDriver(state) {
      state.online = false;
      state.activeOrderId = null;
      state.skippedIds = [];
    },
  },
});

export const { setOnline, setActiveOrder, setVehicleDetails, skipRequest, resetDriver } = driverSlice.actions;
export default driverSlice.reducer;
