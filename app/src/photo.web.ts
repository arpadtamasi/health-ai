// Web: a file input with capture opens the camera on a phone (and the file chooser on a computer). The picture is scaled down in
// the browser first, so that a 12-megapixel photo is a few hundred kilobytes, not a failed upload.
export interface Photo { uri: string; base64: string }

const LONG_SIDE = 1280;

async function shrink(file: File): Promise<Photo> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, LONG_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const uri = canvas.toDataURL("image/jpeg", 0.72);
  return { uri, base64: uri.split(",")[1]! };
}

export function takePhoto(): Promise<Photo | undefined> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.style.display = "none";
    let settled = false;
    const done = (p?: Photo) => { if (!settled) { settled = true; input.remove(); resolve(p); } };
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return done();
      shrink(f).then(done, () => done());
    };
    input.addEventListener("cancel", () => done());
    document.body.appendChild(input);
    input.click();
  });
}
