import { type NextRequest, NextResponse } from "next/server";

import { apiRequest } from "@/lib/api";
import { serverEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

/**
 * Callback route: GET /api/auth/google/callback
 *
 * The FastAPI backend redirects here after a successful Google OAuth flow,
 * passing the short-lived JWT as a `?token=` query parameter.
 *
 * This handler:
 * 1. Validates the token by fetching /api/v1/auth/me from the API.
 * 2. Sets the httpOnly session cookie (same as the password login flow).
 * 3. Redirects the user to the dashboard.
 *
 * On any failure it redirects to /login with an ?error= message.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  if (error || !token) {
    const errorMsg = error ?? "authentication_failed";
    return NextResponse.redirect(
      new URL(`/login?error=${errorMsg}`, request.url),
      302,
    );
  }

  try {
    // Verify the token is valid before storing it.
    await apiRequest<SessionUser>("/api/v1/auth/me", { token });
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url),
      302,
    );
  }

  const response = NextResponse.redirect(new URL("/", request.url), 302);
  response.cookies.set(serverEnv.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30, // 30 minutes — matches API token lifetime
  });
  return response;
}
