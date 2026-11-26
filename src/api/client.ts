import axios from "axios";
import { QueryClient } from "@tanstack/react-query";
import { store } from "@/store";

/**
 * Real backend client. Screens currently use the fake backend in ./mock.ts (through ./hooks.ts);
 * when the API is ready, swap the mockApi calls in hooks.ts for `api.get/post` calls.
 */
export const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com" });

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});
