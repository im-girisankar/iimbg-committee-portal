import { createClient } from "@supabase/supabase-js";

/* ─────────────────────────────────────────────────────────────
   Server-side Supabase client. Uses the SERVICE_ROLE key so it
   bypasses RLS — the only place it's used is the Hono API route
   in `api/[[...route]].ts`. NEVER import this in frontend code.
   ───────────────────────────────────────────────────────────── */

export function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}