# StewardIQ Dataset Catalog — Convex Backend Version

An alternative implementation of the StewardIQ Dataset Catalog assessment prototype. This version replaces the .NET Minimal API with [Convex](https://convex.dev) as the backend, providing real-time reactive data, persistent storage, and type-safe queries and mutations — without running and managing any separate server process.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) |
| UI components | HeroUI v3 (beta) |
| Styling | Tailwind CSS v4 |
| Backend | Convex (real-time backend-as-a-service) |
| Deployment | Cloudflare Workers (via `@opennextjs/cloudflare`) |

## Features

- **Dataset table** — displays name, domain, owner, quality score (visual progress bar), and a color-coded status badge for every dataset
- **Create dataset form** — modal with text fields, dropdowns for domain and status, and an interactive slider for quality score
- **AI insight rows** — any dataset with a quality score below 60 automatically surfaces a warning row: _"AI Insight: This dataset may require review."_
- **Client-side filters** — dropdown filters for domain (derived dynamically from live data) and status; filtering requires no backend call
- **Real-time updates** — `useQuery` subscribes to the dataset list over a WebSocket; any change made in one browser tab is reflected in all other browser clients instantly

## Architecture

```
frontend-convex/
  app/
    page.tsx                    # Root page — useQuery/useMutation hooks replace fetch calls
    layout.tsx                  # HTML shell, font variables, ConvexClientProvider wrapper
    ConvexClientProvider.tsx    # Wraps the app with ConvexProvider using NEXT_PUBLIC_CONVEX_URL
    types.ts                    # Dataset interface and Status/DOMAINS constants
    components/
      DatasetTable.tsx          # Table with ScoreBar and AI insight rows (same as .NET version)
      CreateDatasetModal.tsx    # Modal form (same structure as .NET version)
      Filters.tsx               # Domain and status Select dropdowns

  convex/
    schema.ts                   # Typed table definition for the datasets collection
    datasets.ts                 # list query and create mutation
    _generated/                 # Auto-generated types from Convex CLI (do not edit manually)
```

### Data Model

The Convex schema defines a `datasets` table with the following fields. Convex automatically adds `_id` (a globally unique document ID) and `_creationTime` to every document.

```typescript
// convex/schema.ts
datasets: defineTable({
  name: v.string(),
  domain: v.string(),
  owner: v.string(),
  qualityScore: v.number(),
  status: v.union(
    v.literal("Approved"),
    v.literal("NeedsReview"),
    v.literal("Rejected")
  ),
})
```

### Backend Functions

```typescript
// convex/datasets.ts
export const list = query({ ... })      // ctx.db.query("datasets").collect()
export const create = mutation({ ... }) // ctx.db.insert("datasets", args)
```

Both functions are validated against the schema at runtime. The frontend calls them through auto-generated typed hooks:

```typescript
const datasets = useQuery(api.datasets.list) ?? [];
const createDataset = useMutation(api.datasets.create);
```

### How Convex Replaces the .NET Backend

| Concern | .NET version | Convex version |
|---|---|---|
| Data transport | REST over HTTP (`fetch`) | WebSocket subscription (`useQuery`) |
| Data storage | In-memory static list (lost on restart) | Persistent Convex database |
| ID generation | `crypto.randomUUID()` client-side | Auto-generated `_id` by Convex |
| API layer | Next.js Route Handler proxy | No proxy needed — Convex SDK connects directly |
| Mutations | `POST /api/datasets` via fetch | `useMutation` hook |
| Real-time | Not supported | Built-in — all `useQuery` subscribers update automatically |

There is no Next.js API route in this version. The Convex client connects to the Convex cloud deployment directly from the browser using the URL in `NEXT_PUBLIC_CONVEX_URL`.

## Running Locally

### Prerequisites

- Node.js 20+
- A Convex account (free at [convex.dev](https://convex.dev))

### 1. Install dependencies

```bash
cd frontend-convex
npm install
```

### 2. Initialize Convex

```bash
npx convex dev
```

On first run this will prompt you to log in and create a new Convex project. Once complete it:

- Deploys the functions in `convex/` to your project
- Generates type definitions in `convex/_generated/`
- Prints your project URL and watches for further changes

Copy the printed `NEXT_PUBLIC_CONVEX_URL` value.

### 3. Configure the frontend environment

Create `.env.local` in `frontend-convex/`:

```
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud
```

`npx convex dev` also offers to write this automatically; accept the prompt and it will create the file for you.

### 4. Start the frontend

Open a second terminal (keep `npx convex dev` running in the first):

```bash
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Deploying to Cloudflare Workers

```bash
cd frontend-convex
npx opennextjs-cloudflare build
bunx wrangler deploy
```

The `@opennextjs/cloudflare` adapter compiles the Next.js app into a Cloudflare Worker. `wrangler.toml` routes the custom domain `stewardiqconvex.alexander-klusa.me` to the deployed Worker.

The Convex URL (`NEXT_PUBLIC_CONVEX_URL`) is a public environment variable embedded at build time, so no service binding or additional backend Worker is required — the browser connects to Convex directly.

Before building, ensure the variable is available in your environment or pass it explicitly:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud npx opennextjs-cloudflare build
```

## Assessment Requirements

All items from the StewardIQ assessment are implemented in this version as well.

| Requirement | Status |
|---|---|
| Dataset table (name, domain, owner, quality score, status) | Complete |
| Create dataset form (modal) | Complete |
| AI insight message for quality score below 60 | Complete |
| Client-side filter by domain | Complete |
| Client-side filter by status | Complete |
| React + TypeScript frontend | Complete |
| Backend integration (Convex replaces .NET) | Complete |
| Real-time reactive data (bonus beyond requirements) | Complete |
| Persistent storage across page refreshes (bonus) | Complete |

## AI Usage

This project was built with Claude Code (Opus 4.6). Claude was used to scaffold the Next.js project, set up the Convex schema and functions, integrate the `useQuery` and `useMutation` hooks, and configure the Cloudflare Workers deployments. Code quality was verified manually.
