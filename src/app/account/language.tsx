import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, RadioRow, Screen } from "@/components/ui";
import { AccountHeader, IconTile } from "@/components/account";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLanguage, type Language } from "@/store/slices/settingsSlice";
import { applyLanguageDirection, useT } from "@/i18n";

/** Choose your language. Switching between English (LTR) and Arabic (RTL) reloads the app once to flip the layout. */
export default function LanguageScreen() {
  const t = useT();
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.language);
  const [selected, setSelected] = useState<Language>(current);
  const [saving, setSaving] = useState(false);

  const OPTIONS: { value: Language; title: string; subtitle: string }[] = [
    { value: "en", title: "English", subtitle: t("account.langEnglishSub") },
    { value: "ar", title: "العربية", subtitle: t("account.langArabicSub") },
  ];

  const save = async () => {
    if (selected === current) return router.back();
    setSaving(true);
    dispatch(setLanguage(selected));
    const reloading = await applyLanguageDirection(selected);
    if (!reloading) {
      setSaving(false);
      router.back();
    }
  };

  return (
    <Screen edges={["bottom"]} background="white" footer={<Button title={t("account.saveLanguage")} loading={saving} onPress={save} />}>
      <AccountHeader title={t("account.languageTitle")} subtitle={t("account.languageSubtitle")} />
      <View className="px-5 pt-5">
        {OPTIONS.map((o) => (
          <RadioRow
            key={o.value}
            selected={selected === o.value}
            onPress={() => setSelected(o.value)}
            title={o.title}
            subtitle={o.subtitle}
            left={<IconTile name="globe-outline" size={32} iconSize={18} rounded="rounded-full" />}
          />
        ))}
      </View>
    </Screen>
  );
}
