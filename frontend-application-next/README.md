# StewardIQ Dataset Catalog

A full-stack prototype built as a take-home assessment for StewardIQ. It implements a single-page Dataset Catalog where users can create datasets, view them in a table, apply filters, and receive AI-driven quality insights — all backed by a .NET 10 Minimal API.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) |
| UI components | HeroUI v3 (beta) |
| Styling | Tailwind CSS v4 |
| Backend | .NET 10 (controller-based Web API) |
| Deployment | Cloudflare Workers + Cloudflare Containers |

## Features

- **Dataset table** — displays name, domain, owner, quality score (visual progress bar), and a color-coded status badge for every dataset
- **Create dataset form** — modal component built with HeroUI v3 (currently commented out — POST endpoint not yet implemented)
- **AI insight rows** — any dataset with a quality score below 60 automatically surfaces a warning row beneath it in the table: _"AI Insight: This dataset may require review."_
- **Client-side filters** — dropdown filters for domain (derived dynamically from the current dataset list) and status; both filter without any backend round-trip
- **Graceful offline fallback** — (will be enabled when POST is implemented) if the backend is unreachable when creating a dataset, the entry is added to local state

## Architecture

```
frontend-application-next/
  app/
    page.tsx                  # Root page component — owns all state, fetch calls, filter handlers
    layout.tsx                # HTML shell, font variables (Geist, Space Grotesk), dark-mode defaults
    types.ts                  # Dataset interface, Status type, DOMAINS and STATUSES constants
    api/
      datasets/
        route.ts              # Next.js Route Handler — proxies GET/POST to .NET via service
                              #   binding (Cloudflare) or localhost (local development)
    components/
      DatasetTable.tsx        # Table with ScoreBar sub-component and AI insight rows
      CreateDatasetModal.tsx  # Controlled modal form built with HeroUI primitives
      Filters.tsx             # Domain and status Select dropdowns

backend/
  Controllers/
    DatasetsController.cs     # GET /api/datasets and POST /api/datasets; static in-memory list
  Models/
    Dataset.cs                # Dataset model: Id, Name, Domain, Owner, QualityScore, Status
  Program.cs                  # CORS policy, controller mapping, app startup
  Dockerfile                  # Multi-stage build targeting .NET 10 ASP.NET runtime on port 5090
  StewardIQ.Api.csproj        # Targets net10.0

cloudflare-deploy/
  src/index.ts                # Cloudflare Worker — forwards all requests to the .NET container
  wrangler.toml               # Container config: DotNetApi Durable Object, 3 max instances,
                              #   custom domain stewardiqapi.alexander-klusa.me
```

### Data Model

```typescript
interface Dataset {
  id: string;
  name: string;
  domain: string;   // "Sales" | "HR" | "Finance" | "Marketing" | "Engineering"
  owner: string;    // email address
  qualityScore: number;  // 0–100
  status: "Approved" | "NeedsReview" | "Rejected";
}
```

### API Route and Service Binding

The Next.js Route Handler at `app/api/datasets/route.ts` proxies requests between the browser and the .NET backend. It reads the `LOCAL_DEPLOYMENT` environment variable to decide the transport:

- **`LOCAL_DEPLOYMENT=1`** — calls `http://localhost:5090` directly
- **`LOCAL_DEPLOYMENT` unset or `0`** — uses a Cloudflare service binding (`STEWARDIQ_API`) to reach the container Worker without a public network hop

On Cloudflare, the service binding means the Next.js Worker and the .NET container communicate on Cloudflare's internal network with near-zero added latency.

### Backend

`DatasetsController` keeps a static `List<Dataset>` that is shared across all requests for the lifetime of the process. Data does not survive a restart. CORS is configured to allow any origin, method, and header.

## Running Locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- Node.js 20+

### 1. Start the backend

```bash
cd backend
dotnet run
```

The API starts at `http://localhost:5090`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/datasets` | Returns the full in-memory list |
| POST | `/api/datasets` | Not yet implemented (commented out) |

### 2. Configure the frontend environment

Create a file named `.env.local` inside `frontend-application-next/`:

```
LOCAL_DEPLOYMENT=1
```

This instructs the Route Handler to forward requests to `localhost:5090` rather than attempting the Cloudflare service binding.

### 3. Start the frontend

```bash
cd frontend-application-next
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

## Deploying to Cloudflare

Two separate deployments are required. Both assume you have a Cloudflare account and have run `bunx wrangler login`.

### Step 1 — Deploy the .NET API as a Cloudflare Container

Docker must be running locally; the container image is built from `backend/Dockerfile` during the deploy command.

```bash
cd cloudflare-deploy
bunx wrangler deploy
```

This publishes the `stewardiq-api` Worker. The Worker wraps the .NET container in a Durable Object class (`DotNetApi`) using `@cloudflare/containers`. The container listens on port 5090; Cloudflare handles TLS and routes the custom domain `stewardiqapi.alexander-klusa.me` to it. The container automatically sleeps after five minutes of inactivity and wakes on the next inbound request.

### Step 2 — Deploy the Next.js frontend as a Cloudflare Worker

Ensure `LOCAL_DEPLOYMENT` is absent or set to `0` before building so the Route Handler uses the service binding at runtime.

```bash
cd frontend-application-next
npx opennextjs-cloudflare build
bunx wrangler deploy
```

The `@opennextjs/cloudflare` adapter compiles the Next.js app into a Cloudflare Worker. `wrangler.toml` in this directory configures:

- Custom domain route: `stewardiq.alexander-klusa.me`
- Service binding: `STEWARDIQ_API` → the `stewardiq-api` Worker deployed in Step 1

### Environment Variable Reference

| Variable | Value | Effect |
|---|---|---|
| `LOCAL_DEPLOYMENT` | `1` | Route Handler fetches from `http://localhost:5090` |
| `LOCAL_DEPLOYMENT` | `0` or unset | Route Handler uses Cloudflare service binding `STEWARDIQ_API` |

Set this in `.env.local` for local development. Leave it unset for Cloudflare deployments.

## Assessment Requirements

This project was built for the StewardIQ 2-hour full-stack developer assessment.

| Requirement | Status |
|---|---|
| Dataset table (name, domain, owner, quality score, status) | Complete |
| Create dataset form (modal) | Not yet (component exists, commented out pending POST) |
| AI insight message for quality score below 60 | Complete |
| Client-side filter by domain | Complete |
| Client-side filter by status | Complete |
| React + TypeScript frontend | Complete |
| .NET API with `GET /api/datasets` | Complete |
| `POST /api/datasets` | Not yet implemented |
| README with run instructions | Complete |

## AI Usage

This project was built with Claude Code (Anthropic's AI coding assistant). Claude was used to scaffold both the Next.js and .NET projects, implement the component tree, write the Cloudflare service binding proxy logic in the Route Handler, and configure the container and Worker deployment. All generated code was reviewed by the author and the architectural decisions — including the service binding approach and the Cloudflare Container deployment model — are the author's own.
