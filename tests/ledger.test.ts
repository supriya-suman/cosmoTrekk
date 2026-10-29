// tests/ledger.test.ts — Space Walk reward rules (run: npm test)
import { describe, it, expect } from 'vitest'; // test helpers
import { applyCheckpoint, markExplored } from '../src/engine/ledger'; // code under test
import { newProfile, parseSave } from '../src/engine/save'; // profile + save helpers
import type { Avatar } from '../src/types'; // avatar type

const avatar: Avatar = { presentation: 'neutral', skin: '#c68642', suit: '#ff8c1a', visor: '#4fe3ff', helmet: 'round', patch: 'none' }; // sample avatar

describe('Space Walk ledger', () => { // group
  it('every new profile starts at 0 km', () => { expect(newProfile('Asha', avatar).spaceWalkKm).toBe(0); }); // 0 km start
  it('needs BOTH exploration and a passing quiz', () => { // two conditions
    const p = newProfile('Asha', avatar); // fresh profile
    expect(applyCheckpoint(p, 'exp-mars:stage1', 1, 5, false).awardedKm).toBe(0); // quiz alone → no km
    const explored = markExplored(p, 'exp-mars:stage1'); // exploration done
    expect(applyCheckpoint(explored, 'exp-mars:stage1', 1, 2, false).awardedKm).toBe(0); // 2/5 → no km
    expect(applyCheckpoint(explored, 'exp-mars:stage1', 1, 3, false).awardedKm).toBe(100); // 3/5 → 100 km
  });
  it('awards each milestone once — replay and reload cannot farm distance', () => { // idempotency
    let p = markExplored(newProfile('Asha', avatar), 'exp-moon:stage2'); // explored tier 2
    p = applyCheckpoint(p, 'exp-moon:stage2', 2, 4, false).profile; // first pass → 250
    const again = applyCheckpoint(p, 'exp-moon:stage2', 2, 5, false); // replay with 5/5
    expect(again.awardedKm).toBe(0); expect(again.profile.spaceWalkKm).toBe(250); // no extra km
    expect(again.profile.bestScores['exp-moon:stage2']).toBe(5); // but best score improves
    const reloaded = parseSave(JSON.stringify({ version: 2, profiles: [{ ...again.profile, spaceWalkKm: 999999 }], activeProfileId: again.profile.id, settings: { master: true, music: 1, sfx: 1, narration: false, breathing: false, reducedMotion: false, timedQuiz: false, demoMode: false } })); // tampered total
    expect(reloaded.save.profiles[0].spaceWalkKm).toBe(250); // total rebuilt from ledger
  });
  it('same reward schedule for every category; a full expedition = 1,850 km', () => { // fairness
    for (const m of ['exp-sun', 'exp-station']) { // two very different "distances"
      let p = newProfile('Ravi', avatar); // fresh
      for (const t of [1, 2, 3, 4] as const) { const id = `${m}:stage${t}`; p = applyCheckpoint(markExplored(p, id), id, t, 3, false).profile; } // clear all tiers
      expect(p.spaceWalkKm).toBe(1850); // identical total
    }
  });
  it('corrupt save is recovered safely', () => { expect(parseSave('{broken').recovered).toBe(true); }); // recovery
});
