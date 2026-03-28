// app/api/visuals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchAllClips } from "@/lib/pexels";

export async function POST(req: NextRequest) {
  try {
    const { scenes } = await req.json();

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: "No scenes provided" }, { status: 400 });
    }

    const clips = await fetchAllClips(scenes);
    return NextResponse.json({ clips });
  } catch (error) {
    console.error("Visuals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch visuals" },
      { status: 500 }
    );
  }
}