/**
 * Turns a chosen photo into a small square avatar, entirely in the browser.
 *
 * The centre square is cropped and scaled to `size` px, then saved as JPEG.
 * A 256px avatar is roughly 15–25 KB, small enough to store with the profile
 * until the store moves images to a dedicated host (e.g. Cloudinary).
 */
const ACCEPTED = /^image\/(jpeg|png|webp|gif)$/;
const MAX_BYTES = 10 * 1024 * 1024;

export const toAvatarDataUrl = (file, size = 256) =>
  new Promise((resolve, reject) => {
    if (!file || !ACCEPTED.test(file.type)) {
      reject(new Error("Choose a JPG, PNG or WebP image."));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("That image is larger than 10 MB."));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingQuality = "high";
      context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as an image."));
    };
    image.src = url;
  });

export default toAvatarDataUrl;
