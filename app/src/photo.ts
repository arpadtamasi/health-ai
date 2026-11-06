// The photo comes from the phone, not from a viewfinder inside the app. BR-01m6ph6dq7aszxhxgzz4kgr8d4: the camera button opens the
// phone's own photo menu (a photo now or one from the gallery) and the app draws no menu of its own (EX-01m6ph6e4bcenyjywdahg41g4r).
// The web version, photo.web.ts, does the same with a file input, which shows that menu on a phone.
import * as ImagePicker from "expo-image-picker";
import { ActionSheetIOS, Alert, Platform } from "react-native";

export interface Photo { uri: string; base64: string }

/** Where the picture comes from: a photo taken now, or one already on the phone (BR-01m6ph6dq7aszxhxgzz4kgr8d4, the gallery). */
export type PhotoSource = "camera" | "gallery";

/** The words of the system menu on a native build; the web shows the browser's own. */
export interface PhotoWords { now: string; gallery: string; cancel: string }

/** The phone's own menu: iOS's action sheet, Android's dialog. */
const ask = (w: PhotoWords): Promise<PhotoSource | undefined> => new Promise((resolve) => {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions({ options: [w.now, w.gallery, w.cancel], cancelButtonIndex: 2 }, (i) => resolve(i === 0 ? "camera" : i === 1 ? "gallery" : undefined));
  } else {
    Alert.alert("", undefined, [{ text: w.now, onPress: () => resolve("camera") }, { text: w.gallery, onPress: () => resolve("gallery") }, { text: w.cancel, style: "cancel", onPress: () => resolve(undefined) }],
      { cancelable: true, onDismiss: () => resolve(undefined) });
  }
});

/** Opens the phone's photo menu, then the camera or the gallery; resolves with the picture, or undefined when cancelled or not allowed. */
export async function takePhoto(words: PhotoWords): Promise<Photo | undefined> {
  const from = await ask(words);
  if (!from) return undefined;
  const allowed = from === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!allowed.granted) return undefined;
  const r = from === "camera"
    ? await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true, exif: false })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6, base64: true, exif: false });
  const a = r.canceled ? undefined : r.assets[0];
  return a?.base64 ? { uri: a.uri, base64: a.base64 } : undefined;
}
