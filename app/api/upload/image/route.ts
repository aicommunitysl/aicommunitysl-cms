import { NextResponse } from "next/server";

import { apiRequest } from "@/lib/api";
import { getAuthToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 },
      );
    }

    const uploadData = new FormData();
    uploadData.set("file", file);

    const result = await apiRequest<{ url: string }>("/api/v1/upload/image", {
      method: "POST",
      token,
      body: uploadData,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 400 },
    );
  }
}
