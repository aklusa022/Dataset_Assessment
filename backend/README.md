# StewardIQ API — .NET 10 Backend

A minimal .NET 10 Web API that serves as the backend for the StewardIQ Dataset Catalog. Datasets are stored in-memory only — no database is required.

## Tech Stack

| Component | Technology |
|---|---|
| Framework | .NET 10 (ASP.NET Core) |
| API style | Controller-based Web API |
| Storage | In-memory static list (no persistence) |
| Containerization | Docker (multi-stage build) |
| Deployment | Cloudflare Containers |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/datasets` | Returns the full in-memory dataset list as JSON |
| `POST` | `/api/datasets` | Not yet implemented (commented out in controller) |

### Dataset Model

```csharp
public class Dataset
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Domain { get; set; }
    public string Owner { get; set; }
    public int QualityScore { get; set; }
    public string Status { get; set; }  // "Approved" | "NeedsReview" | "Rejected"
}
```

### Example Request

```bash
# List all datasets
curl http://localhost:5090/api/datasets
```

## Project Structure

```
backend/
  Program.cs                  # App startup — CORS policy, controller mapping
  Controllers/
    DatasetsController.cs     # GET endpoint, static in-memory list (POST commented out)
  Models/
    Dataset.cs                # Dataset model class
  Properties/
    launchSettings.json       # Dev server config (port 5090)
  StewardIQ.Api.csproj        # Project file targeting net10.0
  Dockerfile                  # Multi-stage Docker build for deployment
```

## Running Locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### Start the API

```bash
cd backend
dotnet run
```

The API starts at `http://localhost:5090`. CORS is configured to allow all origins, methods, and headers for local development.

### Build Only

```bash
dotnet build
```

## Docker

### Build the Image

```bash
cd backend
docker build -t stewardiq-api .
```

### Run the Container

```bash
docker run -p 5090:5090 stewardiq-api
```

The Dockerfile uses a multi-stage build:
1. **Build stage** — uses `mcr.microsoft.com/dotnet/sdk:10.0` to restore, build, and publish
2. **Runtime stage** — uses the lighter `mcr.microsoft.com/dotnet/aspnet:10.0` image, listens on port 5090

## Deploying to Cloudflare Containers

The API is deployed as a Cloudflare Container, managed by a Cloudflare Worker via a Durable Object binding. The deployment configuration lives in the `cloudflare-deploy/` directory at the repository root.

### How It Works

1. A Cloudflare Worker (`stewardiq-api`) receives incoming requests
2. The Worker extends the `Container` class from `@cloudflare/containers`
3. Requests are forwarded to the .NET container running on port 5090 internally
4. Cloudflare handles TLS termination at the edge — the container only serves HTTP
5. The container auto-sleeps after 5 minutes of inactivity and wakes on the next request

### Deploy

Docker must be running locally. Wrangler builds the image from the Dockerfile and pushes it to Cloudflare's registry.

```bash
cd cloudflare-deploy
bunx wrangler deploy
```

This deploys to `stewardiqapi.alexander-klusa.me`.

### Wrangler Configuration

```toml
[[containers]]
class_name = "DotNetApi"
image = "../backend/Dockerfile"
max_instances = 3

[[durable_objects.bindings]]
class_name = "DotNetApi"
name = "DOTNET_API"
```

The Next.js frontend Worker connects to this API Worker via a Cloudflare service binding (`STEWARDIQ_API`), which routes requests over Cloudflare's internal network with near-zero added latency.

## Design Decisions

- **No database** — the assessment explicitly states no persistence is required. The static `List<Dataset>` in `DatasetsController` serves the purpose.
- **Controller-based API** — chosen over Minimal API for clearer separation of concerns with the `Models/` and `Controllers/` directories.
- **Port 5090** — avoids conflicts with common development ports (3000, 5000, 8080).
- **CORS allow-all** — appropriate for a prototype; would be locked down in production.
