// src/config/rewards.ts — the Space Walk reward schedule and ranks (change numbers here only).
import type { Tier } from '../types'; // import the Tier type (1 | 2 | 3 | 4)

export const TIER_REWARD_KM: Record<Tier, number> = { 1: 100, 2: 250, 3: 500, 4: 1000 }; // km paid for each tier
export const EXPEDITION_TOTAL_KM = 100 + 250 + 500 + 1000; // 1,850 km for one full four-tier expedition

export const QUESTIONS_PER_CHECKPOINT = 5; // every checkpoint has exactly five questions
export const PASS_CORRECT = 3; // 3 of 5 correct = 60% = clearance
export const PERCENT_PER_QUESTION = 20; // each correct answer adds 20 percentage points

export const RANKS = [ // fictional game ranks, from lowest to highest
  { km: 0, title: 'Cadet' }, // starting rank
  { km: 100, title: 'Explorer' }, // after the first tier
  { km: 350, title: 'Navigator' }, // after tiers 1 + 2
  { km: 850, title: 'Pathfinder' }, // after tiers 1 + 2 + 3
  { km: 1850, title: 'Expedition Commander' }, // after a full expedition
  { km: 5550, title: 'Deep-Space Veteran' }, // after three full expeditions
] as const; // "as const" keeps the values read-only

export function rankFor(km: number): string { // returns the rank title for a distance
  let title: string = RANKS[0].title; // start with the lowest rank
  for (const r of RANKS) if (km >= r.km) title = r.title; // keep upgrading while the distance is high enough
  return title; // give back the highest rank reached
}

export function nextMilestone(km: number): { km: number; title: string } | null { // next rank to aim for
  return RANKS.find((r) => r.km > km) ?? null; // first rank above current distance, or null at the top
}

export const SPACE_WALK_TOOLTIP = // exact tooltip text required by the brief
  'Your earned expedition distance in CosmoTrekk. Simulation kilometres, not real travel distance.';

export function formatKm(km: number): string { // 1000 → "1,000 km"
  return `${km.toLocaleString('en-US')} km`; // add thousands separators and the unit
}
