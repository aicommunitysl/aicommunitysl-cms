import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";

/**
 * Proxy route: GET /api/auth/google/login
 *
 * Redirects the browser to the FastAPI Google OAuth initiation endpoint.
 * This keeps the API base URL server-side and avoids exposing it via a
 * NEXT_PUBLIC env var.
 *
 * We pass `frontend_url` so the API knows which CMS origin to redirect back
 * to after OAuth completes — critical for production deployments where the
 * API's FRONTEND_URL env var may not be set to this CMS's domain.
 */
export async function GET() {
  const loginUrl = new URL(`${serverEnv.API_BASE_URL}/auth/google/login`);
  loginUrl.searchParams.set("frontend_url", serverEnv.APP_URL);
  return NextResponse.redirect(loginUrl.toString(), 302);
}
