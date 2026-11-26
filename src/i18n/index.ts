import { useCallback } from "react";
import { I18nManager } from "react-native";
import { reloadAppAsync } from "expo";
import { persistor, useAppSelector } from "@/store";
import type { Language } from "@/store/slices/settingsSlice";
import { namespaces } from "./locales";

/**
 * Translations
 * ------------
 * Strings live in src/i18n/locales/<namespace>.ts as { en: {...}, ar: {...} }.
 * Use keys as "namespace.key":   const t = useT();  t("auth.signIn")  /  t("orders.count", { n: 3 })
 * Placeholders use {name}. Missing Arabic falls back to English, missing English shows the key.
 */

type Dict = Record<string, string>;

const flatten = (lang: Language): Dict => {
  const out: Dict = {};
  for (const [ns, d] of Object.entries(namespaces)) {
    for (const [k, v] of Object.entries(d[lang] ?? {})) out[`${ns}.${k}`] = v;
  }
  return out;
};

const tables: Record<Language, Dict> = { en: flatten("en"), ar: flatten("ar") };

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

export function translate(lang: Language, key: string, vars?: Record<string, string | number>): string {
  let s = tables[lang][key] ?? tables.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** Hook: translation function for the current language. Re-renders when the language changes. */
export function useT(): TFunction {
  const lang = useAppSelector((s) => s.settings.language);
  return useCallback((key, vars) => translate(lang, key, vars), [lang]);
}

export function useLanguage(): Language {
  return useAppSelector((s) => s.settings.language);
}

/** True when the UI is laid out right-to-left (Arabic). */
export const isRTL = () => I18nManager.isRTL;

/**
 * Makes the native layout direction match the language. Changing direction needs an app reload,
 * which happens right away (state is saved first, so the user stays where they were).
 * Returns true if a reload was triggered.
 */
export async function applyLanguageDirection(lang: Language): Promise<boolean> {
  const wantRTL = lang === "ar";
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(wantRTL);
  if (I18nManager.isRTL !== wantRTL) {
    await persistor.flush();
    await reloadAppAsync("Language direction changed");
    return true;
  }
  return false;
}
