// api/health.ts — GET /api/health → which OPTIONAL integrations are configured (true/false only, never the keys).
import { env, json } from './_lib/http.js'; // helpers

export function GET(): Response { // handles GET requests
  return json({ // report
    ok: true, // the server functions are running
    gemini: Boolean(env('GEMINI_API_KEY') && env('GEMINI_MODEL')), // question generation available?
    nasa: true, // NASA Image Library needs no key; NASA_API_KEY is optional
    supabase: Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY')), // connected rankings available?
    refreshProtected: Boolean(env('ADMIN_REFRESH_TOKEN')), // is the refresh endpoint protected?
  });
}
