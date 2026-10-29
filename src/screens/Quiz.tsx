// src/screens/Quiz.tsx — the five-question checkpoint, the results screen, and the expedition summary.
import { useEffect, useState } from 'react'; // React hooks
import { useGame, activeProfile, answer, nextQuestion, startQuiz, go, openStudy, continueAfterResults, chooseUpgrade, startStage } from '../engine/store'; // actions
import { isCorrect, type OptionId } from '../engine/quiz'; // helpers
import { ReadinessMeter, SpaceWalkChip } from '../components/Hud'; // widgets
import { sourceUrl } from '../data/sources'; // links
import { MISSION_BY_ID, EXPEDITIONS, completionId } from '../data/missions'; // missions
import { formatKm, nextMilestone, rankFor, TIER_REWARD_KM } from '../config/rewards'; // numbers
import { AvatarView } from '../components/Avatar'; // avatar
import { sfx } from '../audio/audio'; // sounds
import { quizAccuracy } from '../engine/ledger'; // accuracy
import type { Tier } from '../types'; // type
import { QUESTIONS } from '../data/questions'; // question bank (for Review Answers)

export function QuizScreen() { // one question at a time
  const s = useGame(); const att = s.quiz; // current attempt
  const [timeLeft, setTimeLeft] = useState(45); // optional timer (off by default)
  const q = att?.questions[att.index]; // current question
  const chosen = att ? att.answers[att.index] : null; // locked answer (if any)
  useEffect(() => { setTimeLeft(45); }, [att?.index]); // reset timer per question
  useEffect(() => { // optional timed mode
    if (!s.save.settings.timedQuiz || chosen || !q || s.paused) return; // untimed, answered or paused → no timer
    if (timeLeft <= 0) { const wrong = q.options.find((o) => o.id !== q.correctOptionId)!.id; answer(wrong); sfx.wrong(); return; } // time out counts as incorrect
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); // tick
  }, [timeLeft, chosen, q, s.save.settings.timedQuiz, s.paused]); // dependencies
  if (!att || !q) return <main className="page"><p>No checkpoint in progress.</p><button className="btn" onClick={() => go('map')}>Mission Map</button></main>; // fallback
  const pick = (id: OptionId) => { if (chosen) return; answer(id); if (id === q.correctOptionId) sfx.correct(); else sfx.wrong(); }; // lock + feedback sound
  const right = isCorrect(att, att.index); // result of this question
  const roleLabel = { fact: 'Knowledge', understanding: 'Understanding', decision: 'Mission decision' }[q.role]; // question type label
  return (
    <main className="quiz"> {/* layout: meter + question */}
      <ReadinessMeter att={att} /> {/* readiness meter */}
      <section className="question-card" aria-live="polite"> {/* question area */}
        <p className="cat">Checkpoint · Question {att.index + 1} of 5 · {roleLabel} · {q.difficulty}{s.save.settings.timedQuiz && !chosen ? ` · ⏱ ${timeLeft}s` : ''}</p> {/* context */}
        <h2>{q.question}</h2> {/* question */}
        <div className="options" role="radiogroup" aria-label="Answer options"> {/* four options */}
          {q.options.map((o) => { // each option
            const state = !chosen ? '' : o.id === q.correctOptionId ? 'correct' : o.id === chosen ? 'wrong' : 'dim'; // colour state after locking
            return <button key={o.id} role="radio" aria-checked={chosen === o.id} disabled={!!chosen} className={`option ${state}`} onClick={() => pick(o.id)}> {/* option button */}
              <span className="opt-id">{o.id.toUpperCase()}</span> {o.text} {state === 'correct' && <b> ✓ Correct answer</b>}{state === 'wrong' && <b> ✗ Your answer</b>} {/* text + symbols */}
            </button>;
          })}
        </div>
        {chosen && ( // feedback after locking
          <div className={`feedback ${right ? 'ok' : 'bad'}`} role="status"> {/* feedback box */}
            <p><b>{right ? '✓ Correct!' : '✗ Not quite.'}</b> {q.explanation}</p> {/* explanation */}
            <p className="fineprint"><a href={sourceUrl(q.sourceId)} target="_blank" rel="noreferrer">Source</a>{!right && <> · <button className="linklike" onClick={() => openStudy(q.lessonId)}>Study this in Know Your Space</button></>}</p> {/* source + lesson link */}
            <button className="btn primary" autoFocus onClick={() => { sfx.click(); nextQuestion(); }}>{att.index < 4 ? 'Continue' : 'See result'}</button> {/* waits for Continue */}
          </div>
        )}
      </section>
    </main>
  );
}

export function ResultsScreen() { // after five answers
  const s = useGame(); const r = s.result; const p = activeProfile(s); const run = s.run; // state
  useEffect(() => { if (r?.passed) sfx.clearance(); }, [r?.passed]); // clearance sound
  if (!r || !p || !run) return null; // nothing to show
  const pct = r.correct * 20; // readiness percent
  const next = nextMilestone(p.spaceWalkKm); // next milestone
  const isLast = run.tier === 4; // last tier?
  return (
    <main className="page results"> {/* page */}
      {r.passed ? <> {/* PASS */}
        <h2 className="gold">Clearance granted, Commander {p.name}! Your next frontier awaits.</h2> {/* message */}
        <p>Readiness: {pct}% · {r.correct} of 5 correct.</p> {/* score */}
        {r.awardedKm > 0 ? <p className="award">Space Walk increased by {formatKm(r.awardedKm)}.</p> : <p>This milestone was already rewarded — replay improved your best score only (best {p.bestScores[r.completionId]}/5). No extra distance.</p>} {/* award or replay note */}
      </> : <> {/* NOT YET */}
        <h2>Clearance pending, Commander {p.name}.</h2> {/* gentle heading */}
        <p>You reached {pct}%; this mission requires 60%. Recharge your knowledge and try again.</p> {/* encouraging message */}
        <p className="fineprint">Your exploration progress is saved — a retry goes straight to a fresh set of questions.</p> {/* reassurance */}
      </>}
      <SpaceWalkChip km={p.spaceWalkKm} /> {/* total */}
      <p>Tier {run.tier} reward: {formatKm(TIER_REWARD_KM[run.tier])} · Rank: {rankFor(p.spaceWalkKm)}{next ? ` · Next: ${next.title} at ${formatKm(next.km)}` : ''} · Accuracy {quizAccuracy(p)}%</p> {/* details */}
      {s.upgradePending && ( // choose an upgrade after a fresh clearance
        <div className="card upgrade"><h3>Choose an upgrade</h3><div className="row wrap"> {/* upgrade picker */}
          <button className="btn" onClick={() => chooseUpgrade('oxygen')}>O₂ tank (slower drain) · Lv {p.upgrades.oxygen}</button> {/* oxygen */}
          <button className="btn" onClick={() => chooseUpgrade('suit')}>Suit armour (less hazard damage) · Lv {p.upgrades.suit}</button> {/* suit */}
          <button className="btn" onClick={() => chooseUpgrade('thrusters')}>Thrusters (faster movement) · Lv {p.upgrades.thrusters}</button> {/* thrusters */}
        </div></div>
      )}
      <div className="row wrap"> {/* actions */}
        {r.passed && <button className="btn primary" disabled={s.upgradePending} onClick={continueAfterResults}>{isLast ? 'Mission summary' : 'Next tier →'}</button>} {/* continue */}
        {!r.passed && <button className="btn primary" onClick={startQuiz}>Retry Checkpoint</button>} {/* unlimited retries */}
        <button className="btn" onClick={() => openStudy(MISSION_BY_ID[run.missionId].stages[run.tier - 1].destinationId)}>Visit Know Your Space</button> {/* study */}
        <button className="btn" onClick={() => go('map')}>Return to Mission Map</button> {/* map */}
      </div>
      <ReviewList /> {/* review answers */}
    </main>
  );
}

function ReviewList() { // "Review Answers": show the last attempt's questions with the right answers
  const s = useGame(); const p = activeProfile(s); // state
  const [open, setOpen] = useState(false); // collapsed by default
  if (!p || !s.lastQuestionIds.length) return null; // nothing to review
  return (
    <section className="review"> {/* section */}
      <button className="btn" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Review Answers'}</button> {/* toggle */}
      {open && <ReviewItems ids={s.lastQuestionIds} />} {/* list */}
    </section>
  );
}

function ReviewItems({ ids }: { ids: string[] }) { // list of questions with correct answers and explanations
  return <ol>{ids.map((id) => { const q = QUESTIONS.find((x) => x.id === id)!; const c = q.options.find((o) => o.id === q.correctOptionId)!; return <li key={id}><b>{q.question}</b><br />✓ {c.text}<br /><small>{q.explanation}</small></li>; })}</ol>; // each question
}

export function SummaryScreen() { // after a four-tier expedition or the campaign
  const s = useGame(); const p = activeProfile(s); const run = s.run; // state
  if (!p || !run) return null; // nothing to show
  const m = MISSION_BY_ID[run.missionId]; // mission
  const ids = m.stages.map((st) => completionId(m.id, st.tier as Tier)); // its four milestones
  const earned = p.ledger.filter((e) => ids.includes(e.completionId)).reduce((a, e) => a + e.km, 0); // km from this mission
  const campaign = m.mode === 'campaign'; // story?
  const others = EXPEDITIONS.filter((e) => e.id !== m.id && !p.ledger.some((l) => l.completionId === completionId(e.id, 4))); // next expeditions available
  return (
    <main className="page summary"> {/* page */}
      <h2>{campaign ? 'Campaign Complete: Ring Guardian' : `${m.title} Complete`}</h2> {/* title */}
      <div className="row"><AvatarView a={p.avatar} size={120} /><div><h3>Commander {p.name}</h3><SpaceWalkChip km={p.spaceWalkKm} /><p>Space Walk earned on this mission: {formatKm(earned)}</p><p>Quiz results: {ids.map((id, i) => `T${i + 1} ${p.bestScores[id] ?? 0}/5`).join(' · ')}</p><p>Active time: {Math.round(p.activeMs / 60000)} min · Badges: {p.badges.length}</p></div></div> {/* stats */}
      {campaign && ( // Horizon Star Map ending
        <div className="card starmap"> {/* star map card */}
          <h3>🗺 You discovered the Horizon Star Map</h3> {/* heading */}
          <svg viewBox="0 0 300 120" width="100%" aria-label="Fictional star map"><rect width="300" height="120" fill="#050a1a" />{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 73) % 300} cy={(i * 41) % 120} r={i % 5 === 0 ? 2.5 : 1} fill="#cfe6ff" />)}<polyline points="20,90 80,60 140,70 200,30 270,45" fill="none" stroke="#ffc857" strokeDasharray="4 4" /></svg> {/* drawn map */}
          <p className="fiction">Simulation Fiction: the map hints at future exploration. It does not show that an inhabited or habitable planet has been discovered.</p> {/* honesty */}
        </div>
      )}
      <p className="logo small">CosmoTrekk</p><p className="tagline">Your Journey Has No Horizon.</p> {/* end-screen branding */}
      <div className="row wrap"> {/* actions */}
        <button className="btn primary" onClick={() => go('map')}>Explore Another Category</button> {/* new category */}
        <button className="btn" onClick={() => startStage(m.id, 1)}>Improve Best Score</button> {/* replay */}
        <button className="btn" onClick={() => go('study')}>Know Your Space</button> {/* study */}
        <button className="btn" onClick={() => go('rankings')}>View Rankings</button> {/* rankings */}
        <button className="btn" onClick={() => go('map')}>Return to Mission Control</button> {/* map */}
      </div>
      {others.length > 0 && <p className="fineprint">Available next: {others.map((o) => o.title).join(' · ')}</p>} {/* only real, playable missions */}
    </main>
  );
}
