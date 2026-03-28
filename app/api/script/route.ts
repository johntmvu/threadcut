// app/api/script/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { topic, style } = await req.json();

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { error: "Topic too short — try something more specific" },
        { status: 400 }
      );
    }

    const script = await generateScript(topic, style || "educational");
    return NextResponse.json(script);
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
}