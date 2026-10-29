// api/ranked/complete.ts — POST /api/ranked/complete → grades the attempt and awards Space Walk ONCE per milestone (one SQL transaction).
// Body: { "attemptId": "..." }
import { json, readJson } from '../_lib/http.js'; // helpers
import { supabaseConfigured, userFromToken, rpc } from '../_lib/supabase.js'; // Supabase

export async function POST(request: Request): Promise<Response> { // handles POST
  if (!supabaseConfigured()) return json({ error: 'Connected competition is not configured' }, 503); // optional
  const user = await userFromToken(request); if (!user) return json({ error: 'Sign-in required' }, 401); // verified player
  const b = await readJson<{ attemptId?: string }>(request, 256); if (!b?.attemptId) return json({ error: 'Bad request' }, 400); // body
  const out = await rpc<{ correct: number; passed: boolean; awarded_km: number; verified_km: number }>('complete_attempt', { p_user: user, p_attempt: b.attemptId }); // transactional completion
  return json(out); // result
}
