import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./app.js";

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`[api] listening on http://localhost:${info.port}`);
});