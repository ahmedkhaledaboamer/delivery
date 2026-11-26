import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Header, PageTitle, RadioRow, Screen } from "@/components/ui";
import { IconTile } from "@/components/account";
import { useAppDispatch, useAppSelector } from "@/store";
import { setLanguage, type Language } from "@/store/slices/settingsSlice";

// TODO: full Arabic translation (i18n strings) and RTL layout (I18nManager.forceRTL + reload) are not implemented yet —
// this only stores the preference.
const OPTIONS: { value: Language; title: string; subtitle: string }[] = [
  { value: "en", title: "English", subtitle: "English · Left to right" },
  { value: "ar", title: "العربية", subtitle: "Arabic · Right to left" },
];

export default function LanguageScreen() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((s) => s.settings.language);
  const [selected, setSelected] = useState<Language>(current);

  return (
    <Screen
      footer={
        <Button
          title="Save language"
          onPress={() => {
            dispatch(setLanguage(selected));
            router.back();
          }}
        />
      }
    >
      <View className="bg-brand-lighter pb-5">
        <Header actions />
        <PageTitle title="Choose your language" subtitle="Make RUSH feel right for you." />
      </View>
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
