// src/types.ts — shared TypeScript "shapes" (types) used across the whole game.
// A type describes what an object must contain; TypeScript checks this before the code runs.

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'; // three question levels
export type Tier = 1 | 2 | 3 | 4; // an expedition always has exactly four tiers (stages)

export type CatalogueGroup = 'natural' | 'systems' | 'human-made' | 'events'; // the four Know Your Space sections

export interface Source { // one trusted reference used for facts and questions
  id: string; // short stable ID, e.g. "nasa-mars"
  title: string; // human-readable title
  url: string; // official web address
  category: string; // which topic it supports
  retrievedAt: string; // when the content was last reviewed (ISO date)
  statements: string[]; // facts this source supports (used to ground AI questions)
}

export interface Fact { label: string; value: string } // one row in a briefing fact table

export interface CatalogueEntry { // one card in Know Your Space
  id: string; // unique ID, e.g. "mars"
  name: string; // display name
  group: CatalogueGroup; // which of the four sections it lives in
  category: string; // e.g. "Planet", "Comet"
  beginner: string; // easiest explanation
  intermediate: string; // medium explanation
  advanced: string; // deeper explanation
  vocabulary: string[]; // key words to learn
  hazards: string[]; // mission dangers
  equipment: string[]; // gear recommendations
  facts: string[]; // short memorable facts
  sourceIds: string[]; // links into the source registry
  expeditionId?: string; // set only when a playable expedition exists for it
  fictional?: boolean; // true for invented training sites (e.g. a fictional asteroid)
}

export interface Briefing { // the immersive overlay shown before a destination
  destinationId: string; // which destination this describes
  name: string; // destination name
  category: string; // its category
  theme: SceneTheme; // visual theme used for the big preview
  diagram: 'solar-system' | 'moon-orbit' | 'earth-orbit' | 'star-remote' | 'conceptual'; // which simple labelled diagram to draw
  location: string; // where it sits in its parent system
  facts: Fact[]; // distance, size, atmosphere, gravity, etc.
  equipment: string[]; // recommended gear
  memorable: string[]; // 3–5 memorable facts
  sourceIds: string[]; // source links
  fictionNote?: string; // label shown when the site is a simulation invention
}

export type SceneTheme = // visual themes the Phaser scene knows how to paint
  | 'earth' | 'moon' | 'mars' | 'venus' | 'saturn' | 'sun' | 'asteroid' | 'comet' | 'exoplanet' | 'orbit';

export interface TargetDef { // something the player must interact with
  label: string; // shown above it, e.g. "Comms relay"
  action: string; // verb shown in the prompt, e.g. "Repair relay"
  needs: number; // how many collected items are required before it works
  kind?: 'normal' | 'puzzle' | 'drone'; // puzzle = energy-routing mini-game, drone = final encounter
}

export interface Stage { // one tier of an expedition, or one level of the campaign
  tier: Tier; // 1, 2, 3 or 4
  title: string; // stage title
  destinationId: string; // which briefing + question bank to use
  theme: SceneTheme; // background art
  objective: string; // one-line objective shown in the HUD
  collectible: { label: string; count: number; color: number }; // what to pick up, how many, and its colour (hex number)
  targets: TargetDef[]; // ordered interactions to finish exploration
  hazards: number; // number of drifting hazards (suit damage on contact)
  hazardLabel: string; // name of the hazard, e.g. "Dust devil"
  floating?: boolean; // true = zero-gravity orbital scene (no ground)
  launch?: { from: string; to: string; module: string }; // campaign only: launch checklist before this level
  storyIntro?: string; // campaign only: short mission-control message
}

export interface Mission { // a whole expedition (4 stages) or the featured campaign
  id: string; // e.g. "exp-mars" or "campaign"
  mode: 'expedition' | 'campaign'; // two kinds of play
  title: string; // display title
  category: string; // starting category label, e.g. "Planet"
  blurb: string; // short description on the mission map
  stages: [Stage, Stage, Stage, Stage]; // always exactly four
}

export interface QuestionOption { id: 'a' | 'b' | 'c' | 'd'; text: string } // one answer choice with a stable ID

export interface Question { // one multiple-choice question
  id: string; // unique ID
  category: string; // e.g. "Planet"
  destination: string; // destination ID, e.g. "mars"
  difficulty: Difficulty; // beginner / intermediate / advanced
  role: 'fact' | 'understanding' | 'decision'; // Q1–2 facts, Q3–4 understanding, Q5 mission decision
  question: string; // the question text
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption]; // exactly four choices
  correctOptionId: 'a' | 'b' | 'c' | 'd'; // the one right answer
  explanation: string; // short explanation shown after answering
  sourceId: string; // which source supports it
  tags: string[]; // curriculum tags, link to lessons
  lessonId: string; // Know Your Space card to study if wrong
}

export type AvatarPresentation = 'girl' | 'boy' | 'neutral'; // avatar body style (cosmetic only)

export interface Avatar { // all cosmetic choices — none change abilities
  presentation: AvatarPresentation; // body style
  skin: string; // skin tone colour
  suit: string; // spacesuit colour
  visor: string; // visor tint colour
  helmet: 'round' | 'sleek'; // helmet shape
  patch: 'none' | 'star' | 'planet' | 'rocket'; // optional mission patch
}

export interface LedgerEntry { // one reward that has been paid out
  completionId: string; // unique milestone ID, e.g. "exp-mars:stage2"
  km: number; // distance awarded
  at: string; // when it happened
  demo: boolean; // true if earned while Demo Mode was on
}

export interface AttemptRecord { // one finished quiz attempt (kept for history/accuracy)
  completionId: string; // which milestone
  correct: number; // number correct out of 5
  passed: boolean; // reached 60%?
  at: string; // timestamp
}

export interface Profile { // one local commander
  id: string; // random ID
  name: string; // commander name (2–20 characters)
  avatar: Avatar; // cosmetic choices
  createdAt: string; // creation time
  spaceWalkKm: number; // total earned Space Walk (always starts at 0)
  ledger: LedgerEntry[]; // reward ledger — guarantees each milestone pays once
  explored: string[]; // completionIds whose exploration objectives are done
  attempts: AttemptRecord[]; // quiz history
  bestScores: Record<string, number>; // best correct count per milestone
  activeMs: number; // active play time in milliseconds (paused time excluded)
  upgrades: { oxygen: number; suit: number; thrusters: number }; // upgrade levels earned after each clearance
  badges: string[]; // earned badge IDs
  studied: string[]; // Know Your Space cards opened (not proof of mastery)
  bookmarks: string[]; // bookmarked study cards
  starMap: boolean; // true once the fictional Horizon Star Map is discovered
  usedDemoMode: boolean; // true if any reward was earned in demo mode
}

export interface Settings { // device-wide preferences
  master: boolean; // master sound on/off
  music: number; // music volume 0–1
  sfx: number; // sound-effects volume 0–1
  narration: boolean; // read briefings aloud
  breathing: boolean; // optional soft suit-breathing sound
  reducedMotion: boolean; // fewer animations
  timedQuiz: boolean; // optional quiz timer (off by default)
  demoMode: boolean; // shorter exploration for presentations
}

export interface SaveFile { // everything written to localStorage
  version: 2; // save format version (for migrations)
  profiles: Profile[]; // all local commanders
  activeProfileId: string | null; // who is playing now
  settings: Settings; // preferences
}
