// src/engine/store.ts — the game's single source of truth ("store") + every action that changes it.
// React components read it with useGame(); Phaser never touches it directly (it talks through the bridge).
import { useSyncExternalStore } from 'react'; // React hook that re-renders when an outside store changes
import type { Avatar, Profile, SaveFile, Settings, Tier } from '../types'; // shapes
import { loadSave, newProfile, writeSave } from './save'; // persistence
import { applyCheckpoint, markExplored } from './ledger'; // reward rules
import { newAttempt, submitAnswer, advance, correctCount, isComplete, type OptionId, type QuizAttempt } from './quiz'; // quiz rules
import { MISSION_BY_ID, completionId } from '../data/missions'; // mission data
import { questionsFor } from '../data/questions'; // reviewed question bank

export type Screen = // every screen in the game (explicit state machine)
  | 'title' | 'create' | 'map' | 'launch' | 'briefing' | 'explore' | 'quiz' | 'results' | 'summary'
  | 'study' | 'rankings' | 'howto' | 'settings' | 'profile';

export interface CheckpointResult { completionId: string; correct: number; awardedKm: number; reason: string; passed: boolean } // last result

export interface GameState { // everything the UI needs
  save: SaveFile; // persisted data (profiles + settings)
  screen: Screen; // current screen
  backTo: Screen; // where "Back" returns to
  run: { missionId: string; tier: Tier } | null; // the stage being played
  quiz: QuizAttempt | null; // current quiz attempt
  lastQuestionIds: string[]; // previous attempt's questions (so retries vary)
  result: CheckpointResult | null; // last checkpoint outcome
  studyFocus: string | null; // Know Your Space card to open
  recovered: boolean; // true if a corrupt save was reset
  upgradePending: boolean; // true right after a fresh clearance (choose an upgrade)
  paused: boolean; // pause menu open
}

const loaded = loadSave(); // read localStorage once when the game starts
let state: GameState = { // initial state
  save: loaded.save, screen: 'title', backTo: 'title', run: null, quiz: null, lastQuestionIds: [], // basics
  result: null, studyFocus: null, recovered: loaded.recovered, upgradePending: false, paused: false, // extras
};
const listeners = new Set<() => void>(); // React components waiting for changes

function set(patch: Partial<GameState>): void { // merge changes, persist, and notify
  state = { ...state, ...patch }; // create a new state object (React detects the change)
  if (patch.save) writeSave(patch.save); // write to localStorage whenever save data changes
  listeners.forEach((l) => l()); // tell every subscriber to re-render
}

export function getState(): GameState { return state; } // read the current state (used by tests/timers)
function subscribe(l: () => void): () => void { listeners.add(l); return () => listeners.delete(l); } // add/remove a listener
export function useGame(): GameState { return useSyncExternalStore(subscribe, getState, getState); } // React hook

export function activeProfile(s: GameState = state): Profile | null { // the commander currently playing
  return s.save.profiles.find((p) => p.id === s.save.activeProfileId) ?? null; // null if none
}

function updateProfile(fn: (p: Profile) => Profile): void { // change the active profile safely
  const p = activeProfile(); if (!p) return; // nothing to update
  const profiles = state.save.profiles.map((x) => (x.id === p.id ? fn(x) : x)); // replace only the active one
  set({ save: { ...state.save, profiles } }); // store + persist
}

// ---------------- navigation ----------------
export function go(screen: Screen): void { set({ screen, backTo: state.screen, paused: false }); } // move to another screen, remember where we came from
export function back(): void { go(state.backTo === state.screen ? 'title' : state.backTo); } // go back one step
export function openStudy(lessonId: string | null): void { set({ studyFocus: lessonId }); go('study'); } // open Know Your Space at a card
export function setPaused(paused: boolean): void { set({ paused }); } // open/close pause

// ---------------- profiles & settings ----------------
export function createProfile(name: string, avatar: Avatar): void { // make a new commander (starts at 0 km)
  const p = newProfile(name, avatar); // build it
  set({ save: { ...state.save, profiles: [...state.save.profiles, p], activeProfileId: p.id } }); // add + select
  go('map'); // straight to "Choose Your First Expedition"
}
export function selectProfile(id: string): void { set({ save: { ...state.save, activeProfileId: id } }); } // switch commander
export function updateAvatar(avatar: Avatar): void { updateProfile((p) => ({ ...p, avatar })); } // change cosmetics
export function deleteProfile(id: string): void { // remove a commander from this device
  const profiles = state.save.profiles.filter((p) => p.id !== id); // drop it
  set({ save: { ...state.save, profiles, activeProfileId: profiles[0]?.id ?? null } }); // pick another (or none)
}
export function updateSettings(patch: Partial<Settings>): void { set({ save: { ...state.save, settings: { ...state.save.settings, ...patch } } }); } // change settings

// ---------------- mission flow: LAUNCH → BRIEFING → EXPLORATION → QUIZ → RESULTS → UPGRADE → NEXT TIER ----------------
export function isUnlocked(missionId: string, tier: Tier, p: Profile | null = activeProfile()): boolean { // tier N needs tier N-1 cleared
  if (tier === 1) return true; // first tier always open
  return !!p?.ledger.some((e) => e.completionId === completionId(missionId, (tier - 1) as Tier)); // previous milestone paid?
}

export function startStage(missionId: string, tier: Tier): void { // player chose a stage on the map
  const stage = MISSION_BY_ID[missionId].stages[tier - 1]; // look up the stage
  set({ run: { missionId, tier }, quiz: null, result: null, lastQuestionIds: [] }); // reset the run
  go(stage.launch ? 'launch' : 'briefing'); // campaign levels start with the launch checklist
}

export function launchComplete(): void { go('briefing'); } // countdown finished → immersive briefing
export function beginExploration(): void { go('explore'); } // "Begin Mission" pressed

export function explorationComplete(): void { // Phaser reported all objectives done
  if (!state.run) return; // safety check
  const id = completionId(state.run.missionId, state.run.tier); // milestone ID
  updateProfile((p) => markExplored(p, id)); // remember exploration (survives quiz failure)
  startQuiz(); // move to the five-question checkpoint
}

export function startQuiz(): void { // create a brand-new attempt
  if (!state.run) return; // safety check
  const stage = MISSION_BY_ID[state.run.missionId].stages[state.run.tier - 1]; // current stage
  const attempt = newAttempt(questionsFor(stage.destinationId), true, state.lastQuestionIds); // ranked attempt, avoid last questions
  set({ quiz: attempt, lastQuestionIds: attempt.questions.map((q) => q.id), result: null }); // store it (old answers discarded)
  go('quiz'); // show the quiz
}

export function answer(option: OptionId): void { // player locked an answer
  if (!state.quiz) return; // no quiz running
  set({ quiz: submitAnswer(state.quiz, state.quiz.index, option) }); // lock it (second clicks are ignored)
}

export function nextQuestion(): void { // "Continue" pressed
  const q = state.quiz; if (!q) return; // no quiz
  if (q.index < q.questions.length - 1) { set({ quiz: advance(q) }); return; } // not the last → next question
  if (isComplete(q)) finishQuiz(); // last question answered → grade the attempt
}

let finishing = false; // guard so a double-click cannot grade twice
export function finishQuiz(): void { // grade a complete attempt exactly once
  const q = state.quiz, run = state.run; // read current attempt + run
  if (!q || !run || !isComplete(q) || finishing) return; // incomplete or already grading → do nothing
  finishing = true; // lock
  const id = completionId(run.missionId, run.tier); // milestone
  const correct = correctCount(q); // deterministic grading (never the AI)
  const p = activeProfile(); // current commander
  if (p) { // only if someone is playing
    const out = applyCheckpoint(p, id, run.tier, correct, state.save.settings.demoMode); // ledger decides the award
    let prof = out.profile; // updated profile
    prof = awardBadges(prof, id, correct, out.awardedKm > 0); // badges
    const profiles = state.save.profiles.map((x) => (x.id === prof.id ? prof : x)); // replace in list
    set({ save: { ...state.save, profiles }, result: { completionId: id, correct, awardedKm: out.awardedKm, reason: out.reason, passed: correct >= 3 }, quiz: null, upgradePending: out.awardedKm > 0 }); // store result
  }
  finishing = false; // unlock
  go('results'); // show the result screen
}

function awardBadges(p: Profile, id: string, correct: number, fresh: boolean): Profile { // add any badges just earned
  const b = new Set(p.badges); // current badges
  if (fresh) b.add('first-clearance'); // first ever clearance
  if (correct === 5) b.add('perfect-checkpoint'); // 5/5
  if (fresh && id === 'campaign:stage2') b.add('chapter-one'); // reached Mars in the story
  if (fresh && id.endsWith(':stage4')) b.add(id.startsWith('campaign') ? 'ring-guardian' : `expedition-${id.split(':')[0]}`); // finished a whole mission
  if (p.studied.length >= 10) b.add('scholar'); // studied 10 cards
  return { ...p, badges: [...b], starMap: p.starMap || (fresh && id === 'campaign:stage4') }; // Horizon Star Map found at the campaign end
}

export function chooseUpgrade(kind: 'oxygen' | 'suit' | 'thrusters'): void { // pick a reward upgrade after clearance
  updateProfile((p) => ({ ...p, upgrades: { ...p.upgrades, [kind]: Math.min(p.upgrades[kind] + 1, 5) } })); // max level 5
  set({ upgradePending: false }); // hide the picker
}

export function continueAfterResults(): void { // "Next" on the results screen
  const run = state.run; if (!run) return go('map'); // no run → map
  if (run.tier === 4) return go('summary'); // last tier → expedition summary
  startStage(run.missionId, (run.tier + 1) as Tier); // otherwise the next tier
}

export function restartActivity(): void { set({ run: state.run ? { ...state.run } : null }); go('briefing'); } // depletion → back to the latest checkpoint (progress kept)

// ---------------- study & time ----------------
export function markStudied(id: string): void { updateProfile((p) => (p.studied.includes(id) ? p : { ...p, studied: [...p.studied, id] })); } // record reading (no distance!)
export function toggleBookmark(id: string): void { updateProfile((p) => ({ ...p, bookmarks: p.bookmarks.includes(id) ? p.bookmarks.filter((x) => x !== id) : [...p.bookmarks, id] })); } // add/remove bookmark
export function addActiveTime(ms: number): void { // active play time (called by the timer only while actually playing)
  const p = activeProfile(); if (!p) return; // nobody playing
  const profiles = state.save.profiles.map((x) => (x.id === p.id ? { ...x, activeMs: x.activeMs + ms } : x)); // add time
  state = { ...state, save: { ...state.save, profiles } }; // update quietly (no re-render every second)
  writeSave(state.save); // persist
}
