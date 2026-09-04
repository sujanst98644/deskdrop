import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = getSessionCookie(req) !== null;

  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) {
    return hasSession
      ? NextResponse.redirect(new URL("/browse", req.url))
      : NextResponse.next();
  }

  if (!hasSession) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sell/:path*", "/sign-in", "/sign-up"],
};
