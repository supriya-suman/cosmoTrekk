// tests/content.test.ts — checks the bundled science content and the AI-candidate validator (run: npm test)
import { describe, it, expect } from 'vitest'; // test helpers
import { QUESTIONS } from '../src/data/questions'; // reviewed bank
import { CATALOGUE } from '../src/data/catalogue'; // study cards
import { BRIEFINGS } from '../src/data/briefings'; // briefings
import { SOURCE_BY_ID } from '../src/data/sources'; // registry
import { EXPEDITIONS, CAMPAIGN } from '../src/data/missions'; // missions
import { validateCandidates } from '../src/engine/questionSchema'; // validator
import { sortRows, type Row } from '../src/screens/Rankings'; // ranking order

describe('reviewed content', () => { // group
  it('every question has 4 distinct options, one valid answer, explanation, known source and lesson', () => { // bank quality
    const ids = new Set<string>(); // duplicate check
    for (const q of QUESTIONS) { // each question
      expect(ids.has(q.id)).toBe(false); ids.add(q.id); // unique ID
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4); // distinct options
      expect(q.options.map((o) => o.id)).toEqual(['a', 'b', 'c', 'd']); // stable IDs
      expect(['a', 'b', 'c', 'd']).toContain(q.correctOptionId); // valid answer
      expect(q.explanation.length).toBeGreaterThan(10); // has explanation
      expect(SOURCE_BY_ID[q.sourceId]).toBeDefined(); // source exists
      expect(CATALOGUE.some((c) => c.id === q.lessonId)).toBe(true); // lesson exists
    }
  });
  it('at least 10 reviewed questions per playable category and campaign destination, at every difficulty', () => { // minimums
    const dests = new Set([...EXPEDITIONS, CAMPAIGN].flatMap((m) => m.stages.map((s) => s.destinationId))); // all destinations used
    for (const d of dests) { // each
      const qs = QUESTIONS.filter((q) => q.destination === d); // its questions
      expect(qs.length).toBeGreaterThanOrEqual(10); // minimum 10
      for (const diff of ['beginner', 'intermediate', 'advanced']) expect(qs.filter((q) => q.difficulty === diff).length).toBeGreaterThanOrEqual(2); // spread
      expect(BRIEFINGS[d]).toBeDefined(); // every destination has a briefing
    }
  });
  it('eight playable expeditions with four tiers each, and every catalogue card is sourced', () => { // structure
    expect(EXPEDITIONS).toHaveLength(8); // eight
    EXPEDITIONS.forEach((m) => expect(m.stages.map((s) => s.tier)).toEqual([1, 2, 3, 4])); // four tiers
    CATALOGUE.forEach((c) => { expect(c.sourceIds.length).toBeGreaterThan(0); c.sourceIds.forEach((id) => expect(SOURCE_BY_ID[id]).toBeDefined()); }); // sourced
  });
});

describe('AI candidate validator', () => { // group
  const good = { id: 'g1', category: 'Planet', destination: 'mars', difficulty: 'beginner', question: 'Which planet is fourth from the Sun?', options: [{ id: 'a', text: 'Venus' }, { id: 'b', text: 'Mars' }, { id: 'c', text: 'Earth' }, { id: 'd', text: 'Saturn' }], correctOptionId: 'b', explanation: 'Mars is the fourth planet from the Sun.', sourceId: 'nasa-mars', supportingEvidence: 'Mars is the fourth planet from the Sun.', generatedAt: '2026-10-29T00:00:00Z' }; // valid candidate
  it('accepts a grounded candidate', () => { expect(validateCandidates({ questions: [good] }, 'mars', ['nasa-mars'], 1).accepted).toHaveLength(1); }); // accepted
  it('rejects invented sources, unsupported evidence, duplicate options and wrong destinations', () => { // rejections
    const bad = [ // four bad variants
      { ...good, id: 'b1', sourceId: 'https://made-up.example' }, // invented source
      { ...good, id: 'b2', supportingEvidence: 'Mars has rings made of gold and rivers of lava.' }, // unsupported
      { ...good, id: 'b3', options: [{ id: 'a', text: 'Mars' }, { id: 'b', text: 'Mars' }, { id: 'c', text: 'Earth' }, { id: 'd', text: 'Saturn' }] }, // duplicates
      { ...good, id: 'b4', destination: 'venus' }, // wrong destination
    ];
    const r = validateCandidates(bad, 'mars', ['nasa-mars'], 4); // run
    expect(r.accepted).toHaveLength(0); expect(r.rejected).toHaveLength(4); // all rejected
  });
  it('rejects non-JSON-list output', () => { expect(validateCandidates('oops', 'mars', ['nasa-mars'], 5).accepted).toHaveLength(0); }); // invalid
});

describe('ranking order', () => { // group
  it('sorts by km, then accuracy, then shorter active time', () => { // tie-breakers
    const base: Row = { name: '', km: 100, tier: 1, missions: 1, accuracy: 80, activeMs: 1000, label: '' }; // template
    const rows = sortRows([{ ...base, name: 'slow', activeMs: 9000 }, { ...base, name: 'fast' }, { ...base, name: 'acc', accuracy: 90 }, { ...base, name: 'far', km: 350 }]); // mixed
    expect(rows.map((r) => r.name)).toEqual(['far', 'acc', 'fast', 'slow']); // expected order
  });
});
