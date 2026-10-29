// api/ranked/answer.ts — POST /api/ranked/answer → the SERVER checks one answer against its private key and locks it.
// Body: { "attemptId": "...", "questionId": "...", "optionId": "a" }
import { json, readJson } from '../_lib/http.js'; // helpers
import { supabaseConfigured, userFromToken, rpc } from '../_lib/supabase.js'; // Supabase

export async function POST(request: Request): Promise<Response> { // handles POST
  if (!supabaseConfigured()) return json({ error: 'Connected competition is not configured' }, 503); // optional
  const user = await userFromToken(request); if (!user) return json({ error: 'Sign-in required' }, 401); // verified player
  const b = await readJson<{ attemptId?: string; questionId?: string; optionId?: string }>(request, 512); // body
  if (!b?.attemptId || !b.questionId || !['a', 'b', 'c', 'd'].includes(String(b.optionId))) return json({ error: 'Bad request' }, 400); // validate
  const out = await rpc<{ correct: boolean; correct_option_id: string; explanation: string }>('submit_answer', { p_user: user, p_attempt: b.attemptId, p_question: b.questionId, p_option: b.optionId }); // locked server-side (re-answers ignored)
  return json(out); // verdict
}
