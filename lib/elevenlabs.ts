// lib/elevenlabs.ts
import axios from "axios";

const VOICE_NORMAL = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const VOICE_BRAINROT = "pNInz6obpgDQGcFmaJgB"; // Adam — fast, energetic
const MODEL_ID = "eleven_turbo_v2_5";

export async function generateVoiceover(narration: string, style?: string): Promise<string> {
  const isBrainrot = style === "brainrot";
  const voiceId = isBrainrot ? VOICE_BRAINROT : VOICE_NORMAL;

  // Step 1: Generate audio binary from ElevenLabs
  console.log("🎙️ Calling ElevenLabs TTS...");
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: narration,
      model_id: MODEL_ID,
      voice_settings: isBrainrot
        ? { stability: 0.2, similarity_boost: 0.9, style: 0.8, use_speaker_boost: true }
        : { stability: 0.5, similarity_boost: 0.75 },
    },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
    }
  );

  // Step 2: Upload to Cloudinary (free, no auth needed for unsigned uploads)
  console.log("☁️ Uploading voiceover to Cloudinary...");
  const audioBuffer = Buffer.from(response.data);
  const base64Audio = audioBuffer.toString("base64");

  const formData = new FormData();
  formData.append("file", `data:audio/mp3;base64,${base64Audio}`);
  formData.append("upload_preset", "threadcut_audio"); // unsigned preset
  formData.append("resource_type", "video"); // Cloudinary uses "video" for audio

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    formData
  );

  return cloudRes.data.secure_url;
}

const MUSIC_PROMPTS: Record<string, string> = {
  educational: "calm ambient background music, soft piano melody, gentle and minimal",
  hype:        "energetic upbeat electronic music, driving beat, high energy",
  storytelling:"cinematic atmospheric background music, emotional strings, building tension",
  promo:       "upbeat corporate background music, modern and polished, optimistic",
  brainrot:    "chaotic trap beat, gaming music, hyper energetic bass drop",
};

export async function generateBackgroundMusic(style?: string): Promise<string> {
  const prompt = MUSIC_PROMPTS[style ?? "educational"] ?? MUSIC_PROMPTS.educational;

  const response = await axios.post(
    "https://api.elevenlabs.io/v1/sound-generation",
    { text: prompt, duration_seconds: 22, prompt_influence: 0.4 },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
    }
  );

  const audioBuffer = Buffer.from(response.data);
  const base64Audio = audioBuffer.toString("base64");

  const formData = new FormData();
  formData.append("file", `data:audio/mp3;base64,${base64Audio}`);
  formData.append("upload_preset", "threadcut_audio");
  formData.append("resource_type", "video");

  const cloudRes = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    formData
  );

  return cloudRes.data.secure_url;
}