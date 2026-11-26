import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import type { LatLng } from "@/lib/geo";
import type { Language } from "@/store/slices/settingsSlice";

/**
 * Place search + reverse geocoding.
 *
 * TODO(production): switch to Google Places (Autocomplete + Place Details) and Google Geocoding with an API key
 * served through our backend. The public OpenStreetMap Nominatim server is fine for a demo but its usage policy
 * allows at most 1 request/second and forbids heavy use: https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM = "https://nominatim.openstreetmap.org";
// Generic app identifier only — never put user data (email, phone, name) in this header.
const HEADERS = { "User-Agent": "ApexAoraApp/1.0", Accept: "application/json" };

export type Place = LatLng & {
  id: string;
  /** Short first line, e.g. "Marina Plaza". */
  title: string;
  /** Full address for the second line and for saving. */
  address: string;
};

// ---- 1 request / second throttle for Nominatim -------------------------------------------------
let nextSlot = 0;
async function throttle(signal?: AbortSignal) {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + 1000;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  if (signal?.aborted) throw new Error("aborted");
}

async function nominatim<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  await throttle(signal);
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${NOMINATIM}${path}?${qs}`, { headers: HEADERS, signal });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return (await res.json()) as T;
}

type NominatimPlace = { place_id: number; lat: string; lon: string; name?: string; display_name: string };

const toPlace = (p: NominatimPlace): Place => {
  const address = p.display_name;
  return {
    id: String(p.place_id),
    latitude: Number(p.lat),
    longitude: Number(p.lon),
    title: p.name || address.split(",")[0],
    address,
  };
};

export async function searchPlaces(query: string, lang: Language, signal?: AbortSignal): Promise<Place[]> {
  const list = await nominatim<NominatimPlace[]>(
    "/search",
    { format: "jsonv2", countrycodes: "ae", limit: "6", "accept-language": lang, q: query },
    signal,
  );
  return list.map(toPlace).filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
}

/** Address text for a point: the phone's geocoder first, Nominatim /reverse as a fallback. */
export async function reverseGeocode(point: LatLng, lang: Language, signal?: AbortSignal): Promise<string> {
  try {
    const [first] = await Location.reverseGeocodeAsync(point);
    if (first) {
      const street = [first.streetNumber, first.street].filter(Boolean).join(" ");
      const parts = [first.name && first.name !== first.streetNumber ? first.name : null, street, first.district, first.city ?? first.region];
      const unique = parts.filter((p, i, arr): p is string => !!p && arr.indexOf(p) === i);
      const text = unique.length >= 2 ? unique.join(", ") : first.formattedAddress;
      if (text) return text;
    }
  } catch {
    // No native geocoder (web / emulator without Play services) or rate limited — fall back below.
  }
  const r = await nominatim<{ display_name?: string; error?: string }>(
    "/reverse",
    { format: "jsonv2", lat: String(point.latitude), lon: String(point.longitude), zoom: "18", "accept-language": lang },
    signal,
  );
  if (!r.display_name) throw new Error(r.error ?? "No address found");
  return r.display_name;
}

/** Value that only updates after it stopped changing for `ms` (used for the search box). */
export function useDebouncedValue<T>(value: T, ms = 500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export const placeKeys = {
  search: (lang: Language, q: string) => ["places", "search", lang, q] as const,
  reverse: (lang: Language, lat: number, lng: number) => ["places", "reverse", lang, lat, lng] as const,
};

/** Address suggestions for the (already debounced) query. Needs at least 3 characters. */
export function usePlaceSearch(query: string, lang: Language) {
  const q = query.trim();
  return useQuery({
    queryKey: placeKeys.search(lang, q),
    queryFn: ({ signal }) => searchPlaces(q, lang, signal),
    enabled: q.length >= 3,
    staleTime: 10 * 60_000,
    retry: 0,
  });
}

/** Address for a map point (rounded to ~1 m so tiny jitters reuse the cache). */
export function useReverseGeocode(point: LatLng | null, lang: Language) {
  const lat = point ? Math.round(point.latitude * 1e5) / 1e5 : 0;
  const lng = point ? Math.round(point.longitude * 1e5) / 1e5 : 0;
  return useQuery({
    queryKey: placeKeys.reverse(lang, lat, lng),
    queryFn: ({ signal }) => reverseGeocode({ latitude: lat, longitude: lng }, lang, signal),
    enabled: !!point,
    staleTime: 30 * 60_000,
    retry: 0,
  });
}
