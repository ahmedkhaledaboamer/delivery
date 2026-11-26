import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "en" | "ar";

type SettingsState = { language: Language; pushNotifications: boolean };

const initialState: SettingsState = { language: "en", pushNotifications: true };

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
    setPushNotifications(state, action: PayloadAction<boolean>) {
      state.pushNotifications = action.payload;
    },
  },
});

export const { setLanguage, setPushNotifications } = settingsSlice.actions;
export default settingsSlice.reducer;
