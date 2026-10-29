// api/ranked/leaderboard.ts — GET /api/ranked/leaderboard → verified Space Walk rankings (server totals only).
import { json } from '../_lib/http.js'; // helpers
import { supabaseConfigured, select } from '../_lib/supabase.js'; // Supabase

export async function GET(): Promise<Response> { // handles GET
  if (!supabaseConfigured()) return json({ error: 'Connected competition is not configured', rows: [] }, 503); // optional
  type P = { commander_name: string; verified_km: number; highest_tier: number; milestones: number; correct_total: number; answered_total: number; active_ms: number }; // row shape
  const rows = await select<P[]>('players?select=commander_name,verified_km,highest_tier,milestones,correct_total,answered_total,active_ms&order=verified_km.desc&limit=100'); // top 100
  return json({ rows: rows.map((r) => ({ name: r.commander_name, km: r.verified_km, tier: r.highest_tier, missions: r.milestones, accuracy: r.answered_total ? Math.round((r.correct_total / r.answered_total) * 100) : 0, activeMs: r.active_ms, label: 'Verified by server' })) }); // shaped rows
}
