// src/screens/Briefing.tsx — campaign launch checklist + 10-second countdown, and the immersive destination briefing.
import { useEffect, useState } from 'react'; // React hooks
import { useGame, activeProfile, go, beginExploration, launchComplete, startQuiz, openStudy } from '../engine/store'; // actions
import { MISSION_BY_ID, completionId } from '../data/missions'; // missions
import { BRIEFINGS } from '../data/briefings'; // briefing content
import { SOURCE_BY_ID } from '../data/sources'; // source links
import { DestinationPreview, Diagram, Rocket } from '../components/Art'; // art
import { sfx, speak, stopSpeaking } from '../audio/audio'; // sound + narration
import type { Tier } from '../types'; // type

export function LaunchScreen() { // pre-launch checklist (campaign levels only)
  const s = useGame(); const run = s.run!; // current run
  const stage = MISSION_BY_ID[run.missionId].stages[run.tier - 1]; // current stage
  const launch = stage.launch!; // launch info (from → to, module)
  const p = activeProfile(s); // profile
  const prevCleared = run.tier === 1 || !!p?.ledger.some((e) => e.completionId === completionId(run.missionId, (run.tier - 1) as Tier)); // knowledge clearance from the previous level
  const [checks, setChecks] = useState({ fuel: false, suit: false, module: false }); // equipment checklist
  const [count, setCount] = useState<number | null>(null); // countdown value (null = not started)
  const ready = prevCleared && checks.fuel && checks.suit && checks.module; // BOTH equipment and knowledge required
  useEffect(() => { sfx.radio(); }, []); // radio blip when the screen opens
  useEffect(() => { // countdown timer
    if (count === null) return; // not started
    if (count === 0) { sfx.launch(); const t = setTimeout(launchComplete, s.save.settings.reducedMotion ? 300 : 1800); return () => clearTimeout(t); } // lift-off → briefing
    if (s.paused) return; // countdown waits while paused
    sfx.countdown(); const t = setTimeout(() => setCount(count - 1), 1000); return () => clearTimeout(t); // tick every second
  }, [count, s.paused, s.save.settings.reducedMotion]); // re-run each tick
  const tick = (k: keyof typeof checks) => <label className="check"><input type="checkbox" checked={checks[k]} disabled={count !== null} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} /> {{ fuel: 'Fuel loaded', suit: 'Suit sealed & oxygen full', module: launch.module }[k]}</label>; // one checklist item
  return (
    <main className={`page launch ${count === 0 ? 'liftoff' : ''}`}> {/* page (lift-off animation class) */}
      <h2>Launch: {launch.from} → {launch.to}</h2> {/* route */}
      <p className="radio">📡 {stage.storyIntro}</p> {/* mission-control message */}
      <div className="launch-grid"> {/* rocket + checklist */}
        <div className="launch-rocket"><Rocket size={180} /></div> {/* rocket */}
        <div> {/* checklist */}
          <h3>Pre-launch checklist</h3>
          {run.tier === 1 && <p className="fineprint">Earth is your tutorial launch hub. Tick each item, then confirm launch.</p>} {/* tutorial note */}
          {tick('fuel')}{tick('suit')}{tick('module')} {/* equipment */}
          <p className={prevCleared ? 'ok' : 'warn'}>{prevCleared ? '✓ Knowledge clearance: granted' : '✗ Knowledge clearance: clear the previous level’s checkpoint first'}</p> {/* knowledge */}
          {count === null // before countdown
            ? <button className="btn primary" disabled={!ready} onClick={() => setCount(10)}>Confirm launch (10-second countdown)</button> // explicit confirmation
            : <div className="countdown" aria-live="assertive">{count > 0 ? count : 'Lift-off!'}{count > 0 && <button className="btn small" onClick={() => setCount(null)}>Abort</button>}</div>} {/* countdown + abort */}
          <p className="fiction">Simulation Fiction: a story itinerary — not the physical order of planets or a real trajectory.</p> {/* honesty */}
        </div>
      </div>
      <button className="btn" onClick={() => go('map')}>Back to Mission Map</button> {/* back */}
    </main>
  );
}

export function BriefingScreen() { // immersive overlay before every destination (gameplay paused — no scene is running here)
  const s = useGame(); const run = s.run!; // current run
  const m = MISSION_BY_ID[run.missionId]; const stage = m.stages[run.tier - 1]; // mission + stage
  const b = BRIEFINGS[stage.destinationId]; // briefing content
  const p = activeProfile(s); // profile
  const explored = !!p?.explored.includes(completionId(m.id, run.tier)); // exploration already done (kept after a failed quiz)
  const chapterOne = m.id === 'campaign' && run.tier === 2; // arrival on Mars
  useEffect(() => () => stopSpeaking(), []); // stop narration when leaving
  const narration = `${b.name}. ${b.category}. ${b.location}. ${b.facts.map((f) => `${f.label}: ${f.value}`).join('. ')}. Mission objective: ${stage.objective}`; // text read aloud (also shown on screen)
  return (
    <main className="briefing" aria-labelledby="brief-title"> {/* overlay */}
      <div className="brief-hero"> {/* big preview */}
        <DestinationPreview theme={b.theme} size={240} /> {/* art */}
        <div>
          <p className="cat">{m.title} · Tier {run.tier}: {stage.title}</p> {/* context */}
          <h2 id="brief-title">{b.name}</h2><p className="cat">{b.category}</p> {/* name + category */}
          {chapterOne && <p className="gold">🔴 Chapter One Complete — welcome to Mars! The story continues.</p>} {/* chapter marker */}
          {stage.destinationId !== 'earth' && m.mode === 'expedition' && run.tier === 1 && stage.destinationId !== 'moon' && <p className="radio">Training simulation initialized at your selected destination.</p>} {/* non-Earth start message */}
          {b.fictionNote && <p className="fiction">{b.fictionNote}</p>} {/* fiction label */}
          <p className="objective">🎯 Mission objective: {stage.objective}</p> {/* objective */}
        </div>
      </div>
      <div className="brief-grid"> {/* facts + diagram */}
        <div>
          <h3>Science Fact</h3> {/* label */}
          <table className="facts"><tbody>{[{ label: 'Location', value: b.location }, ...b.facts].map((f) => <tr key={f.label}><th>{f.label}</th><td>{f.value}</td></tr>)}</tbody></table> {/* fact table */}
          <p className="fineprint">Real distances are approximate and name their reference point. Your Space Walk km is game distance and is separate.</p> {/* units note */}
        </div>
        <div><Diagram b={b} /> {/* labelled diagram */}
          <h3>Recommended equipment</h3><ul>{b.equipment.map((e) => <li key={e}>{e}</li>)}</ul> {/* gear */}
          <h3>Remember</h3><ul>{b.memorable.map((f) => <li key={f}>{f}</li>)}</ul> {/* facts */}
          <p className="sources">Sources: {b.sourceIds.map((id) => <a key={id} href={SOURCE_BY_ID[id]?.url} target="_blank" rel="noreferrer">{SOURCE_BY_ID[id]?.title}</a>)}</p> {/* links */}
        </div>
      </div>
      <div className="row wrap sticky-actions"> {/* buttons */}
        <button className="btn primary" onClick={() => { stopSpeaking(); beginExploration(); }}>{explored ? 'Replay Exploration' : 'Begin Mission'}</button> {/* start */}
        {explored && <button className="btn primary" onClick={startQuiz}>Go to Checkpoint (exploration done ✓)</button>} {/* skip to quiz after failure */}
        <button className="btn" onClick={() => speak(narration, true)}>🔊 Listen to Briefing</button> {/* narration */}
        <button className="btn" onClick={() => openStudy(stage.destinationId === 'satellite' ? 'satellite' : stage.destinationId)}>Open Know Your Space</button> {/* study */}
        <button className="btn" onClick={() => go('map')}>Back</button> {/* back */}
      </div>
    </main>
  );
}
