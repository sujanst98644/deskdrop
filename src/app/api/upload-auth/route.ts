import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";
import { createImageKit, getImageKitConfig, LISTINGS_FOLDER } from "@/lib/imagekit";

/**
 * Hands the browser a short-lived signature so it can upload straight to
 * ImageKit. Each signature is single-use, so the uploader calls this once per
 * file rather than once per batch.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getImageKitConfig();
  if (!config) {
    return NextResponse.json({ error: "ImageKit is not configured" }, { status: 500 });
  }

  const imagekit = createImageKit(config);

  const params = imagekit.getAuthenticationParameters(
    undefined,
    Math.floor(Date.now() / 1000) + 300 // 5 min from now
  );

  return NextResponse.json({
    token: params.token,
    expire: params.expire,
    signature: params.signature,
    publicKey: config.publicKey,
    folder: LISTINGS_FOLDER,
  });
}
