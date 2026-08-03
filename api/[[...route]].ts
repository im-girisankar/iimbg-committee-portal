import { handle } from "hono/vercel";
import { app } from "./app.js";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const PATCH = handle(app);

export default app;// Force fresh deploy Mon Aug  3 21:22:18 IST 2026
