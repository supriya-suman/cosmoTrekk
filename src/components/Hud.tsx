// src/components/Hud.tsx — Space Walk chip, resource HUD, touch controls and readiness meter.
import { useRef } from 'react'; // React hook for remembering values between renders
import { formatKm, rankFor, SPACE_WALK_TOOLTIP } from '../config/rewards'; // formatting + tooltip text
import type { HudData } from '../game/bridge'; // HUD data type
import { virtualInput } from '../game/bridge'; // shared touch input
import type { QuizAttempt } from '../engine/quiz'; // quiz type
import { isCorrect, readinessPercent } from '../engine/quiz'; // quiz helpers

export function SpaceWalkChip({ km }: { km: number }) { // the prominent "Space Walk · 1,000 km" badge
  return (
    <div className="spacewalk" title={SPACE_WALK_TOOLTIP} aria-label={`Space Walk ${formatKm(km)}. ${SPACE_WALK_TOOLTIP}`} tabIndex={0}> {/* tooltip on hover and focus */}
      <span className="sw-label">Space Walk</span> <span aria-hidden="true">·</span> <strong>{formatKm(km)}</strong> {/* the metric */}
      <span className="sw-rank">{rankFor(km)}</span> {/* current fictional rank */}
    </div>
  );
}

function Bar({ label, value, icon }: { label: string; value: number; icon: string }) { // one resource bar
  const low = value < 25; // warn when below 25%
  return (
    <div className={`bar ${low ? 'low' : ''}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}> {/* accessible meter */}
      <span className="bar-label"><span aria-hidden="true">{icon}</span> {label}</span> {/* name (with small symbol) */}
      <span className="bar-track"><span className="bar-fill" style={{ width: `${value}%` }} /></span> {/* coloured fill */}
      <span className="bar-num">{Math.round(value)}%{low ? ' ⚠' : ''}</span> {/* number + warning symbol (not colour only) */}
    </div>
  );
}

export function ResourceHud({ hud }: { hud: HudData }) { // oxygen, fuel, health, suit, modules, objective
  return (
    <div className="hud-resources"> {/* group */}
      <Bar label="Oxygen" value={hud.oxygen} icon="O₂" /> {/* oxygen */}
      <Bar label="Fuel" value={hud.fuel} icon="⛽" /> {/* fuel */}
      <Bar label="Health" value={hud.health} icon="✚" /> {/* health */}
      <Bar label="Suit" value={hud.suit} icon="⛨" /> {/* suit integrity */}
      <div className="modules">Modules: <strong>{hud.collected}/{hud.needed}</strong></div> {/* repair modules collected */}
    </div>
  );
}

export function TouchControls() { // on-screen joystick for phones and tablets
  const active = useRef<string | null>(null); // which direction is held
  const press = (x: number, y: number, id: string) => (e: React.PointerEvent) => { e.preventDefault(); active.current = id; virtualInput.x = x; virtualInput.y = y; }; // start moving
  const release = () => { active.current = null; virtualInput.x = 0; virtualInput.y = 0; }; // stop moving
  const btn = (label: string, x: number, y: number, cls: string) => ( // one direction button
    <button className={`dpad ${cls}`} aria-label={`Move ${cls}`} onPointerDown={press(x, y, cls)} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}>{label}</button> // pointer events work for touch and mouse
  );
  return (
    <div className="touch-controls" aria-hidden="false"> {/* container (visible on touch screens via CSS) */}
      <div className="dpad-grid">{btn('▲', 0, -1, 'up')}{btn('◀', -1, 0, 'left')}{btn('▶', 1, 0, 'right')}{btn('▼', 0, 1, 'down')}</div> {/* four directions */}
      <button className="interact-btn" aria-label="Interact" onPointerDown={(e) => { e.preventDefault(); virtualInput.interact = true; }}>✋<span>Interact</span></button> {/* big interact button */}
    </div>
  );
}

export function ReadinessMeter({ att }: { att: QuizAttempt }) { // five indicators + readiness percent
  const pct = readinessPercent(att); // current correct-answer percentage
  return (
    <div className="readiness" aria-label={`Readiness ${pct} percent`}> {/* vertical on desktop, horizontal on mobile (CSS) */}
      <div className="readiness-title">Readiness</div> {/* heading */}
      <div className="readiness-dots"> {/* five numbered indicators */}
        {att.questions.map((_, i) => { const r = isCorrect(att, i); return ( // r = true / false / null
          <div key={i} className={`dot ${r === true ? 'ok' : r === false ? 'bad' : ''} ${i === att.index ? 'current' : ''}`} aria-label={`Question ${i + 1}: ${r === true ? 'correct' : r === false ? 'incorrect' : 'unanswered'}`}> {/* colour + symbol */}
            <span>{i + 1}</span><b aria-hidden="true">{r === true ? '✓' : r === false ? '✗' : ''}</b> {/* number + tick/cross */}
          </div> ); })}
      </div>
      <div className="readiness-fill"><span style={{ height: `${pct}%`, width: `${pct}%` }} /><i className="pass-line" title="60% clearance line" /></div> {/* meter with 60% line */}
      <div className="readiness-pct"><strong>{pct}%</strong></div> {/* number */}
      <div className="readiness-note">3 correct answers required for clearance.</div> {/* required text */}
    </div>
  );
}
