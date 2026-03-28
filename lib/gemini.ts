// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface Scene {
  number: number;
  narration: string;
  visualQuery: string;
  caption: string;
  duration: number;
}

export interface Script {
  title: string;
  narration: string;
  scenes: Scene[];
}

export async function generateScript(topic: string, style: string): Promise<Script> {
  const isBrainrot = style === "brainrot";

  const toneInstructions = isBrainrot
    ? `You are an unhinged, hyperactive Gen Z scriptwriter who writes in pure brainrot internet speak.
Use ALL CAPS randomly, excessive punctuation!!!, meme references, "no cap", "fr fr", "Ohio", "rizz", "slay", "delulu", "it's giving", "W", "L", "based", "lowkey", "ngl", chaotic energy throughout.
Short punchy sentences. Every scene must feel like it was written at 3am after too much energy drink.`
    : `You are a professional short-form video scriptwriter specializing in viral TikTok and Instagram Reels.`;

  const prompt = `
${toneInstructions}

Given a topic or brand, generate a complete 28-second video script broken into exactly 4 scenes.

Respond with valid JSON only. No preamble, no markdown fences, no explanation.

{
  "title": "Punchy video title (max 3 words)",
  "narration": "Full voiceover script as one continuous paragraph",
  "scenes": [
    {
      "number": 1,
      "narration": "Spoken words for this scene only",
      "visualQuery": "Specific Pexels stock video search term (3-5 words)",
      "caption": "Short on-screen text (max 3 words)",
      "duration": 7
    }
  ]
}

Rules:
- Scene 1 (7s): Strong hook — surprising stat, bold claim, or question
- Scenes 2-3 (7s each): Core value or information
- Scene 4 (7s): CTA — follow, share, visit, or buy
- All scene durations must sum to exactly 28
- visualQuery must be specific and searchable (e.g. "person drinking coffee cafe" not "coffee")
- Script tone must match style: ${style}
- Topic: ${topic}
  `;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}