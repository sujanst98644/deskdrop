import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-guard";
import ImageKit from "imagekit";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json({ error: "ImageKit is not configured" }, { status: 500 });
  }

  const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

  const params = imagekit.getAuthenticationParameters(
    undefined,
    Math.floor(Date.now() / 1000) + 300 // 5 min from now
  );

  return NextResponse.json({
    token: params.token,
    expire: params.expire,
    signature: params.signature,
    publicKey,
    urlEndpoint,
  });
}
