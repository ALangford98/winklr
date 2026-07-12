export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3MB - keeps localStorage/config exports from silently blowing their quota

export function readImageFileAsDataUrl(file, maxBytes = MAX_IMAGE_BYTES) {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error(`That image is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB). Try a smaller photo.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Couldn't read that file - try a different one."));
    reader.readAsDataURL(file);
  });
}
