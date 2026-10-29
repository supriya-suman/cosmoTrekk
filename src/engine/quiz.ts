// src/engine/quiz.ts — pure checkpoint logic: pick 5 questions, lock answers, score, decide clearance.
// "Pure" = no screen code here, so it is easy to unit-test (see tests/quiz.test.ts).
import type { Question, Difficulty } from '../types'; // question shape
import { PASS_CORRECT, PERCENT_PER_QUESTION, QUESTIONS_PER_CHECKPOINT } from '../config/rewards'; // rules: 5 Qs, 3 to pass, 20% each

export type OptionId = 'a' | 'b' | 'c' | 'd'; // the four answer IDs

export interface QuizAttempt { // the state of ONE attempt (a retry always creates a brand-new one)
  attemptId: string; // unique ID for this attempt
  questions: Question[]; // exactly five questions
  answers: (OptionId | null)[]; // chosen option per question (null = not answered yet)
  index: number; // which question is on screen (0–4)
  ranked: boolean; // true = no hints allowed
}

const PLAN: Difficulty[] = ['beginner', 'beginner', 'intermediate', 'intermediate', 'advanced']; // Q1–2 facts, Q3–4 understanding, Q5 decision

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] { // Fisher–Yates shuffle (fair random order)
  const a = [...items]; // copy so the original array is not changed
  for (let i = a.length - 1; i > 0; i--) { // walk backwards through the array
    const j = Math.floor(rng() * (i + 1)); // pick a random earlier position
    [a[i], a[j]] = [a[j], a[i]]; // swap the two items
  }
  return a; // the shuffled copy
}

export function pickCheckpoint(pool: Question[], rng: () => number = Math.random, avoid: string[] = []): Question[] { // choose 5 questions
  const chosen: Question[] = []; // the questions we pick
  for (const diff of PLAN) { // one slot at a time, following the difficulty plan
    const candidates = pool.filter((q) => q.difficulty === diff && !chosen.includes(q)); // right difficulty, not already chosen
    const fresh = candidates.filter((q) => !avoid.includes(q.id)); // prefer questions NOT seen in the previous attempt (varies retries)
    const from = fresh.length > 0 ? fresh : candidates; // fall back to any candidate if every one was seen
    const fallback = pool.filter((q) => !chosen.includes(q)); // safety net if a difficulty bucket is empty
    const pickFrom = from.length > 0 ? from : fallback; // final list to pick from
    chosen.push(shuffle(pickFrom, rng)[0]); // take one random question
  }
  if (chosen.length !== QUESTIONS_PER_CHECKPOINT) throw new Error('Checkpoint must have exactly five questions'); // hard rule
  return chosen; // five questions in plan order
}

export function newAttempt(pool: Question[], ranked: boolean, avoid: string[] = [], rng: () => number = Math.random): QuizAttempt { // start fresh
  return { // every retry starts with empty answers — scores are NEVER combined across attempts
    attemptId: `att-${Date.now().toString(36)}-${Math.floor(rng() * 1e6).toString(36)}`, // readable unique ID
    questions: pickCheckpoint(pool, rng, avoid), // five new questions
    answers: Array(QUESTIONS_PER_CHECKPOINT).fill(null), // nothing answered yet
    index: 0, // start at question 1
    ranked, // ranked attempts show no hints
  };
}

export function submitAnswer(att: QuizAttempt, qIndex: number, option: OptionId): QuizAttempt { // lock one answer
  if (qIndex < 0 || qIndex >= att.questions.length) return att; // ignore invalid index
  if (att.answers[qIndex] !== null) return att; // already answered → locked (double-clicks cannot change or double-count)
  const answers = [...att.answers]; // copy the answers array
  answers[qIndex] = option; // store the choice
  return { ...att, answers }; // return a new attempt object (immutable update)
}

export function advance(att: QuizAttempt): QuizAttempt { // move to the next question (only after Continue)
  if (att.answers[att.index] === null) return att; // cannot skip an unanswered question
  return { ...att, index: Math.min(att.index + 1, att.questions.length - 1) }; // next index, never past the last
}

export function isCorrect(att: QuizAttempt, i: number): boolean | null { // true / false / null (unanswered)
  const a = att.answers[i]; // chosen option
  if (a === null) return null; // not answered yet
  return a === att.questions[i].correctOptionId; // compare with the answer key
}

export function correctCount(att: QuizAttempt): number { // how many are right so far
  return att.answers.filter((_, i) => isCorrect(att, i) === true).length; // count the true values
}

export function readinessPercent(att: QuizAttempt): number { // e.g. 3 correct → 60
  return correctCount(att) * PERCENT_PER_QUESTION; // 20 points per correct answer
}

export function isComplete(att: QuizAttempt): boolean { // all five answered?
  return att.answers.every((a) => a !== null); // true only when no nulls remain
}

export function hasPassed(correct: number): boolean { // the clearance rule
  return correct >= PASS_CORRECT; // 3/5 (60%) or more passes; 0, 1, 2 do not
}
