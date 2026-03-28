// app/api/voiceover/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateVoiceover } from "@/lib/elevenlabs";

export async function POST(req: NextRequest) {
  try {
    const { narration } = await req.json();

    if (!narration || narration.trim().length === 0) {
      return NextResponse.json({ error: "No narration provided" }, { status: 400 });
    }

    const audioUrl = await generateVoiceover(narration);
    return NextResponse.json({ audioUrl });
  } catch (error: any) {
    console.error("Voiceover error:", error?.response?.data || error?.message);
    return NextResponse.json(
      { error: "Failed to generate voiceover" },
      { status: 500 }
    );
  }
}