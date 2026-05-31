// Resize + compress a photo in the browser before upload. Phone photos are
// 3-5MB; this brings them to ~200KB, which matters on a site with poor signal.
// createImageBitmap with imageOrientation honours EXIF rotation so photos don't
// come out sideways.
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.7,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let { width, height } = bitmap;
  if (width > height && width > maxDim) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else if (height > maxDim) {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", quality),
  );
}
