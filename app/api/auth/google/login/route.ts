import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";

/**
 * Proxy route: GET /api/auth/google/login
 *
 * Redirects the browser to the FastAPI Google OAuth initiation endpoint.
 * This keeps the API base URL server-side and avoids exposing it via a
 * NEXT_PUBLIC env var.
 */
export async function GET() {
  return NextResponse.redirect(
    `${serverEnv.API_BASE_URL}/auth/google/login`,
    302,
  );
}
