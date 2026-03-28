// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/gemini";
import { fetchAllClips } from "@/lib/pexels";
import { generateVoiceover, generateBackgroundMusic } from "@/lib/elevenlabs";
import { buildAndRender } from "@/lib/shotstack";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topic, style, music } = await req.json();

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
    const [audioUrl, musicUrl] = await Promise.all([
      generateVoiceover(script.narration, style),
      music ? generateBackgroundMusic(style) : Promise.resolve(undefined),
    ]);

    console.log("🎞️ Agent 5: Rendering video...");
    const videoUrl = await buildAndRender(clips, audioUrl, script.title, script.scenes, style, musicUrl);

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