// Shrinks photos in the browser before upload. Phone photos are often
// 4000+ px and 5-12 MB; the backend stores at most 2048 px anyway, so sending
// the full file only makes uploads over mobile data slow.

/** Same limit as the backend's MAX_IMAGE_SIDE. */
export const MAX_UPLOAD_SIDE = 2048;
const JPEG_QUALITY = 0.9;
/** Small JPEGs are sent as they are. */
const SMALL_ENOUGH_BYTES = 1.5 * 1024 * 1024;

/**
 * Returns a JPEG of at most `maxSide` px with the camera's rotation applied.
 *
 * If the browser can't decode the file (e.g. HEIC outside Safari), the
 * original is returned and the backend decides whether it can use it.
 */
export async function prepareImageForUpload(
  file: File,
  maxSide = MAX_UPLOAD_SIDE,
): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    // "from-image" applies the EXIF orientation, so photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    if (
      scale === 1 &&
      file.type === "image/jpeg" &&
      file.size <= SMALL_ENOUGH_BYTES
    ) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`;
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
