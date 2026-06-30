import { NextRequest, NextResponse } from "next/server";

const defaultCookieName = "aicsl_cms_session";

function isProtectedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/events") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/milestones") ||
    pathname.startsWith("/content") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/social") ||
    pathname.startsWith("/speakers") ||
    pathname.startsWith("/users")
  );
}

export function proxy(request: NextRequest) {
  const cookieName = process.env.SESSION_COOKIE_NAME || defaultCookieName;
  const hasSession = Boolean(request.cookies.get(cookieName)?.value);
  const { pathname } = request.nextUrl;

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/events", request.url));
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
