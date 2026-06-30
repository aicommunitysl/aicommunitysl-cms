import { NextRequest, NextResponse } from "next/server";

import { apiRequest, getResourcePath } from "@/lib/api";
import { normalizeListEnvelope } from "@/lib/cms";
import { getAuthToken } from "@/lib/session";

function getQueryString(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  return search ? `?${search}` : "";
}

function getTargetPath(resource: string) {
  if (resource === "users") {
    return "/api/v1/users";
  }

  return getResourcePath(resource);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    const token = await getAuthToken();
    const remoteData = await apiRequest<Record<string, unknown>>(
      `${getTargetPath(resource)}${getQueryString(request)}`,
      { token: token ?? undefined },
    );

    return NextResponse.json(normalizeListEnvelope(resource, remoteData));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch records.",
      },
      { status: 400 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    const { resource } = await params;
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const path =
      resource === "users" ? "/api/v1/auth/signup" : getResourcePath(resource);

    const created = await apiRequest(path, {
      method: "POST",
      token,
      body: payload,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create record.",
      },
      { status: 400 },
    );
  }
}
