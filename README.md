# uteki.open

Public archive of the **uteki** investing-agent project (uteki.dev). The
repo bundles together the original product source (backend / frontend /
mobile) and the standalone Vite SPA that gets deployed to
[utekiapp.vercel.app](https://utekiapp.vercel.app) as the public showcase
of those surfaces.

Active development now lives in the separate
[`uteki`](https://github.com/Rain1601) monorepo; this repo is **read-only
going forward**.

## Layout

```
uteki.open/
├── showcase/          # Vite + React SPA → utekiapp.vercel.app (deploy root)
├── backend/           # FastAPI + SQLAlchemy + multi-LLM adapter
├── frontend/          # The original React/MUI product app
├── mobile/            # Flutter shell (scaffold only)
├── docs/              # Retrospective, ADRs, architecture diagrams, dev guide
│   ├── architecture/  # Canonical agent-architecture SVGs
│   └── showcase/      # Static showcase doc (separate from the SPA above)
├── docs-site/         # VitePress docs site
├── openspec/          # OpenSpec change-management workflow
├── scripts/           # Local dev quickstarts, DB init, service start scripts
└── docker-compose.yml # PG + Redis + ClickHouse + Qdrant + MinIO
```

## Run the showcase locally

The public showcase site is a fully self-contained Vite + React SPA — no
backend, no auth, no live data. All five product surfaces (including the
streamed agent flows) play out from local mock fixtures so it can be
deployed anywhere static.

```bash
cd showcase
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle into ./dist
npm run preview      # serve the production bundle
```

### Deploy to Vercel

Vercel project root must be set to `showcase`. Once that's set:

```bash
cd showcase
npx vercel --yes              # preview deployment
npx vercel --prod --yes       # production
```

`showcase/vercel.json` configures the SPA rewrite (`framework: vite`).
No environment variables are required.

### What's inside the showcase

Five surfaces, all reachable from the landing page (`/`):

| Route                          | What it shows                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `/dashboard`                   | Editorial four-slide daily brief: NAV, holdings matrix, agent verdicts, model leaderboard. Use ← / → to switch slides. |
| `/macro/market-dashboard`      | Three signal cards (Valuation / Liquidity / Flow) with 52-week sparks, sector rotation bars, and style-pair comparisons. |
| `/news-timeline`               | Calendar-driven news feed. Click "AI 解读 / AI read" on any card to stream a mocked impact analysis. |
| `/agent`                       | Read-only composer with three scripted prompts. Chat-mode chips stream a token-by-token answer; the research-mode chip plays a full thoughts → sources → answer pipeline. |
| `/company-agent`               | Three-column research studio. Pick AAPL / NVDA / BRK.B and watch the seven-gate analysis pipeline stream to a final verdict. |

A 中 / EN toggle in the masthead switches every UI string and every
streamed script between Chinese and English.

### How the mocked streams work

Real-feel streaming without a backend: every interactive surface reads
from a small async generator in `showcase/src/mocks/` that yields events
with realistic inter-token delays (`stream.ts`). Page-level consumers are
written exactly as if they were reading SSE — `for await (const ev of
stream(...)) { ... }` — so swapping in a real server later is a one-line
change per page.

- `mocks/agent.ts` — `chatStream()` and `researchStream()` for `/agent`.
- `mocks/company.ts` — `runCompanyAnalysis()` emits the seven-gate
  pipeline for AAPL / NVDA / BRK.B.
- `mocks/news.ts` — `analyzeNewsStream()` produces an impact read keyed
  off each news item's tags.

### Design system

Tokens are ported from the product so the two sites are visually
identical — warm editorial dark palette, Fraunces italic display,
Newsreader body, JetBrains Mono for numerics. See
`showcase/src/theme/editorialTokens.ts`.

### Tech

Vite 5 · React 18 + TypeScript · MUI 6 (theme only) · Tailwind 3 ·
React Router 6 · framer-motion · recharts · lucide-react.

No external network calls at runtime besides Google Fonts.

## Run the product locally

The product itself (backend + product frontend) needs the full Docker
stack. See `docs/LOCAL_DEVELOPMENT.md` for the long version. Short
version:

```bash
./scripts/start-full.sh           # PG + Redis + ClickHouse + Qdrant + MinIO
./scripts/start_local_dev.sh      # interactive backend + frontend launcher
```

Backend domain layout, LLM adapter, arena pipeline and DB-manager
conventions are documented in `CLAUDE.md`.

## Archived references

- `docs/RETROSPECTIVE.md` — 4-month send-off doc covering what the
  project tried, what worked, what didn't, and how we collaborated with
  code agents.
- `docs/ADR-evaluation-framework.md` — Design rationale behind the
  evaluation pillars (consistency / credibility / logic / effectiveness).
- `docs/architecture/` — Canonical agent / company / index architecture
  SVGs.
- `docs/IMPLEMENTATION_STATUS.md` — Frozen implementation status as of
  early 2026.
