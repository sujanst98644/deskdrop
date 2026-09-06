import ImageKit from "imagekit";

/**
 * ImageKit's browser upload endpoint. Files go straight from the browser to
 * ImageKit — never through this server — so uploads are not bounded by the
 * server action body limit and the app only ever stores the returned URL.
 */
export const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

/** Everything listing photos are uploaded into. */
export const LISTINGS_FOLDER = "/deskdrop/listings";

export type ImageKitConfig = {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
};

/**
 * Reads the ImageKit credentials, or returns null when they are missing, so
 * callers can fail with a useful message instead of constructing a client that
 * throws deep inside the SDK.
 */
export function getImageKitConfig(): ImageKitConfig | null {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) return null;
  return { publicKey, privateKey, urlEndpoint };
}

export function createImageKit(config: ImageKitConfig) {
  return new ImageKit(config);
}
