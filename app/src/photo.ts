// The photo comes from the phone's own camera, not from a viewfinder inside the app: one tap, the system camera, back with a
// small JPEG. (The web version, photo.web.ts, does the same with a file input, which opens the camera on a phone.)
import * as ImagePicker from "expo-image-picker";

export interface Photo { uri: string; base64: string }

/** Opens the camera; resolves with the picture, or undefined when the person cancelled or did not allow the camera. */
export async function takePhoto(): Promise<Photo | undefined> {
  const allowed = await ImagePicker.requestCameraPermissionsAsync();
  if (!allowed.granted) return undefined;
  const r = await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true, exif: false });
  const a = r.canceled ? undefined : r.assets[0];
  return a?.base64 ? { uri: a.uri, base64: a.base64 } : undefined;
}
