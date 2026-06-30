import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api";
import { serverEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

interface LoginPayload {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const tokenResponse = await apiRequest<{
      access_token: string;
      token_type: string;
    }>("/api/v1/auth/signin", {
      method: "POST",
      body: {
        email: body.email,
        password: body.password,
      },
    });

    const user = await apiRequest<SessionUser>("/api/v1/auth/me", {
      token: tokenResponse.access_token,
    });

    const response = NextResponse.json({ user });
    response.cookies.set(
      serverEnv.SESSION_COOKIE_NAME,
      tokenResponse.access_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 30,
      },
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sign in." },
      { status: 401 },
    );
  }
}
