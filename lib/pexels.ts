// lib/pexels.ts
import axios from "axios";

export interface Clip {
  sceneNumber: number;
  url: string;
  duration: number;
}

export async function fetchClipForScene(
  sceneNumber: number,
  query: string,
  duration: number
): Promise<Clip> {
  try {
    const response = await axios.get("https://api.pexels.com/videos/search", {
      headers: { Authorization: process.env.PEXELS_API_KEY! },
      params: {
        query,
        per_page: 5,
        size: "medium",
        orientation: "portrait", // vertical 9:16
      },
    });

    const videos = response.data.videos;

    if (!videos || videos.length === 0) {
      // Fallback to a generic query
      return fetchClipForScene(sceneNumber, "cinematic nature footage", duration);
    }

    // Pick the first video that has a file close to our needed duration
    const video = videos[0];
    const file = video.video_files.find(
      (f: any) => f.quality === "sd" && f.width < f.height // portrait only
    ) || video.video_files[0];

    return {
      sceneNumber,
      url: file.link,
      duration,
    };
  } catch (error) {
    console.error(`Pexels fetch failed for query "${query}":`, error);
    throw new Error(`Failed to fetch visual for scene ${sceneNumber}`);
  }
}

export async function fetchAllClips(
  scenes: { number: number; visualQuery: string; duration: number }[]
): Promise<Clip[]> {
  // Fetch all clips in parallel
  const clips = await Promise.all(
    scenes.map((scene) =>
      fetchClipForScene(scene.number, scene.visualQuery, scene.duration)
    )
  );
  return clips;
}