// src/screens/Profile.tsx — astronaut creation (with live preview) and the profile page.
import { useState } from 'react'; // local form state
import type { Avatar } from '../types'; // avatar type
import { AvatarView, SKIN_TONES, SUIT_COLOURS, VISOR_COLOURS, randomAvatar } from '../components/Avatar'; // avatar art + options
import { createProfile, go, useGame, activeProfile, updateAvatar, selectProfile, deleteProfile } from '../engine/store'; // actions
import { SpaceWalkChip } from '../components/Hud'; // Space Walk badge
import { formatKm, nextMilestone, rankFor } from '../config/rewards'; // rank helpers
import { quizAccuracy } from '../engine/ledger'; // accuracy
import { MISSION_BY_ID } from '../data/missions'; // mission names for history

function Swatches({ label, values, value, onPick }: { label: string; values: string[]; value: string; onPick: (v: string) => void }) { // a row of colour buttons
  return (
    <fieldset className="swatches"><legend>{label}</legend> {/* grouped for screen readers */}
      {values.map((v, i) => <button key={v} type="button" className={`swatch ${v === value ? 'on' : ''}`} style={{ background: v }} aria-label={`${label} option ${i + 1}`} aria-pressed={v === value} onClick={() => onPick(v)} />)} {/* each colour */}
    </fieldset>
  );
}

export function AvatarEditor({ a, set }: { a: Avatar; set: (a: Avatar) => void }) { // shared editor (create + edit)
  const opt = <K extends keyof Avatar>(k: K, list: readonly Avatar[K][], label: string) => ( // text choice buttons
    <fieldset className="choices"><legend>{label}</legend>{list.map((v) => <button key={String(v)} type="button" className={`chip ${a[k] === v ? 'on' : ''}`} aria-pressed={a[k] === v} onClick={() => set({ ...a, [k]: v })}>{String(v)}</button>)}</fieldset> // one button per option
  );
  return (
    <div className="avatar-editor"> {/* layout: preview + options */}
      <div className="avatar-preview"><AvatarView a={a} size={170} /><button type="button" className="btn small" onClick={() => set(randomAvatar())}>🎲 Randomize Astronaut</button></div> {/* live preview */}
      <div className="avatar-options"> {/* the options */}
        {opt('presentation', ['girl', 'boy', 'neutral'], 'Presentation')} {/* body style */}
        <Swatches label="Skin tone" values={SKIN_TONES} value={a.skin} onPick={(skin) => set({ ...a, skin })} /> {/* skin */}
        <Swatches label="Spacesuit colour" values={SUIT_COLOURS} value={a.suit} onPick={(suit) => set({ ...a, suit })} /> {/* suit */}
        <Swatches label="Visor tint" values={VISOR_COLOURS} value={a.visor} onPick={(visor) => set({ ...a, visor })} /> {/* visor */}
        {opt('helmet', ['round', 'sleek'], 'Helmet')} {/* helmet */}
        {opt('patch', ['none', 'star', 'planet', 'rocket'], 'Mission patch (optional)')} {/* patch */}
        <p className="fineprint">All looks give identical abilities.</p> {/* fairness note */}
      </div>
    </div>
  );
}

export function CreateProfile() { // "Start Journey" screen
  const [name, setName] = useState(''); // commander name
  const [a, setA] = useState<Avatar>({ presentation: 'neutral', skin: SKIN_TONES[2], suit: SUIT_COLOURS[0], visor: VISOR_COLOURS[0], helmet: 'round', patch: 'star' }); // default look
  const trimmed = name.trim(); // ignore spaces at the ends
  const valid = trimmed.length >= 2 && trimmed.length <= 20; // 2–20 characters
  return (
    <main className="page"> {/* page */}
      <h2>Create Your Astronaut</h2> {/* heading */}
      <label className="field">Commander name (2–20 characters) {/* label */}
        <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nova" aria-invalid={!valid && name.length > 0} /> {/* input */}
      </label>
      <p className="fineprint">No real name, email or birthday needed. Your profile stays on this device.</p> {/* privacy */}
      <AvatarEditor a={a} set={setA} /> {/* customisation */}
      <div className="row"><button className="btn" onClick={() => go('title')}>Back</button><button className="btn primary" disabled={!valid} onClick={() => createProfile(trimmed, a)}>Launch Profile — Space Walk starts at 0 km</button></div> {/* actions */}
    </main>
  );
}

const BADGE_NAMES: Record<string, string> = { 'first-clearance': '🎖 First Clearance', 'perfect-checkpoint': '⭐ Perfect 5/5', 'chapter-one': '🔴 Chapter One Complete', 'ring-guardian': '🪐 Ring Guardian', scholar: '📚 Scholar' }; // badge labels

export function ProfileView() { // the profile page
  const s = useGame(); const p = activeProfile(s); // current commander
  if (!p) return <main className="page"><p>No commander selected.</p><button className="btn" onClick={() => go('create')}>Create one</button></main>; // fallback
  const next = nextMilestone(p.spaceWalkKm); // next rank
  return (
    <main className="page"> {/* page */}
      <h2>Commander {p.name}</h2> {/* name */}
      <SpaceWalkChip km={p.spaceWalkKm} /> {/* metric */}
      <div className="stats"> {/* stats grid */}
        <div><b>Rank</b>{rankFor(p.spaceWalkKm)}</div> {/* rank */}
        <div><b>Next milestone</b>{next ? `${next.title} at ${formatKm(next.km)}` : 'Top rank reached'}</div> {/* next */}
        <div><b>Quiz accuracy</b>{quizAccuracy(p)}%</div> {/* accuracy */}
        <div><b>Milestones cleared</b>{p.ledger.length}</div> {/* clearances */}
        <div><b>Active play time</b>{Math.round(p.activeMs / 60000)} min</div> {/* time */}
        <div><b>Upgrades</b>O₂ {p.upgrades.oxygen} · Suit {p.upgrades.suit} · Thrusters {p.upgrades.thrusters}</div> {/* upgrades */}
      </div>
      <h3>Badges</h3><p>{p.badges.length ? p.badges.map((b) => BADGE_NAMES[b] ?? `🏁 ${MISSION_BY_ID[b.replace('expedition-', '')]?.title ?? b}`).join(' · ') : 'None yet — clear a checkpoint!'}</p> {/* badges */}
      {p.starMap && <p className="fiction">🗺 Horizon Star Map discovered (Simulation Fiction).</p>} {/* star map */}
      <h3>Mission history</h3> {/* history */}
      <ul className="history">{p.ledger.slice().reverse().map((e) => <li key={e.completionId}>{MISSION_BY_ID[e.completionId.split(':')[0]]?.title} · {e.completionId.split(':')[1].replace('stage', 'Tier ')} · +{formatKm(e.km)}{e.demo ? ' (demo mode)' : ''}</li>)}</ul> {/* rewards list */}
      <h3>Edit appearance</h3><AvatarEditor a={p.avatar} set={updateAvatar} /> {/* edit cosmetics (saved) */}
      <h3>Profiles on this device</h3> {/* switch profile */}
      <div className="row wrap">{s.save.profiles.map((x) => <button key={x.id} className={`chip ${x.id === p.id ? 'on' : ''}`} onClick={() => selectProfile(x.id)}>{x.name}</button>)}<button className="chip" onClick={() => go('create')}>+ New</button></div> {/* list */}
      <div className="row"><button className="btn" onClick={() => go('map')}>Mission Map</button><button className="btn danger" onClick={() => { if (window.confirm(`Delete ${p.name} from this device?`)) deleteProfile(p.id); }}>Delete profile</button></div> {/* actions */}
    </main>
  );
}
