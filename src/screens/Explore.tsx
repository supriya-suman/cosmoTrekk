// src/screens/Explore.tsx — the exploration screen: Phaser canvas + React HUD, pause menu, puzzle, depletion.
import { useEffect, useMemo, useState } from 'react'; // React hooks
import { PhaserGame } from '../game/PhaserGame'; // Phaser host
import { bridge, type HudData } from '../game/bridge'; // React ⇄ Phaser messages
import { useGame, activeProfile, explorationComplete, go, setPaused, restartActivity, openStudy, updateSettings } from '../engine/store'; // actions
import { MISSION_BY_ID } from '../data/missions'; // missions
import { ResourceHud, SpaceWalkChip, TouchControls } from '../components/Hud'; // HUD widgets
import { sfx } from '../audio/audio'; // sounds

function EnergyPuzzle({ onSolve }: { onSolve: () => void }) { // Saturn station energy-routing puzzle
  const goal = [2, 0, 3]; // target direction for each of the three conduits (0–3 = up/right/down/left)
  const [rot, setRot] = useState([0, 1, 1]); // current directions
  const solved = rot.every((r, i) => r === goal[i]); // all match?
  useEffect(() => { if (solved) { sfx.interact(); const t = setTimeout(onSolve, 700); return () => clearTimeout(t); } }, [solved, onSolve]); // finish after a moment
  const arrows = ['↑', '→', '↓', '←']; // symbols
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pz"> {/* modal dialog */}
      <h3 id="pz">Energy Routing</h3> {/* title */}
      <p>Rotate each conduit so power flows: Reactor → <b>Life support</b> (↓), <b>Comms</b> (↑), <b>Shields</b> (←). Life support first!</p> {/* instructions */}
      <div className="row">{['Comms', 'Life support', 'Shields'].map((n, i) => ( // three conduits
        <button key={n} className={`conduit ${rot[i] === goal[i] ? 'ok' : ''}`} onClick={() => { sfx.click(); setRot(rot.map((r, j) => (j === i ? (r + 1) % 4 : r))); }} aria-label={`${n} conduit pointing ${['up', 'right', 'down', 'left'][rot[i]]}${rot[i] === goal[i] ? ', correct' : ''}`}> {/* rotate on click */}
          <span className="arrow">{arrows[rot[i]]}</span>{n}{rot[i] === goal[i] ? ' ✓' : ''} {/* display */}
        </button>))}
      </div>
      {solved && <p className="ok" role="status">Power restored ✓</p>} {/* success text */}
    </div>
  );
}

export function ExploreScreen() { // main gameplay screen
  const s = useGame(); const run = s.run!; const p = activeProfile(s)!; // state
  const m = MISSION_BY_ID[run.missionId]; const stage = m.stages[run.tier - 1]; // mission + stage
  const [hud, setHud] = useState<HudData>({ oxygen: 100, fuel: 100, health: 100, suit: 100, collected: 0, needed: stage.collectible.count, objective: stage.objective, prompt: '' }); // HUD state
  const [hint, setHint] = useState(''); // latest mission-control message
  const [puzzle, setPuzzle] = useState(false); // puzzle open?
  const [depleted, setDepleted] = useState<string | null>(null); // failure reason
  const settings = s.save.settings; // settings
  const data = useMemo(() => ({ stage, suit: p.avatar.suit, visor: p.avatar.visor, upgrades: p.upgrades, demo: settings.demoMode, reducedMotion: settings.reducedMotion, tutorial: p.ledger.length === 0 && run.tier === 1 }), // scene config…
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [run.missionId, run.tier]); // …rebuilt only when the stage changes (prevents scene restarts on every render)
  useEffect(() => { // subscribe to Phaser messages
    const offs = [ // list of unsubscribe functions
      bridge.on('hud', setHud), // HUD numbers
      bridge.on('hint', (h) => { setHint(h); sfx.radio(); }), // messages with radio blip
      bridge.on('puzzle', () => setPuzzle(true)), // open puzzle
      bridge.on('exploration-complete', () => explorationComplete()), // go to the quiz
      bridge.on('depleted', (r) => setDepleted(r)), // resource ran out
      bridge.on('esc', () => setPaused(true)), // Escape → pause
      bridge.on('sfx', (k) => sfx[k]()), // play sounds
    ];
    return () => offs.forEach((o) => o()); // clean up on leave
  }, []); // once
  useEffect(() => { bridge.emit(s.paused || puzzle || depleted ? 'pause' : 'resume', null); }, [s.paused, puzzle, depleted]); // overlays freeze the scene (timers + depletion stop)
  return (
    <div className="explore"> {/* full screen */}
      <PhaserGame data={data} /> {/* the canvas */}
      <header className="hud-top"> {/* top HUD */}
        <SpaceWalkChip km={p.spaceWalkKm} /> {/* Space Walk is always visible */}
        <div className="objective-box"><b>Tier {run.tier} · {stage.title}</b><span>{hud.objective}</span></div> {/* current objective */}
        <div className="row"><button className="btn small" aria-label={settings.master ? 'Mute sound' : 'Unmute sound'} onClick={() => updateSettings({ master: !settings.master })}>{settings.master ? '🔊' : '🔇'}</button><button className="btn small" onClick={() => setPaused(true)}>⏸ Pause</button></div> {/* sound + pause */}
      </header>
      <ResourceHud hud={hud} /> {/* resource bars */}
      {hud.prompt && <div className="prompt" role="status">{hud.prompt}</div>} {/* interaction prompt */}
      {hint && <div className="hint" role="status" aria-live="polite">📡 {hint}</div>} {/* mission control text */}
      {settings.demoMode && <div className="demo-tag">DEMO MODE</div>} {/* demo label */}
      <TouchControls /> {/* mobile controls */}
      {s.paused && ( // pause menu
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pause-t"> {/* dialog */}
          <h3 id="pause-t">Paused</h3><p>Oxygen and timers are frozen.</p> {/* info */}
          <div className="col"><button className="btn primary" autoFocus onClick={() => setPaused(false)}>Resume</button><button className="btn" onClick={() => { setPaused(false); restartActivity(); }}>Restart activity</button><button className="btn" onClick={() => openStudy(stage.destinationId)}>Know Your Space</button><button className="btn" onClick={() => go('settings')}>Settings</button><button className="btn" onClick={() => go('map')}>Mission Map</button></div> {/* options */}
        </div>
      )}
      {puzzle && <EnergyPuzzle onSolve={() => { setPuzzle(false); bridge.emit('puzzle-solved', null); }} />} {/* puzzle */}
      {depleted && ( // failure dialog (friendly)
        <div className="modal" role="alertdialog" aria-modal="true"> {/* dialog */}
          <h3>{depleted}</h3><p>Mission Control pulled you back to safety. Your campaign and Space Walk are safe — let’s try that activity again.</p> {/* encouraging */}
          <button className="btn primary" onClick={() => { setDepleted(null); restartActivity(); }}>Restart activity</button> {/* retry */}
        </div>
      )}
    </div>
  );
}
