// PRD §7.2 — optional image on evidence. Compressed client-side with the canvas
// API (no backend, no extra dependencies) and stored as a data URI inside the
// activity document. The activity's `url` remains required — the image is extra
// proof, never a replacement for the link (Evidence Rule unchanged).

export const IMAGE_PICK_LIMIT_BYTES = 10 * 1024 * 1024; // refuse to decode > 10 MB
const TARGET_BYTES = 200 * 1024;        // aim ≤ 200 KB after compression
const MAX_DIMENSION = 1024;
const QUALITY_START = 0.7;
const QUALITY_FLOOR = 0.35;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function imageErrorKey(err: unknown): string {
  const code = err instanceof Error ? err.message : "";
  if (code === "bad-type") return "imageBadType";
  if (code === "pick-too-large") return "imageTooLarge";
  return "imageUncompressable";
}

function dimsFor(w: number, h: number, maxDim: number): { w: number; h: number } {
  if (w <= maxDim && h <= maxDim) return { w, h };
  const scale = maxDim / Math.max(w, h);
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) return createImageBitmap(file);
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToDataUrl(src: ImageBitmap | HTMLImageElement, w: number, h: number, quality: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(src, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality); // JPEG: flattens alpha, smallest predictable size
}

// Returns a data URI ≤ ~TARGET_BYTES, or throws a recognizable error.
export async function compressImageFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("bad-type");
  if (file.size > IMAGE_PICK_LIMIT_BYTES) throw new Error("pick-too-large");

  // tiny JPEG/WebP already fine? pass through untouched to avoid double-encode loss
  if (file.type !== "image/png" && file.size <= TARGET_BYTES) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
  }

  const bmp = await loadBitmap(file);
  let { w, h } = dimsFor(bmp.width, bmp.height, MAX_DIMENSION);
  let dataUrl = drawToDataUrl(bmp, w, h, QUALITY_START);
  let quality = QUALITY_START;

  // shrink progressively, then shrink dimensions, until under target or floor
  while (dataUrl.length * 0.75 > TARGET_BYTES && quality > QUALITY_FLOOR) {
    quality = Math.max(QUALITY_FLOOR, quality - 0.12);
    dataUrl = drawToDataUrl(bmp, w, h, quality);
  }
  while (dataUrl.length * 0.75 > TARGET_BYTES && w > 640) {
    w = Math.round(w * 0.8);
    h = Math.round(h * 0.8);
    dataUrl = drawToDataUrl(bmp, w, h, QUALITY_FLOOR);
  }

  if (dataUrl.length * 0.75 > TARGET_BYTES) throw new Error("uncompressable");
  return dataUrl;
}

// data URI byte size = base64 length × 3/4 (approx header overhead ignored)
export function dataUriBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.round(base64.length * 0.75);
}
