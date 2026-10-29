// src/components/RankedChallenge.tsx — play a VERIFIED checkpoint: the server picks questions, checks answers and awards km.
import { useState } from 'react'; // React hook
import { rankedStart, rankedAnswer, rankedComplete, type RankedQuestion } from '../engine/connected'; // server calls
import { useGame, activeProfile } from '../engine/store'; // local profile
import { MISSION_BY_ID } from '../data/missions'; // names
import { formatKm } from '../config/rewards'; // formatting

export function RankedChallenge({ onDone }: { onDone: () => void }) { // props: refresh the leaderboard when finished
  const s = useGame(); const p = activeProfile(s); // local profile
  const [att, setAtt] = useState<{ id: string; qs: RankedQuestion[] } | null>(null); // server attempt
  const [i, setI] = useState(0); // current question index
  const [verdict, setVerdict] = useState<{ correct: boolean; correct_option_id: string; explanation: string; chosen: string } | null>(null); // server verdict
  const [score, setScore] = useState(0); // correct so far
  const [msg, setMsg] = useState(''); // status text
  if (!p) return <p>Create a commander first.</p>; // need a profile
  if (s.save.settings.demoMode) return <p className="notice">Demo mode is on. Demo results are never ranked — turn it off in Settings to compete.</p>; // demo excluded
  const options = p.explored; // milestones whose exploration was completed on this device (validated locally — see SCORING_RULES.md)
  const start = async (cid: string) => { setMsg('Starting verified checkpoint…'); try { const r = await rankedStart(cid, p.name); setAtt({ id: r.attempt_id, qs: r.questions }); setI(0); setScore(0); setVerdict(null); setMsg(''); } catch (e) { setMsg((e as Error).message); } }; // begin
  const pick = async (opt: string) => { if (!att || verdict) return; try { const v = await rankedAnswer(att.id, att.qs[i].id, opt); setVerdict({ ...v, chosen: opt }); if (v.correct) setScore(score + 1); } catch (e) { setMsg((e as Error).message); } }; // server checks the answer
  const next = async () => { // continue
    if (!att) return; // safety
    if (i < 4) { setI(i + 1); setVerdict(null); return; } // next question
    try { const r = await rankedComplete(att.id); setMsg(`${r.passed ? 'Clearance granted' : 'Clearance pending'} · ${r.correct}/5 · Verified Space Walk +${formatKm(r.awarded_km)} (total ${formatKm(r.verified_km)})`); } catch (e) { setMsg((e as Error).message); } // server grades + awards once
    setAtt(null); onDone(); // reset + refresh board
  };
  if (!att) return ( // milestone picker
    <div className="card" style={{ flexDirection: 'column' }}> {/* box */}
      <h3>Play a verified checkpoint</h3> {/* heading */}
      <p className="fineprint">No hints in ranked checkpoints. Studying beforehand is allowed. Choose a milestone you have explored:</p> {/* rules */}
      <div className="row wrap">{options.length ? options.map((cid) => <button key={cid} className="chip" onClick={() => start(cid)}>{MISSION_BY_ID[cid.split(':')[0]]?.title} · {cid.split(':')[1].replace('stage', 'Tier ')}</button>) : <span>Explore a stage first.</span>}</div> {/* choices */}
      {msg && <p role="status">{msg}</p>} {/* status */}
    </div>
  );
  const q = att.qs[i]; // current question
  return (
    <div className="card" style={{ flexDirection: 'column' }}> {/* question box */}
      <p className="cat">Verified checkpoint · Question {i + 1}/5 · Score {score}</p> {/* header */}
      <h3>{q.question}</h3> {/* text */}
      <div className="options">{q.options.map((o) => <button key={o.id} disabled={!!verdict} className={`option ${verdict ? (o.id === verdict.correct_option_id ? 'correct' : o.id === verdict.chosen ? 'wrong' : 'dim') : ''}`} onClick={() => pick(o.id)}>{o.id.toUpperCase()}. {o.text}{verdict && o.id === verdict.correct_option_id ? ' ✓' : ''}{verdict && o.id === verdict.chosen && !verdict.correct ? ' ✗' : ''}</button>)}</div> {/* options */}
      {verdict && <><p>{verdict.correct ? '✓ Correct!' : '✗ Not quite.'} {verdict.explanation}</p><button className="btn primary" onClick={next}>{i < 4 ? 'Continue' : 'Submit attempt'}</button></>} {/* feedback */}
      {msg && <p role="status">{msg}</p>} {/* errors */}
    </div>
  );
}
