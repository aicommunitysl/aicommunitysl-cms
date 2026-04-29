import { NextRequest, NextResponse } from "next/server";

import { apiRequest, getResourcePath } from "@/lib/api";
import { getAuthToken } from "@/lib/session";

function buildTarget(resource: string, id: string) {
  return `${getResourcePath(resource)}/${id}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const { resource, id } = await params;
    const token = await getAuthToken();
    const data = await apiRequest(buildTarget(resource, id), {
      token: token ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch record.",
      },
      { status: 400 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource, id } = await params;
    const payload = await request.json();
    const updated = await apiRequest(buildTarget(resource, id), {
      method: "PUT",
      token,
      body: payload,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update record.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string; id: string }> },
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource, id } = await params;
    const result = await apiRequest(buildTarget(resource, id), {
      method: "DELETE",
      token,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete record.",
      },
      { status: 400 },
    );
  }
}
