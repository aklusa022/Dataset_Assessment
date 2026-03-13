import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const LOCAL_API = "http://localhost:5090";
const isLocal = process.env.LOCAL_DEPLOYMENT === "1";



//If it is hosted locally, we fetch locally from the URL defined on top.
async function fetchFromLocal(method: string, path: string, body?: string): Promise<Response> {
  return fetch(`${LOCAL_API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  });
}


//If the instance is hosted in cloudflare workers, it will attempt to use a cloudflare service binding to connct to the cloudflare container hosting the minimal .net api. This method virtually eliminates latency between the worker service and the container service.
async function fetchFromCloudflare(method: string, path: string, body?: string): Promise<Response> {
  const { env } = await getCloudflareContext();
  const api = (env as Record<string, { fetch: typeof fetch }>).STEWARDIQ_API;

  return api.fetch(new Request(`https://internal${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  }));
}

function fetchDatasets(method: string, path: string, body?: string): Promise<Response> {
  if (isLocal) {
    return fetchFromLocal(method, path, body);
  }
  return fetchFromCloudflare(method, path, body);
}

export async function GET() {
  const response = await fetchDatasets("GET", "/api/datasets");
  const data = await response.json();
  return NextResponse.json(data);
}

// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const response = await fetchDatasets("POST", "/api/datasets", JSON.stringify(body));
//   const data = await response.json();
//   return NextResponse.json(data, { status: response.status });
// }
