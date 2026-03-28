// lib/pexels.ts
import axios from "axios";

export interface Clip {
  sceneNumber: number;
  url: string;
  duration: number;
}

const CLIPS_PER_SCENE = 2;

async function fetchClipsForScene(
  sceneNumber: number,
  query: string,
  sceneDuration: number,
  isFallback = false
): Promise<Clip[]> {
  try {
    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: { Authorization: process.env.PEXELS_API_KEY! },
      params: {
        query,
        per_page: 10,
        size: "medium",
        orientation: "portrait",
      },
    });

    const videos = response.data.videos;

    if (!videos || videos.length === 0) {
      if (isFallback) throw new Error(`No results for scene ${sceneNumber}`);
      return fetchClipsForScene(sceneNumber, "cinematic nature footage", sceneDuration, true);
    }

    const subDuration = sceneDuration / CLIPS_PER_SCENE;
    interface PexelsFile { quality: string; width: number; height: number; link: string; }
    interface PexelsVideo { video_files: PexelsFile[]; }

    const picked: PexelsVideo[] = videos.slice(0, CLIPS_PER_SCENE);

    return picked.map((video) => {
      const file =
        video.video_files.find(
          (f) => f.quality === "sd" && f.width < f.height
        ) || video.video_files[0];
      return { sceneNumber, url: file.link, duration: subDuration };
    });
  } catch (error) {
    console.error(`Pexels fetch failed for query "${query}":`, error);
    throw new Error(`Failed to fetch visuals for scene ${sceneNumber}`);
  }
}

export async function fetchAllClips(
  scenes: { number: number; visualQuery: string; duration: number }[]
): Promise<Clip[][]> {
  return Promise.all(
    scenes.map((scene) =>
      fetchClipsForScene(scene.number, scene.visualQuery, scene.duration)
    )
  );
}