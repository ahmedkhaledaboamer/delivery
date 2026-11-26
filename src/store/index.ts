import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import authReducer from "./slices/authSlice";
import deliveryReducer from "./slices/deliverySlice";
import settingsReducer from "./slices/settingsSlice";
import driverReducer from "./slices/driverSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  delivery: deliveryReducer,
  settings: settingsReducer,
  driver: driverReducer,
});

/**
 * Saved on the phone so the app reopens where the user left it:
 * sign-in (auth), language & preferences (settings) and the driver's online status.
 * The in-progress delivery draft is intentionally NOT saved.
 */
const persistConfig = {
  key: "apex-aora",
  version: 1,
  storage: AsyncStorage,
  whitelist: ["auth", "settings", "driver"],
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefault) =>
    getDefault({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
