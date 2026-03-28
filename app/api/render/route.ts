// app/api/render/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildAndRender } from "@/lib/shotstack";

export async function POST(req: NextRequest) {
  try {
    const { clips, audioUrl, title, scenes } = await req.json();

    if (!clips || !audioUrl || !scenes) {
      return NextResponse.json(
        { error: "Missing clips, audioUrl, or scenes" },
        { status: 400 }
      );
    }

    const videoUrl = await buildAndRender(clips, audioUrl, title ?? "", scenes);
    return NextResponse.json({ videoUrl });
  } catch (error: any) {
    console.error("Render error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Render failed" },
      { status: 500 }
    );
  }
}