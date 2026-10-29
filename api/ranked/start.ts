// api/ranked/start.ts — POST /api/ranked/start  → creates a FIXED server-side attempt and returns 5 questions WITHOUT answer keys.
// Body: { "completionId": "exp-mars:stage1", "commander": "Nova", "demo": false }  Header: Authorization: Bearer <player token>
import { json, readJson } from '../_lib/http.js'; // helpers
import { supabaseConfigured, userFromToken, rpc } from '../_lib/supabase.js'; // Supabase
import { MISSION_BY_ID } from '../../src/data/missions.js'; // mission data (to find the destination + tier)

export async function POST(request: Request): Promise<Response> { // handles POST
  if (!supabaseConfigured()) return json({ error: 'Connected competition is not configured' }, 503); // optional feature
  const user = await userFromToken(request); if (!user) return json({ error: 'Sign-in required' }, 401); // verified player
  const body = await readJson<{ completionId?: string; commander?: string; demo?: boolean }>(request, 512); // small body
  if (!body || body.demo) return json({ error: 'Demo-mode attempts are never ranked' }, 400); // demo excluded
  const [missionId, stageText] = String(body.completionId ?? '').split(':'); // "exp-mars", "stage1"
  const tier = Number(stageText?.replace('stage', '')); const mission = MISSION_BY_ID[missionId]; // parse
  if (!mission || ![1, 2, 3, 4].includes(tier)) return json({ error: 'Unknown milestone' }, 400); // only real milestones
  const name = String(body.commander ?? 'Commander').trim().slice(0, 20) || 'Commander'; // display name (2–20 chars)
  const destination = mission.stages[tier - 1].destinationId; // question pool to use
  const out = await rpc<{ attempt_id: string; questions: unknown[] }>('start_attempt', { p_user: user, p_name: name, p_completion: body.completionId, p_tier: tier, p_destination: destination }); // server picks questions
  return json(out); // attempt ID + questions (no correct answers)
}
