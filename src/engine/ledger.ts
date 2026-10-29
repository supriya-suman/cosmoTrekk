// src/engine/ledger.ts — the IDEMPOTENT reward ledger.
// "Idempotent" means: doing the same thing twice has the same effect as doing it once.
// Each completionId (e.g. "exp-mars:stage2") can award Space Walk distance only ONE time, ever.
import type { Profile, Tier } from '../types'; // profile + tier types
import { TIER_REWARD_KM } from '../config/rewards'; // 100 / 250 / 500 / 1000 km schedule
import { hasPassed } from './quiz'; // 3-of-5 rule

export interface AwardResult { profile: Profile; awardedKm: number; reason: 'awarded' | 'already-awarded' | 'not-passed' | 'exploration-incomplete' } // what happened

export function markExplored(p: Profile, completionId: string): Profile { // remember that exploration objectives are done
  if (p.explored.includes(completionId)) return p; // already recorded → no change
  return { ...p, explored: [...p.explored, completionId] }; // add it (kept even if the quiz later fails)
}

export function applyCheckpoint( // called once when a five-question attempt is finished
  p: Profile, completionId: string, tier: Tier, correct: number, demo: boolean, now = new Date(), // inputs
): AwardResult { // returns the updated profile and the reason
  const passed = hasPassed(correct); // did they reach 60%?
  const record = { completionId, correct, passed, at: now.toISOString() }; // history row
  const best = Math.max(p.bestScores[completionId] ?? 0, correct); // replay can improve the best score
  let next: Profile = { ...p, attempts: [...p.attempts, record], bestScores: { ...p.bestScores, [completionId]: best } }; // save history + best
  if (!p.explored.includes(completionId)) return { profile: next, awardedKm: 0, reason: 'exploration-incomplete' }; // BOTH exploration AND quiz required
  if (!passed) return { profile: next, awardedKm: 0, reason: 'not-passed' }; // below 60% → no distance
  if (p.ledger.some((e) => e.completionId === completionId)) return { profile: next, awardedKm: 0, reason: 'already-awarded' }; // replay cannot farm distance
  const km = TIER_REWARD_KM[tier]; // look up the reward for this tier (same for every category)
  next = { // pay out exactly once
    ...next, // keep everything else
    spaceWalkKm: next.spaceWalkKm + km, // add the distance
    ledger: [...next.ledger, { completionId, km, at: now.toISOString(), demo }], // write the ledger entry (this is what blocks duplicates)
    usedDemoMode: next.usedDemoMode || demo, // remember if demo mode was used
  };
  return { profile: next, awardedKm: km, reason: 'awarded' }; // success
}

export function recomputeKm(p: Profile): number { // the ledger is the source of truth; total = sum of entries
  return p.ledger.reduce((sum, e) => sum + e.km, 0); // add up every entry
}

export function quizAccuracy(p: Profile): number { // overall accuracy across all finished attempts (0–100)
  if (p.attempts.length === 0) return 0; // no attempts yet
  const correct = p.attempts.reduce((s, a) => s + a.correct, 0); // total correct answers
  return Math.round((correct / (p.attempts.length * 5)) * 100); // percentage of all questions answered
}
