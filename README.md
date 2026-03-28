# ThreadCut

**AI-powered short-form video generation — from topic to finished 9:16 MP4 in one prompt.**

ThreadCut is a full agentic video pipeline that takes a topic and creative style as input and autonomously produces a complete, post-ready short-form video. No editing, no sourcing, no recording — just a finished clip.

---

## How It Works

ThreadCut chains five AI and media APIs in sequence:

| Step | Service | What it does |
|------|---------|-------------|
| 1 | Gemini 2.5 Flash | Generates a 4-scene script with narration, captions, and visual search queries |
| 2 | Pexels API | Fetches portrait-orientation stock footage for each scene in parallel |
| 3 | ElevenLabs | Synthesizes a voiceover from the narration, adapted to the selected style |
| 4 | Cloudinary | Hosts the generated audio for the render step |
| 5 | Shotstack | Composites clips, captions, and audio into a final 9:16 MP4 |

## Styles

| Style | Description |
|-------|-------------|
| Educational | Clear, informative tone |
| Hype | High-energy, punchy delivery |
| Storytelling | Narrative-driven structure |
| Promo | Brand and product focused |
| Brainrot | Unhinged Gen Z energy — subway surfers background, chaotic voiceover |

---

## Tech Stack

- **Framework** — Next.js (TypeScript)
- **AI / Script** — Google Gemini 2.5 Flash
- **Voiceover** — ElevenLabs Turbo v2.5
- **Stock Footage** — Pexels
- **Video Rendering** — Shotstack
- **Asset Hosting** — Cloudinary

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/johntmvu/threadcut.git
cd threadcut
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
PEXELS_API_KEY=
SHOTSTACK_API_KEY=
CLOUDINARY_CLOUD_NAME=
SUBWAY_SURFERS_VIDEO_URL=   # Required for brainrot mode — hosted MP4
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deploy instantly on [Vercel](https://vercel.com). Add all environment variables under **Project Settings → Environment Variables** before deploying.
