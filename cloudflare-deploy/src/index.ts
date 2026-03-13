import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  DOTNET_API: DurableObjectNamespace;
}

export class DotNetApi extends Container {
  defaultPort = 5090;
  sleepAfter = "5m";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Add CORS headers for cross-origin requests from the frontend
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Route all requests to the .NET container
    const response = await getContainer(env.DOTNET_API).fetch(request);

    // Clone response and add CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    return newResponse;
  },
};
