// api/_lib/supabase.ts — talks to Supabase with plain HTTP (no SDK needed). SERVER ONLY.
// Uses SUPABASE_SERVICE_ROLE_KEY, which bypasses row-level security — it must never be sent to the browser.
import { env, fetchWithTimeout } from './http.js'; // helpers

export function supabaseConfigured(): boolean { return Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY')); } // both values present?

function headers(): Record<string, string> { // auth headers for the service role
  const key = env('SUPABASE_SERVICE_ROLE_KEY')!; // secret key
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }; // Supabase expects both
}

export async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> { // call a Postgres function (runs as one transaction)
  const r = await fetchWithTimeout(`${env('SUPABASE_URL')}/rest/v1/rpc/${fn}`, { method: 'POST', headers: headers(), body: JSON.stringify(args) }, 10000); // POST /rpc/<name>
  if (!r.ok) throw new Error(`Supabase ${fn} failed: ${r.status}`); // surface errors (without leaking details to players)
  return (await r.json()) as T; // parsed result
}

export async function select<T>(pathAndQuery: string): Promise<T> { // simple table read, e.g. "players?select=*"
  const r = await fetchWithTimeout(`${env('SUPABASE_URL')}/rest/v1/${pathAndQuery}`, { headers: headers() }, 10000); // GET
  if (!r.ok) throw new Error(`Supabase select failed: ${r.status}`); // error
  return (await r.json()) as T; // rows
}

export async function insert(table: string, rows: unknown[]): Promise<void> { // insert rows
  const r = await fetchWithTimeout(`${env('SUPABASE_URL')}/rest/v1/${table}`, { method: 'POST', headers: { ...headers(), Prefer: 'return=minimal' }, body: JSON.stringify(rows) }, 10000); // POST
  if (!r.ok) throw new Error(`Supabase insert failed: ${r.status}`); // error
}

export async function userFromToken(req: Request): Promise<string | null> { // verify the player's anonymous login token → user ID
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''); // "Bearer <token>"
  if (!token) return null; // not logged in
  const r = await fetchWithTimeout(`${env('SUPABASE_URL')}/auth/v1/user`, { headers: { apikey: env('SUPABASE_SERVICE_ROLE_KEY')!, Authorization: `Bearer ${token}` } }, 8000); // ask Supabase who this is
  if (!r.ok) return null; // invalid/expired token
  const u = (await r.json()) as { id?: string }; // user object
  return u.id ?? null; // the user ID
}
