# StewardIQ — Dataset Catalog

A full-stack prototype for the StewardIQ 2-hour developer assessment. The project implements a Dataset Catalog where users create datasets, view them in a sortable table, apply filters, and receive AI-driven quality insights.

Two frontend implementations are provided — one backed by a .NET API, and one backed by Convex — both deployable to Cloudflare.

## Repository Structure

```
.
├── backend/                        .NET 10 API (in-memory dataset storage)
│   ├── Controllers/
│   │   └── DatasetsController.cs   GET /api/datasets (POST commented out — not yet implemented)
│   ├── Models/
│   │   └── Dataset.cs              Dataset model
│   ├── Program.cs                  App startup, CORS config
│   └── Dockerfile                  Multi-stage build for Cloudflare Containers
│
├── frontend-application-next/      Next.js 16 + HeroUI v3 frontend (.NET backend)
│   ├── app/
│   │   ├── page.tsx                Root page — state, filters, API calls
│   │   ├── api/datasets/route.ts   Route handler — service binding or local fetch
│   │   └── components/             DatasetTable, CreateDatasetModal, Filters
│   └── wrangler.toml               Cloudflare Worker config (stewardiq.alexander-klusa.me)
│
├── frontend-convex/                Next.js 16 + HeroUI v3 frontend (Convex backend)
│   ├── app/                        Same UI components, Convex hooks instead of fetch
│   ├── convex/
│   │   ├── schema.ts               Typed table definition
│   │   └── datasets.ts             list query + create mutation
│   └── wrangler.toml               Cloudflare Worker config (stewardiqconvex.alexander-klusa.me)
│
└── cloudflare-deploy/              Cloudflare Container Worker for the .NET API
    ├── src/index.ts                Worker — proxies requests to the .NET container
    └── wrangler.toml               Container config (stewardiqapi.alexander-klusa.me)
```

# Quick Start

## Local Deployment

### Option A: Next.js + .NET (local)

```bash
# Terminal 1 — start the API
cd backend && dotnet run

# Terminal 2 — start the frontend
cd frontend-application-next
echo "LOCAL_DEPLOYMENT=1" > .env.local
npm install && npm run dev
```

Open `http://localhost:3000`.

### Option B: Convex backend (local)

```bash
# Terminal 1 — start Convex dev server to begin setup
cd frontend-convex
npm install
npx convex dev

# Terminal 2 — start the frontend
cd frontend-convex && npm run dev
```

Open `http://localhost:3000`.

## Cloudflare Deployment

All three services deploy to Cloudflare under the `alexander-klusa.me` zone.

| Service | Domain | Type |
|---|---|---|
| .NET API | `stewardiqapi.alexander-klusa.me` | Cloudflare Container (via Worker + Durable Object) |
| Next.js + .NET frontend | `stewardiq.alexander-klusa.me` | Cloudflare Worker (via `@opennextjs/cloudflare`) |
| Next.js + Convex frontend | `stewardiqconvex.alexander-klusa.me` | Cloudflare Worker (via `@opennextjs/cloudflare`) |

### Deploy the .NET API Container

Requires Docker running locally.

```bash
cd cloudflare-deploy
bunx wrangler deploy
```

The Worker wraps the .NET app in a Cloudflare Container. The container listens on port 5090 internally; Cloudflare handles TLS. It auto-sleeps after 5 minutes of inactivity.

### Deploy the Next.js + .NET Frontend

```bash
cd frontend-application-next
npx opennextjs-cloudflare build
bunx wrangler deploy
```

This Worker has a service binding (`STEWARDIQ_API`) to the API container Worker. Requests from the frontend to `/api/datasets` are proxied to the .NET container over Cloudflare's internal network with near-zero latency.

### Deploy the Convex Frontend

```bash
cd frontend-convex
NEXT_PUBLIC_CONVEX_URL=https://<your-project>.convex.cloud npx opennextjs-cloudflare build
bunx wrangler deploy
```

No service binding needed — the browser connects to Convex directly via WebSocket.

## Architecture

```
                             ┌─────────────────────────────────┐
                             │       Cloudflare Edge           │
                             │                                 │
  Browser ──────────────────►│  stewardiq.alexander-klusa.me   │
                             │  (Next.js Worker)               │
                             │       │                         │
                             │       │ service binding          │
                             │       ▼                         │
                             │  stewardiqapi.alexander-klusa.me│
                             │  (Worker + .NET Container)      │
                             │  port 5090 internal             │
                             └─────────────────────────────────┘

                             ┌─────────────────────────────────┐
  Browser ──────────────────►│  stewardiqconvex...             │
                             │  (Next.js Worker)               │
                             │       │                         │
                             └───────┼─────────────────────────┘
                                     │ WebSocket
                                     ▼
                              Convex Cloud
```

## Tech Stack

| Layer | .NET + Next Stack | Convex + Next Stack |
|---|---|---|
| Frontend | Next.js 16, HeroUI v3, Tailwind CSS v4 | Same |
| Backend | .NET 10 (in-memory, no persistence) | Convex (persistent, real-time) |
| Deployment | Cloudflare Workers + Containers | Cloudflare Workers + Convex Cloud |
| Communication | Service binding (internal network) | Direct WebSocket from browser |

## Assessment Requirements

| Requirement | Status |
|---|---|
| Dataset table with name, domain, owner, quality score, status | Complete |
| Create dataset form (modal) | Complete (Convex version) / Not yet (.NET version) |
| AI insight for quality score below 60 | Complete |
| Client-side filter by domain | Complete |
| Client-side filter by status | Complete |
| React + TypeScript frontend | Complete |
| .NET API with `GET /api/datasets` | Complete |
| `POST /api/datasets` | Not yet implemented (.NET) / Complete (Convex) |
| Cloudflare Workers deployment | Complete |
| Convex alternative backend (bonus) | Complete |

## AI Usage

I utilized claude code (specifically opus 4.6) to write the documentation on this project aswell as create the docker image and configure its deployment to the cloudflare containers network. Additional changes were made manually to enhance code readability.

## Individual READMEs

Each sub-project has its own detailed README:

- [`backend/README.md`](backend/README.md) — .NET API details, Docker, Cloudflare Container deployment
- [`frontend-application-next/README.md`](frontend-application-next/README.md) — Next.js + .NET frontend, service binding, local/cloud deployment
- [`frontend-convex/README.md`](frontend-convex/README.md) — Convex version, real-time architecture, deployment
