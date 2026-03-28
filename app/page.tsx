"use client";

import { useState } from "react";

const STYLES = ["educational", "hype", "storytelling", "promo", "brainrot"];

type Scene = {
  number: number;
  narration: string;
  caption: string;
  duration: number;
};

type Script = {
  title: string;
  narration: string;
  scenes: Scene[];
};

type Stage =
  | "idle"
  | "scripting"
  | "visuals"
  | "voiceover"
  | "rendering"
  | "done"
  | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "",
  scripting: "Agent 1 — Writing your script...",
  visuals: "Agent 2+3 — Sourcing visuals...",
  voiceover: "Agent 4 — Generating voiceover...",
  rendering: "Agent 5 — Rendering video (30–60s)...",
  done: "Video ready!",
  error: "Something went wrong",
};

const STAGE_ORDER: Stage[] = ["scripting", "visuals", "voiceover", "rendering", "done"];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Home() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("educational");
  const [stage, setStage] = useState<Stage>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isGenerating = stage !== "idle" && stage !== "done" && stage !== "error";

  async function handleGenerate() {
    if (!topic.trim() || topic.trim().length < 3) {
      setError("Please enter a more specific topic");
      return;
    }

    setError(null);
    setVideoUrl(null);
    setScript(null);

    try {
      setStage("scripting");
      await sleep(1500);
      setStage("visuals");
      await sleep(1500);
      setStage("voiceover");
      await sleep(1500);
      setStage("rendering");

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Pipeline failed");

      setVideoUrl(data.videoUrl);
      setScript(data.script);
      setStage("done");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStage("error");
    }
  }

  function handleReset() {
    setStage("idle");
    setVideoUrl(null);
    setScript(null);
    setTopic("");
    setError(null);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-16">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-3">
          {"Thread"}
          <span className="text-red-500">{"Cut"}</span>
        </h1>
        <p className="text-gray-400 text-lg">
          {"Topic in. Vertical video out. Powered by 5 AI agents."}
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-xl space-y-4">
        <input
          type="text"
          placeholder="e.g. 5 facts about climate change"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          disabled={isGenerating}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white placeholder-zinc-500 text-lg focus:outline-none focus:border-red-500 transition"
        />

        {/* Style selector */}
        <div className="flex gap-2 flex-wrap">
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                style === s
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl transition"
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>

      {/* Pipeline progress */}
      {stage !== "idle" && (
        <div className="mt-10 w-full max-w-xl space-y-3">
          {STAGE_ORDER.map((s) => {
            const currentIdx = STAGE_ORDER.indexOf(stage);
            const thisIdx = STAGE_ORDER.indexOf(s);
            const isDone = thisIdx < currentIdx || stage === "done";
            const isActive = s === stage;

            return (
              <div
                key={s}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-zinc-800 border border-red-500"
                    : isDone
                    ? "bg-zinc-900 border border-zinc-700"
                    : "opacity-30 bg-zinc-900 border border-zinc-800"
                }`}
              >
                <span className="text-xl">
                  {isDone ? "✅" : isActive ? "⏳" : "⬜"}
                </span>
                <span className="text-sm font-medium text-zinc-300">
                  {STAGE_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Video output */}
      {videoUrl && stage === "done" && (
        <div className="mt-12 w-full max-w-sm">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full rounded-2xl shadow-2xl"
            style={{ aspectRatio: "9/16" }}
          />

          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition"
          >
            {"Download MP4"}
          </a>

          {/* Script preview */}
          {script && (
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-bold text-white">{script.title}</h2>
              {script.scenes.map((scene) => (
                <div
                  key={scene.number}
                  className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
                >
                  <p className="text-xs text-red-400 font-bold mb-1">
                    {"SCENE "}{scene.number}{" — "}{scene.duration}{"s"}
                  </p>
                  <p className="text-sm text-zinc-300">{scene.narration}</p>
                  <p className="text-xs text-zinc-500 mt-2 italic">
                    {"Caption: "}{scene.caption}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Generate another */}
          <button
            onClick={handleReset}
            className="mt-6 w-full text-center text-zinc-400 hover:text-white text-sm transition"
          >
            {"← Generate another video"}
          </button>
        </div>
      )}
    </main>
  );
}
