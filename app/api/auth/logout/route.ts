import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(serverEnv.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
