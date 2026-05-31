# uteki.app

Public product showcase site for the **uteki** investing-agent product
(developed at `uteki.open` / uteki.dev). This repo is a **fully self-contained
Vite + React SPA** — no backend, no auth, no live data. All five product
surfaces, including the streamed agent flows, play out from local mock
fixtures so the site can be deployed anywhere static.

## What's inside

Five surfaces, all reachable from the landing page (`/`):

| Route                          | What it shows                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `/dashboard`                   | Editorial four-slide daily brief: NAV, holdings matrix, agent verdicts, model leaderboard. Use ← / → to switch slides. |
| `/macro/market-dashboard`      | Three signal cards (Valuation / Liquidity / Flow) with 52-week sparks, sector rotation bars, and style-pair comparisons. |
| `/news-timeline`               | Calendar-driven news feed. Click "AI 解读 / AI read" on any card to stream a mocked impact analysis. |
| `/agent`                       | Read-only composer with three scripted prompts. Chat-mode chips stream a token-by-token answer; the research-mode chip plays a full thoughts → sources → answer pipeline. |
| `/company-agent`               | Three-column research studio. Pick AAPL / NVDA / BRK.B and watch the seven-gate analysis pipeline stream to a final verdict. |

A 中 / EN toggle in the masthead switches every UI string and every streamed
script between Chinese and English.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle into ./dist
npm run preview      # serve the production bundle
```

## Deploy to Vercel

```bash
npx vercel --yes              # preview deployment
npx vercel --prod --yes       # production
```

`vercel.json` configures the SPA rewrite (`framework: vite`). No environment
variables are required.

## How the mocked streams work

Real-feel streaming without a backend: every interactive surface reads from a
small async generator in `src/mocks/` that yields events with realistic
inter-token delays (`src/mocks/stream.ts`). The page-level consumers are
written exactly as if they were reading SSE — `for await (const ev of
stream(...)) { ... }` — so swapping in a real server later is a one-line
change per page.

Scripts live alongside the mocks:

- `mocks/agent.ts` — `chatStream()` and `researchStream()` for the three
  scripted prompts on `/agent`.
- `mocks/company.ts` — `runCompanyAnalysis()` emits the seven-gate pipeline
  for AAPL / NVDA / BRK.B.
- `mocks/news.ts` — `analyzeNewsStream()` produces an impact read keyed off
  each news item's tags.

Static fixtures (dashboard, market dashboard) live in the same folder and
return Promises with small artificial delays so loading states render.

## Design system

Tokens are ported from `uteki.open` so the two sites are visually identical —
warm editorial dark palette, Fraunces italic display, Newsreader body,
JetBrains Mono for numerics. See `src/theme/editorialTokens.ts`.

## Tech

Vite 5 · React 18 + TypeScript · MUI 6 (theme only) · Tailwind 3 ·
React Router 6 · framer-motion · recharts · lucide-react.

No external network calls at runtime besides Google Fonts.

---

## Implementation archive (`uteki.open`)

This repository also archives the original `uteki.open` source tree that
the showcase is built on. The deployed Vercel surface is the Vite SPA at
this repo's root; the archive lives in:

- `backend/` — FastAPI + SQLAlchemy + multi-LLM adapter. 7-Gate Company
  Agent, 3-phase Arena, ConsistencyRunner, Provenance/`as_of` catalog.
- `frontend/` — The original React/MUI app (Studio / Dossier / Market
  Dashboard / Admin) that the showcase mocks here.
- `mobile/` — Flutter shell (scaffold only).
- `docs/RETROSPECTIVE.md` — 4-month send-off doc covering what the
  project tried, what worked, what didn't, and how we collaborated with
  code agents.
- `docs/ADR-evaluation-framework.md` — Design rationale behind the
  evaluation pillars (consistency / credibility / logic / effectiveness).

The archive is **read-only** going forward — active development lives in
the separate [`uteki`](https://github.com/Rain1601) monorepo.
