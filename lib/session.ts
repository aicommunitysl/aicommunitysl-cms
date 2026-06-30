import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiRequest } from "@/lib/api";
import { serverEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(serverEnv.SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) {
    return null;
  }

  try {
    return await apiRequest<SessionUser>("/api/v1/auth/me", { token });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  return currentUser;
}

export async function requireAdminUser() {
  const currentUser = await requireUser();
  if (currentUser.role !== "admin") {
    redirect("/");
  }

  return currentUser;
}
