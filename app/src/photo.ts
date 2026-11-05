// The photo comes from the phone's own camera, not from a viewfinder inside the app: one tap, the system camera, back with a
// small JPEG. (The web version, photo.web.ts, does the same with a file input, which opens the camera on a phone.)
import * as ImagePicker from "expo-image-picker";

export interface Photo { uri: string; base64: string }

/** Where the picture comes from: a photo taken now, or one already on the phone (BR-01m6ph6dq7aszxhxgzz4kgr8d4, the gallery). */
export type PhotoSource = "camera" | "gallery";

/** Opens the camera or the gallery; resolves with the picture, or undefined when the person cancelled or did not allow it. */
export async function takePhoto(from: PhotoSource = "camera"): Promise<Photo | undefined> {
  const allowed = from === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!allowed.granted) return undefined;
  const r = from === "camera"
    ? await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true, exif: false })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.6, base64: true, exif: false });
  const a = r.canceled ? undefined : r.assets[0];
  return a?.base64 ? { uri: a.uri, base64: a.base64 } : undefined;
}
