// api/_lib/http.ts — small helpers shared by every server function (files in api/_lib are NOT endpoints).
// Server functions run on Vercel's servers, so secrets (process.env) are safe here and NEVER reach the browser.

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response { // build a JSON response
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders } }); // default: never cache
}

export function env(name: string): string | undefined { // read an environment variable (undefined if empty)
  const v = process.env[name]; // value from Vercel / .env.local
  return v && v.trim() ? v.trim() : undefined; // treat blank as missing
}

export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 15000): Promise<Response> { // fetch that gives up after "ms"
  const ctrl = new AbortController(); // lets us cancel the request
  const t = setTimeout(() => ctrl.abort(), ms); // cancel after the timeout
  try { return await fetch(url, { ...init, signal: ctrl.signal }); } // do the request
  finally { clearTimeout(t); } // always clear the timer
}

export async function readJson<T>(req: Request, maxBytes = 4096): Promise<T | null> { // read a small JSON body safely
  const text = await req.text(); // raw body
  if (text.length > maxBytes) return null; // limit request size
  try { return JSON.parse(text) as T; } catch { return null; } // invalid JSON → null
}
