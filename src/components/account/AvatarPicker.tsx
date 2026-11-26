import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "./index";
import { colors } from "@/constants/theme";
import { useT } from "@/i18n";

type Props = {
  name: string;
  uri?: string;
  size?: number;
  /** Called with the new local image uri, or undefined when the photo is removed. */
  onChange: (uri: string | undefined) => void | Promise<void>;
  busy?: boolean;
};

const PICK_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.7,
};

/**
 * Profile photo with a small camera badge. Tapping it offers:
 * Take photo · Choose from gallery · Remove photo.
 */
export function AvatarPicker({ name, uri, size = 64, onChange, busy }: Props) {
  const t = useT();
  const [working, setWorking] = useState(false);

  const run = async (source: "camera" | "library") => {
    try {
      setWorking(true);
      const perm =
        source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          t("account.permissionNeeded"),
          source === "camera" ? t("account.cameraPermission") : t("account.libraryPermission"),
        );
        return;
      }
      const res = source === "camera" ? await ImagePicker.launchCameraAsync(PICK_OPTIONS) : await ImagePicker.launchImageLibraryAsync(PICK_OPTIONS);
      if (!res.canceled && res.assets[0]) await onChange(res.assets[0].uri);
    } catch {
      Alert.alert(t("account.couldntOpen"), t("account.tryAgain"));
    } finally {
      setWorking(false);
    }
  };

  const openMenu = () => {
    Alert.alert(t("account.profilePhoto"), undefined, [
      { text: t("account.takePhoto"), onPress: () => run("camera") },
      { text: t("account.chooseFromGallery"), onPress: () => run("library") },
      ...(uri ? [{ text: t("account.removePhoto"), style: "destructive" as const, onPress: () => onChange(undefined) }] : []),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  const loading = working || busy;
  const badge = Math.max(22, Math.round(size * 0.36));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("account.changeProfilePhoto")}
      onPress={openMenu}
      disabled={loading}
      className="active:opacity-80"
      style={{ width: size, height: size }}
    >
      <Avatar name={name} uri={uri} size={size} />
      {loading && (
        <View className="absolute inset-0 items-center justify-center rounded-full bg-black/30">
          <ActivityIndicator color={colors.white} />
        </View>
      )}
      <View
        className="absolute items-center justify-center rounded-full border-2 border-white bg-brand"
        style={{ width: badge, height: badge, end: -2, bottom: -2 }}
      >
        <Ionicons name="camera" size={badge * 0.55} color={colors.white} />
      </View>
    </Pressable>
  );
}
