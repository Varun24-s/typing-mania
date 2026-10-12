import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/not-supported") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(userAgent);

  if (isMobile) {
    return NextResponse.redirect(new URL("/not-supported", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
