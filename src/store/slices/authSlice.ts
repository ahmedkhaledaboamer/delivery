import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "customer" | "store";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  storeName?: string;
  avatar?: string;
};

type AuthState = {
  hasOnboarded: boolean;
  role: Role; // selected on the sign-in / sign-up tabs
  pendingPhone: string | null; // phone waiting for OTP verification
  pendingMode: "sign-in" | "sign-up" | null;
  user: User | null;
  token: string | null;
  isGuest: boolean;
};

const initialState: AuthState = {
  hasOnboarded: false,
  role: "customer",
  pendingPhone: null,
  pendingMode: null,
  user: null,
  token: null,
  isGuest: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.hasOnboarded = true;
    },
    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
    },
    startVerification(state, action: PayloadAction<{ phone: string; mode: "sign-in" | "sign-up" }>) {
      state.pendingPhone = action.payload.phone;
      state.pendingMode = action.payload.mode;
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.isGuest = false;
      state.pendingPhone = null;
      state.pendingMode = null;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) Object.assign(state.user, action.payload);
    },
    continueAsGuest(state) {
      state.isGuest = true;
      state.user = null;
      state.token = null;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isGuest = false;
    },
  },
});

export const { completeOnboarding, setRole, startVerification, setCredentials, updateUser, continueAsGuest, logout } =
  authSlice.actions;
export default authSlice.reducer;
