# Lecture AI Pro

> Turn lecture audio or raw transcripts into structured, exam-ready notes with Gemini-powered analysis.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google_Gemini-API-4285F4?logo=google&logoColor=white)

## Overview

Students often spend too much time manually cleaning up lectures before they can actually study.  
**Lecture AI Pro** helps by converting lecture audio files or pasted transcripts into clear, organized notes, including summaries, key concepts, exam focus points, and practice questions.

This repository contains a Next.js App Router project with a single AI analysis API endpoint and a polished frontend experience for upload, analysis, and printable output.

## Key Features

- 🎧 Analyze lecture **audio uploads** (`audio/*`, up to 20MB)
- 📝 Analyze **manual transcript text** input
- 🌐 Language mode support:
  - Standard English
  - Bangla + English technical mix
- 🤖 Gemini-based note generation via `/api/analyze`
- 📚 Structured markdown output rendered in-app
- 🖨️ Print-friendly notes export (`window.print()`)
- 📊 Upload + processing progress UI for audio mode

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Framer Motion, Lucide React |
| Styling | Tailwind CSS (+ Typography plugin) |
| AI | `@google/generative-ai` (Gemini models) |
| Markdown Rendering | `react-markdown` |

## Getting Started (Local Setup)

### Prerequisites

- Node.js 18+ recommended
- npm
- A valid Google Gemini API key

### Installation

```bash
git clone https://github.com/Ratul-NotFound/lecture-ai-pro.git
cd lecture-ai-pro
npm install
```

### Configure Environment

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | API key used by `app/api/analyze/route.js` for Gemini requests |

> Source reference: `.env.example`

## Available Scripts

From `package.json`:

- `npm run dev` — Start local development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run Next.js lint checks

## Deployment Notes

- This app is ready for standard Next.js hosting (for example, Vercel).
- Set `GEMINI_API_KEY` in your deployment environment.
- The project sets `experimental.serverActions.bodySizeLimit` to `20mb` in `next.config.mjs`.
- The API route itself enforces a 20MB upload limit for audio files.

## Folder Structure

```text
lecture-ai-pro/
├─ app/
│  ├─ api/
│  │  └─ analyze/
│  │     └─ route.js
│  ├─ globals.css
│  ├─ layout.js
│  └─ page.js
├─ .env.example
├─ next.config.mjs
├─ package.json
└─ tailwind.config.js
```

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make focused changes
4. Run lint/tests locally
5. Open a pull request with a clear description

## License

**Placeholder:** License is not currently specified in this repository. Add a `LICENSE` file to define usage terms.

## Contact

- Maintainer: **Mahmud Hasan Ratul**
- Email: **m.h.ratul18@gmail.com**
