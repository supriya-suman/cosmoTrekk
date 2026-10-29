// src/engine/connected.ts — OPTIONAL connected competition (browser side).
// Only PUBLIC Supabase values are used here (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). They are safe to expose
// because row-level security lets browsers read the leaderboard only. All scoring happens on the server.
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined; // public project URL
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined; // public anon key
const TOKEN_KEY = 'cosmotrekk.connected.session'; // where the anonymous session is kept on this device

export const connectedAvailable = Boolean(URL_ && ANON); // true only when configured

interface Session { access_token: string; refresh_token: string; expires_at: number } // Supabase session shape

async function authCall(path: string, body: unknown): Promise<Session> { // call Supabase Auth
  const r = await fetch(`${URL_}/auth/v1/${path}`, { method: 'POST', headers: { apikey: ANON!, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); // POST
  if (!r.ok) throw new Error('Could not sign in anonymously. Is "Anonymous sign-ins" enabled in Supabase?'); // friendly error
  const j = (await r.json()) as { access_token: string; refresh_token: string; expires_in: number }; // response
  return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Date.now() + j.expires_in * 1000 }; // normalise
}

export async function getToken(): Promise<string> { // returns a valid player token (guest / anonymous — no email needed)
  let s: Session | null = null; // current session
  try { s = JSON.parse(localStorage.getItem(TOKEN_KEY) ?? 'null'); } catch { s = null; } // load saved session
  if (s && s.expires_at - Date.now() > 60_000) return s.access_token; // still valid for > 1 minute
  s = s ? await authCall('token?grant_type=refresh_token', { refresh_token: s.refresh_token }).catch(() => null) : null; // try to refresh
  if (!s) s = await authCall('signup', {}); // otherwise create a new anonymous user
  localStorage.setItem(TOKEN_KEY, JSON.stringify(s)); // remember it
  return s.access_token; // token for our API
}

async function api<T>(path: string, body: unknown): Promise<T> { // call our Vercel server function with the player token
  const r = await fetch(`/api/ranked/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` }, body: JSON.stringify(body) }); // POST
  const j = await r.json().catch(() => ({})); // parse (tolerate empty)
  if (!r.ok) throw new Error((j as { error?: string }).error ?? `Server error ${r.status}`); // surface error text
  return j as T; // result
}

export interface RankedQuestion { id: string; question: string; options: { id: 'a' | 'b' | 'c' | 'd'; text: string }[]; difficulty: string } // no answer key!
export const rankedStart = (completionId: string, commander: string) => api<{ attempt_id: string; questions: RankedQuestion[] }>('start', { completionId, commander, demo: false }); // begin
export const rankedAnswer = (attemptId: string, questionId: string, optionId: string) => api<{ correct: boolean; correct_option_id: string; explanation: string }>('answer', { attemptId, questionId, optionId }); // check one answer
export const rankedComplete = (attemptId: string) => api<{ correct: number; passed: boolean; awarded_km: number; verified_km: number }>('complete', { attemptId }); // finish
