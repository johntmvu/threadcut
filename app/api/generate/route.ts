// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/gemini";
import { fetchAllClips } from "@/lib/pexels";
import { generateVoiceover } from "@/lib/elevenlabs";
import { buildAndRender } from "@/lib/shotstack";

export async function POST(req: NextRequest) {
  try {
    const { topic, style } = await req.json();

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { error: "Topic too short — try something more specific" },
        { status: 400 }
      );
    }

    console.log("🎬 Agent 1: Generating script...");
    const script = await generateScript(topic, style || "educational");

    console.log("🎨 Agent 2+3: Fetching visuals...");
    const clips = await fetchAllClips(script.scenes);

    console.log("🎙️ Agent 4: Generating voiceover...");
    const audioUrl = await generateVoiceover(script.narration);

    console.log("🎞️ Agent 5: Rendering video...");
    const videoUrl = await buildAndRender(clips, audioUrl, script.scenes);

    console.log("✅ Pipeline complete:", videoUrl);

    return NextResponse.json({
      videoUrl,
      script,
      audioUrl,
    });
  } catch (error: any) {
    console.error("Pipeline error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Pipeline failed" },
      { status: 500 }
    );
  }
}