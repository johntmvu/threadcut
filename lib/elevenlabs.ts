// lib/elevenlabs.ts
import axios from "axios";

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah
const MODEL_ID = "eleven_turbo_v2_5";

export async function generateVoiceover(narration: string): Promise<string> {
  // Step 1: Generate audio binary from ElevenLabs
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      text: narration,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
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