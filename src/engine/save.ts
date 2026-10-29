// src/engine/save.ts — versioned saves in the browser's localStorage, with corrupt-save recovery.
import { z } from 'zod'; // Zod checks that loaded data has the right shape
import type { Avatar, Profile, SaveFile, Settings } from '../types'; // shapes we save
import { recomputeKm } from './ledger'; // total km is rebuilt from the ledger on load

export const SAVE_KEY = 'cosmotrekk.save'; // localStorage key for the save
export const BACKUP_KEY = 'cosmotrekk.save.corrupt-backup'; // where a broken save is copied before resetting

export const DEFAULT_SETTINGS: Settings = { master: true, music: 0.5, sfx: 0.7, narration: false, breathing: false, reducedMotion: false, timedQuiz: false, demoMode: false }; // sensible defaults (untimed quiz by default)

const avatarSchema = z.object({ // rules for a valid avatar
  presentation: z.enum(['girl', 'boy', 'neutral']), // body style
  skin: z.string(), suit: z.string(), visor: z.string(), // colours
  helmet: z.enum(['round', 'sleek']), // helmet shape
  patch: z.enum(['none', 'star', 'planet', 'rocket']), // patch
});

const profileSchema = z.object({ // rules for a valid profile
  id: z.string(), name: z.string().min(2).max(20), avatar: avatarSchema, createdAt: z.string(), // identity
  spaceWalkKm: z.number().min(0), // never negative
  ledger: z.array(z.object({ completionId: z.string(), km: z.number(), at: z.string(), demo: z.boolean() })), // reward ledger
  explored: z.array(z.string()), // finished exploration objectives
  attempts: z.array(z.object({ completionId: z.string(), correct: z.number().int().min(0).max(5), passed: z.boolean(), at: z.string() })), // quiz history
  bestScores: z.record(z.string(), z.number()), // best per milestone
  activeMs: z.number().min(0), // play time
  upgrades: z.object({ oxygen: z.number(), suit: z.number(), thrusters: z.number() }), // upgrades
  badges: z.array(z.string()), studied: z.array(z.string()), bookmarks: z.array(z.string()), // collections
  starMap: z.boolean(), usedDemoMode: z.boolean(), // flags
});

const saveSchema = z.object({ // rules for the whole save file
  version: z.literal(2), // must be version 2
  profiles: z.array(profileSchema), // all commanders
  activeProfileId: z.string().nullable(), // current commander
  settings: z.object({ master: z.boolean(), music: z.number(), sfx: z.number(), narration: z.boolean(), breathing: z.boolean(), reducedMotion: z.boolean(), timedQuiz: z.boolean(), demoMode: z.boolean() }), // settings
});

export function emptySave(): SaveFile { // a brand-new empty save
  return { version: 2, profiles: [], activeProfileId: null, settings: { ...DEFAULT_SETTINGS } }; // no profiles yet
}

export function newProfile(name: string, avatar: Avatar): Profile { // create a commander — ALWAYS at 0 km
  return {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, // random ID
    name: name.trim().slice(0, 20), avatar, createdAt: new Date().toISOString(), // identity
    spaceWalkKm: 0, ledger: [], explored: [], attempts: [], bestScores: {}, activeMs: 0, // progress starts empty, regardless of starting destination
    upgrades: { oxygen: 0, suit: 0, thrusters: 0 }, badges: [], studied: [], bookmarks: [], starMap: false, usedDemoMode: false, // extras
  };
}

function migrate(raw: unknown): unknown { // upgrade older save formats to the current one
  if (raw && typeof raw === 'object' && (raw as { version?: number }).version === 1) { // version 1 had no demo flag or star map
    const v1 = raw as { profiles: Record<string, unknown>[] } & Record<string, unknown>; // treat as loose object
    return { ...v1, version: 2, profiles: v1.profiles.map((p) => ({ starMap: false, usedDemoMode: false, ...p })) }; // fill the missing fields
  }
  return raw; // already current (or unknown — Zod will decide)
}

export function parseSave(text: string | null): { save: SaveFile; recovered: boolean } { // turn stored text into a valid save
  if (!text) return { save: emptySave(), recovered: false }; // nothing saved yet
  try { // JSON.parse can throw on broken text
    const result = saveSchema.safeParse(migrate(JSON.parse(text))); // migrate, then validate
    if (!result.success) return { save: emptySave(), recovered: true }; // wrong shape → start fresh (backup kept)
    const save = result.data as SaveFile; // valid data
    save.profiles = save.profiles.map((p) => ({ ...p, spaceWalkKm: recomputeKm(p) })); // rebuild totals from the ledger (edited totals are ignored)
    return { save, recovered: false }; // good save
  } catch { // JSON was unreadable
    return { save: emptySave(), recovered: true }; // start fresh (backup kept)
  }
}

export function loadSave(): { save: SaveFile; recovered: boolean } { // read from localStorage
  let text: string | null = null; // stored text
  try { text = localStorage.getItem(SAVE_KEY); } catch { /* storage blocked (private mode) → play without saving */ } // safe read
  const out = parseSave(text); // validate it
  if (out.recovered && text) { try { localStorage.setItem(BACKUP_KEY, text); } catch { /* ignore */ } } // keep a copy of the broken save
  return out; // the usable save
}

export function writeSave(save: SaveFile): void { // write to localStorage
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* storage full or blocked — game keeps running */ } // safe write
}
