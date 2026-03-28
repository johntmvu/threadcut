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

// Replace with your own hosted subway surfers gameplay MP4
const SUBWAY_SURFERS_URL =
  process.env.SUBWAY_SURFERS_VIDEO_URL ||
  "https://res.cloudinary.com/threadcut/video/upload/subway_surfers_loop.mp4";

export async function buildAndRender(
  clips: Clip[],
  audioUrl: string,
  scenes: Scene[],
  style?: string
): Promise<string> {
  const isBrainrot = style === "brainrot";
  const startTimes = scenes.map((_, i) =>
    scenes.slice(0, i).reduce((acc, s) => acc + s.duration, 0)
  );

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  const videoClips = clips.map((clip, i) => ({
    asset: {
      type: "video",
      src: clip.url,
      volume: 0,
      ...(isBrainrot && { crop: { top: 0.15, bottom: 0.15, left: 0, right: 0 } }),
    },
    start: startTimes[i],
    length: scenes[i].duration,
    fit: "cover",
    ...(isBrainrot && { scale: 0.6, position: "top", offset: { y: -0.05 } }),
  }));

  const captionCss = `@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
       p { font-family: 'Anton', sans-serif; font-size: 34px; font-weight: 900; color: white;
           text-align: center; letter-spacing: 1px; padding: 8px; line-height: 1; margin: 0;
           white-space: nowrap; }`;

  const captionClips = scenes.map((scene, i) => ({
    asset: {
      type: "html",
      html: `<p>${scene.caption}</p>`,
      css: captionCss,
      width: 500,
      height: 80,
    },
    start: startTimes[i],
    length: scenes[i].duration,
    position: "center",
    offset: { y: isBrainrot ? -0.25 : -0.3 },
  }));

  const subwayTrack = isBrainrot
    ? [
        {
          clips: [
            {
              asset: { type: "video", src: SUBWAY_SURFERS_URL, volume: 0 },
              start: 0,
              length: totalDuration,
              fit: "cover",
            },
          ],
        },
      ]
    : [];

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
        ...subwayTrack,
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