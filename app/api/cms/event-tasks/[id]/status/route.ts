import { NextRequest, NextResponse } from "next/server";

import { apiRequest } from "@/lib/api";
import { getAuthToken } from "@/lib/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const payload = await request.json();

    const updated = await apiRequest(`/api/v1/event-tasks/${id}/status`, {
      method: "PATCH",
      token,
      body: payload,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update task status.",
      },
      { status: 400 },
    );
  }
}
