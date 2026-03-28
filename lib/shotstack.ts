// lib/shotstack.ts
import axios from "axios";

const SHOTSTACK_API = "https://api.shotstack.io/edit/stage";
const headers = {
  "x-api-key": process.env.SHOTSTACK_API_KEY!,
  "Content-Type": "application/json",
};

interface Clip {
  sceneNumber: number;
  url: string;
  duration: number;
}

interface Scene {
  number: number;
  caption: string;
  duration: number;
}

export async function buildAndRender(
  clips: Clip[],
  audioUrl: string,
  scenes: Scene[]
): Promise<string> {
  const startTimes = scenes.map((_, i) =>
    scenes.slice(0, i).reduce((acc, s) => acc + s.duration, 0)
  );

  const videoClips = clips.map((clip, i) => ({
    asset: {
      type: "video",
      src: clip.url,
      volume: 0,
    },
    start: startTimes[i],
    length: scenes[i].duration,
    fit: "cover",
  }));

  const captionClips = scenes.map((scene, i) => ({
    asset: {
      type: "html",
      html: `<p>${scene.caption}</p>`,
      css: "p { font-family: 'Montserrat', sans-serif; font-size: 36px; font-weight: 800; color: white; text-shadow: 2px 2px 8px rgba(0,0,0,0.8); text-align: center; padding: 10px; }",
      width: 400,
      height: 100,
    },
    start: startTimes[i],
    length: scenes[i].duration,
    position: "bottom",
    offset: { y: 0.15 },
  }));

  const payload = {
    timeline: {
      soundtrack: {
        src: audioUrl,
        effect: "fadeOut",
      },
      background: "#000000",
      tracks: [
        { clips: captionClips },
        { clips: videoClips },
      ],
    },
    output: {
      format: "mp4",
      resolution: "sd",
      aspectRatio: "9:16",
      fps: 25,
    },
  };

  console.log("Submitting to Shotstack:", JSON.stringify(payload, null, 2));

  const renderRes = await axios.post(
    `${SHOTSTACK_API}/render`,
    payload,
    { headers }
  );

  const renderId = renderRes.data.response.id;
  console.log("Shotstack render ID:", renderId);

  return await pollRender(renderId);
}

async function pollRender(renderId: string): Promise<string> {
  const maxAttempts = 36;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await sleep(5000);
    attempts++;

    const statusRes = await axios.get(
      `${SHOTSTACK_API}/render/${renderId}`,
      { headers }
    );

    const { status, url } = statusRes.data.response;
    console.log(`Render attempt ${attempts}: ${status}`);

    if (status === "done") return url;
    if (status === "failed") throw new Error("Shotstack render failed");
  }

  throw new Error("Render timed out after 3 minutes");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}