import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname, search } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/auth");
  const isProtected = pathname.startsWith("/admin");

  // kalau ke /admin tapi belum login ⇒ redirect ke signin
  if (isProtected && !token) {
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // kalau sudah login tapi ke /auth ⇒ lempar ke dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*"],
};
