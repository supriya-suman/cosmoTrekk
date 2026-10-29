// tests/quiz.test.ts — automatic checks for the five-question checkpoint rules (run: npm test)
import { describe, it, expect } from 'vitest'; // test helpers
import { newAttempt, submitAnswer, advance, correctCount, isComplete, hasPassed, readinessPercent, pickCheckpoint } from '../src/engine/quiz'; // code under test
import { questionsFor } from '../src/data/questions'; // real question bank

const pool = questionsFor('mars'); // use Mars questions for the tests
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; // repeatable random numbers

function play(correctWanted: number) { // answer an attempt with an exact number of correct answers
  let a = newAttempt(pool, true, [], seeded(7)); // fresh attempt
  a.questions.forEach((q, i) => { // for each question
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id; // any wrong option
    a = submitAnswer(a, i, i < correctWanted ? q.correctOptionId : wrong); // right for the first N, wrong after
    a = advance(a); // press Continue
  });
  return a; // finished attempt
}

describe('checkpoint rules', () => { // group of tests
  it('has exactly five questions with four distinct options and one valid answer', () => { // structure test
    const qs = pickCheckpoint(pool, seeded(3)); // pick five
    expect(qs).toHaveLength(5); // five questions
    qs.forEach((q) => { expect(new Set(q.options.map((o) => o.text)).size).toBe(4); expect(q.options.map((o) => o.id)).toContain(q.correctOptionId); }); // 4 distinct, answer valid
    expect(qs.map((q) => q.difficulty)).toEqual(['beginner', 'beginner', 'intermediate', 'intermediate', 'advanced']); // difficulty order
  });
  it('3/5 passes and 2/5 does not', () => { // pass threshold
    expect(hasPassed(correctCount(play(3)))).toBe(true); // 60% passes
    expect(readinessPercent(play(3))).toBe(60); // 20 points each
    expect(hasPassed(correctCount(play(2)))).toBe(false); // 40% fails
    expect(hasPassed(0)).toBe(false); expect(hasPassed(1)).toBe(false); // 0 and 1 fail
  });
  it('a wrong answer does not end the attempt early', () => { // all five must be answered
    let a = newAttempt(pool, true, [], seeded(9)); // fresh
    const q = a.questions[0]; // first question
    a = submitAnswer(a, 0, q.options.find((o) => o.id !== q.correctOptionId)!.id); // answer wrong
    expect(isComplete(a)).toBe(false); // attempt continues
    a = advance(a); expect(a.index).toBe(1); // moves to question 2
  });
  it('double submission cannot change a locked answer', () => { // lock rule
    let a = newAttempt(pool, true, [], seeded(11)); // fresh
    const q = a.questions[0]; const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id; // pick wrong option
    a = submitAnswer(a, 0, wrong); a = submitAnswer(a, 0, q.correctOptionId); // try to change it
    expect(a.answers[0]).toBe(wrong); // still the first choice
  });
  it('retry creates a fresh attempt with empty answers and varied questions', () => { // retry rule
    const first = play(2); // failed attempt
    const retry = newAttempt(pool, true, first.questions.map((q) => q.id), seeded(21)); // retry avoiding seen questions
    expect(retry.answers.every((x) => x === null)).toBe(true); // empty answers
    expect(retry.questions.some((q) => !first.questions.map((f) => f.id).includes(q.id))).toBe(true); // at least one new question
  });
});
