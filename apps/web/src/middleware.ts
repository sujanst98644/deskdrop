import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

    // withAuth already blocks protected routes when unauthenticated (see
    // `authorized` callback below). This extra check redirects *logged-in*
    // users away from the auth pages.
    if (isAuthPage && req.nextauth.token) {
      return NextResponse.redirect(new URL("/browse", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/sell");
        if (isProtected) return !!token;
        return true; // let sign-in/sign-up through; handled above
      },
    },
    pages: { signIn: "/sign-in" },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/sell/:path*", "/sign-in", "/sign-up"],
};
