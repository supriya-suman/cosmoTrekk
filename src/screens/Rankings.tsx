// src/screens/Rankings.tsx — Space Walk Rankings: local (on this device) + clearly labelled demo players + optional verified board.
import { useEffect, useState } from 'react'; // React hooks
import { useGame, back } from '../engine/store'; // state
import { quizAccuracy } from '../engine/ledger'; // accuracy
import { formatKm } from '../config/rewards'; // formatting
import { AvatarView } from '../components/Avatar'; // avatars
import type { Avatar, Profile } from '../types'; // types
import { RankedChallenge } from '../components/RankedChallenge'; // verified checkpoint player
import { connectedAvailable } from '../engine/connected'; // is connected mode configured?

export interface Row { name: string; avatar?: Avatar; km: number; tier: number; missions: number; accuracy: number; activeMs: number; label: string } // one ranking row

export function sortRows(rows: Row[]): Row[] { // ranking rule: km ↓, then accuracy ↓, then active time ↑
  return [...rows].sort((a, b) => b.km - a.km || b.accuracy - a.accuracy || a.activeMs - b.activeMs); // compare in order
}

function rowFor(p: Profile): Row { // turn a local profile into a row
  const highest = Math.max(0, ...p.ledger.map((e) => Number(e.completionId.split('stage')[1]) || 0)); // highest completed tier
  return { name: p.name, avatar: p.avatar, km: p.spaceWalkKm, tier: highest, missions: p.ledger.length, accuracy: quizAccuracy(p), activeMs: p.activeMs, label: p.usedDemoMode ? 'On this device · used demo mode' : 'On this device' }; // row
}

const DEMO: Row[] = [ // sample competitors — clearly labelled, never presented as real
  { name: 'Nova (demo)', km: 1850, tier: 4, missions: 4, accuracy: 85, activeMs: 1_500_000, label: 'Demo player' }, // demo 1
  { name: 'Orion (demo)', km: 850, tier: 3, missions: 3, accuracy: 73, activeMs: 1_100_000, label: 'Demo player' }, // demo 2
  { name: 'Lyra (demo)', km: 350, tier: 2, missions: 2, accuracy: 90, activeMs: 600_000, label: 'Demo player' }, // demo 3
];

export function RankingsScreen() { // the rankings page
  const s = useGame(); // state
  const [tab, setTab] = useState<'local' | 'verified'>('local'); // which board
  const [verified, setVerified] = useState<{ status: string; rows: Row[] }>({ status: 'Not loaded', rows: [] }); // connected board
  const connected = connectedAvailable; // connected competition configured?
  const [reload, setReload] = useState(0); // bump to refresh the verified board
  useEffect(() => { // load the verified board on demand
    if (tab !== 'verified' || !connected) return; // only when needed
    fetch('/api/ranked/leaderboard').then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => setVerified({ status: 'Verified by server', rows: j.rows ?? [] })).catch(() => setVerified({ status: 'Unavailable right now (offline or not configured)', rows: [] })); // fetch with honest fallback
  }, [tab, connected, reload]); // dependencies
  const rows = tab === 'local' ? sortRows([...s.save.profiles.map(rowFor), ...DEMO]) : sortRows(verified.rows); // rows to show
  return (
    <main className="page"> {/* page */}
      <header className="row wrap"><h2>Space Walk Rankings</h2><button className="btn small" onClick={back}>Back</button></header> {/* header */}
      <div className="row wrap" role="tablist"> {/* tabs */}
        <button role="tab" aria-selected={tab === 'local'} className={`chip ${tab === 'local' ? 'on' : ''}`} onClick={() => setTab('local')}>On this device</button> {/* local */}
        <button role="tab" aria-selected={tab === 'verified'} className={`chip ${tab === 'verified' ? 'on' : ''}`} onClick={() => setTab('verified')}>Verified (connected)</button> {/* verified */}
      </div>
      {tab === 'local' ? <p className="fineprint">Local results are NOT verified global scores. "Demo players" are samples for presentation.</p> : <p className="fineprint">{connected ? `Status: ${verified.status}. Scores are recorded by the server, but no browser game is cheat-proof.` : 'Connected competition is optional and not configured on this deployment (see API_SETUP.md). The full game works without it.'}</p>} {/* honest labels */}
      {tab === 'verified' && connected && <RankedChallenge onDone={() => setReload(reload + 1)} />} {/* verified play */}
      <p className="fineprint">Ranking: Space Walk ↓, then accuracy ↓, then active completion time ↑. Same rewards for every category; no idle or distance-selection rewards.</p> {/* rules */}
      {/* ranking table */}
      <div className="table-wrap"><table className="rank-table">
        <thead><tr><th>#</th><th>Commander</th><th>Space Walk</th><th>Top tier</th><th>Milestones</th><th>Accuracy</th><th>Label</th></tr></thead> {/* headings */}
        <tbody>{rows.map((r, i) => <tr key={r.name + i}><td>{i + 1}</td><td className="who">{r.avatar ? <AvatarView a={r.avatar} size={28} /> : <span aria-hidden="true">👩‍🚀</span>} {r.name}</td><td>{formatKm(r.km)}</td><td>{r.tier}</td><td>{r.missions}</td><td>{r.accuracy}%</td><td><small>{r.label}</small></td></tr>)}</tbody> {/* rows */}
      </table></div>
    </main>
  );
}
