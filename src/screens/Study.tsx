// src/screens/Study.tsx — "Know Your Space": searchable learning centre, comparisons, practice quizzes, Mission Intel.
// Reading and practising NEVER award Space Walk distance.
import { useEffect, useMemo, useState } from 'react'; // React hooks
import { useGame, activeProfile, back, markStudied, toggleBookmark } from '../engine/store'; // actions
import { CATALOGUE, CATALOGUE_BY_ID, COMPARISONS, GROUP_LABELS } from '../data/catalogue'; // content
import { SOURCE_BY_ID } from '../data/sources'; // sources
import { questionsFor } from '../data/questions'; // practice questions
import { newAttempt, submitAnswer, advance, correctCount, type QuizAttempt } from '../engine/quiz'; // quiz logic (reused, unranked)
import { DestinationPreview } from '../components/Art'; // art
import type { CatalogueEntry, CatalogueGroup, SceneTheme } from '../types'; // types

const THEME_FOR: Record<string, SceneTheme> = { mars: 'mars', moon: 'moon', venus: 'venus', saturn: 'saturn', sun: 'sun', asteroid: 'asteroid', comet: 'comet', exoplanet: 'exoplanet', satellite: 'orbit', station: 'orbit', earth: 'earth' }; // art for cards that have one

function Practice({ dest }: { dest: string }) { // unranked five-question practice quiz
  const pool = questionsFor(dest); // questions for this topic
  const [att, setAtt] = useState<QuizAttempt>(() => newAttempt(pool, false)); // local attempt (not stored)
  const q = att.questions[att.index]; const chosen = att.answers[att.index]; // current question
  return (
    <div className="practice card"> {/* practice box */}
      <p className="cat">Practice (unranked · no Space Walk) · Question {att.index + 1}/5 · Score {correctCount(att)}</p> {/* header */}
      <h4>{q.question}</h4> {/* question */}
      <div className="options">{q.options.map((o) => <button key={o.id} disabled={!!chosen} className={`option ${chosen ? (o.id === q.correctOptionId ? 'correct' : o.id === chosen ? 'wrong' : 'dim') : ''}`} onClick={() => setAtt(submitAnswer(att, att.index, o.id))}>{o.id.toUpperCase()}. {o.text}{chosen && o.id === q.correctOptionId ? ' ✓' : ''}{chosen === o.id && o.id !== q.correctOptionId ? ' ✗' : ''}</button>)}</div> {/* options */}
      {chosen && <p className="fineprint">{q.explanation}</p>} {/* explanation */}
      {chosen && (att.index < 4 // next or finish
        ? <button className="btn small" onClick={() => setAtt(advance(att))}>Continue</button>
        : <p><b>Practice result: {correctCount(att)}/5.</b> <button className="btn small" onClick={() => setAtt(newAttempt(pool, false, att.questions.map((x) => x.id)))}>New practice set</button></p>)} {/* result + restart */}
    </div>
  );
}

function MissionIntel({ topic }: { topic: string }) { // optional live intel from /api/intel (falls back honestly)
  const [state, setState] = useState<{ status: string; items: { title: string; url: string }[]; checked?: string } | null>(null); // result
  useEffect(() => { // fetch once per topic
    let alive = true; // ignore late responses after leaving
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000); // 6-second timeout
    fetch(`/api/intel?topic=${encodeURIComponent(topic)}`, { signal: ctrl.signal }) // ask our server function
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))) // parse JSON or fail
      .then((j) => { if (alive) setState({ status: j.status ?? 'Cached source content', items: j.items ?? [], checked: j.checkedAt }); }) // show data
      .catch(() => { if (alive) setState({ status: 'Offline training bank', items: [] }); }) // offline / no server → honest label
      .finally(() => clearTimeout(t)); // stop the timer
    return () => { alive = false; ctrl.abort(); }; // cleanup
  }, [topic]); // when the topic changes
  if (!state) return <p className="fineprint">Mission Intel: checking…</p>; // loading
  return (
    <div className="intel"> {/* intel box */}
      <p className="fineprint">Mission Intel status: <b>{state.status}</b>{state.checked ? ` · Source checked at ${new Date(state.checked).toLocaleString()}` : ''}</p> {/* honest status, never "Live" for fallback */}
      {state.items.length > 0 && <ul>{state.items.slice(0, 4).map((i) => <li key={i.url}><a href={i.url} target="_blank" rel="noreferrer">{i.title}</a></li>)}</ul>} {/* NASA library items */}
    </div>
  );
}

function Card({ e, open, onOpen }: { e: CatalogueEntry; open: boolean; onOpen: () => void }) { // one study card
  const s = useGame(); const p = activeProfile(s); // profile
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner'); // explanation level
  const marked = !!p?.bookmarks.includes(e.id); // bookmarked?
  return (
    <article className={`study-card ${open ? 'open' : ''}`} id={`card-${e.id}`}> {/* card */}
      <button className="study-head" aria-expanded={open} onClick={onOpen}> {/* header button */}
        {THEME_FOR[e.id] ? <DestinationPreview theme={THEME_FOR[e.id]} size={48} /> : <span className="dot-icon" aria-hidden="true">✦</span>} {/* icon */}
        <span><b>{e.name}</b><small>{e.category}{e.expeditionId ? ' · Expedition available' : ' · Study available · Expedition not yet available.'}</small></span> {/* title */}
      </button>
      {open && <div className="study-body"> {/* details */}
        <div className="row wrap" role="tablist">{(['beginner', 'intermediate', 'advanced'] as const).map((l) => <button key={l} role="tab" aria-selected={level === l} className={`chip ${level === l ? 'on' : ''}`} onClick={() => setLevel(l)}>{l}</button>)}</div> {/* level tabs */}
        <p className="explain"><span className="tag">Science Fact</span> {e[level]}</p> {/* explanation */}
        <p><b>Key vocabulary:</b> {e.vocabulary.join(', ')}</p> {/* vocabulary */}
        <p><b>Mission hazards:</b> {e.hazards.join(', ')} · <b>Equipment:</b> {e.equipment.join(', ')}</p> {/* hazards + gear */}
        <ul>{e.facts.map((f) => <li key={f}>{f}</li>)}</ul> {/* facts */}
        <p className="sources">Sources: {e.sourceIds.map((id) => <a key={id} href={SOURCE_BY_ID[id]?.url} target="_blank" rel="noreferrer">{SOURCE_BY_ID[id]?.title}</a>)}</p> {/* links */}
        <button className="btn small" onClick={() => toggleBookmark(e.id)} aria-pressed={marked}>{marked ? '★ Bookmarked' : '☆ Bookmark'}</button> {/* bookmark */}
        {questionsFor(e.id).length > 0 && <Practice dest={e.id} />} {/* practice quiz for topics with a question bank */}
        <MissionIntel topic={e.id} /> {/* intel */}
      </div>}
    </article>
  );
}

export function StudyScreen() { // the learning centre
  const s = useGame(); const p = activeProfile(s); // profile
  const [query, setQuery] = useState(''); // search text
  const [group, setGroup] = useState<CatalogueGroup | 'all' | 'bookmarks' | 'compare'>('all'); // tab
  const [openId, setOpenId] = useState<string | null>(s.studyFocus); // which card is open
  useEffect(() => { if (s.studyFocus) { setOpenId(s.studyFocus); setTimeout(() => document.getElementById(`card-${s.studyFocus}`)?.scrollIntoView({ block: 'start' }), 50); } }, [s.studyFocus]); // jump to a linked lesson
  const list = useMemo(() => CATALOGUE.filter((e) => { // filtered cards
    const text = `${e.name} ${e.category} ${e.beginner} ${e.vocabulary.join(' ')}`.toLowerCase(); // searchable text
    if (query && !text.includes(query.toLowerCase())) return false; // search filter
    if (group === 'bookmarks') return !!p?.bookmarks.includes(e.id); // bookmarks tab
    return group === 'all' || group === e.group; // group filter
  }), [query, group, p?.bookmarks]); // recompute when these change
  const last = p?.studied[p.studied.length - 1]; // most recent card → "Continue Studying"
  const open = (id: string) => { setOpenId(openId === id ? null : id); markStudied(id); }; // open + record (not proof of mastery)
  return (
    <main className="page study"> {/* page */}
      <header className="row wrap"><h2>Know Your Space</h2><button className="btn small" onClick={back}>Back</button></header> {/* header */}
      <p className="fineprint">A practical discovery catalogue — not an exhaustive or mutually exclusive scientific taxonomy. Studying never awards Space Walk; it helps you pass checkpoints.</p> {/* honesty */}
      <input className="search" type="search" placeholder="Search planets, comets, vocabulary…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search Know Your Space" /> {/* search */}
      {last && CATALOGUE_BY_ID[last] && <button className="chip" onClick={() => open(last)}>▶ Continue Studying: {CATALOGUE_BY_ID[last].name}</button>} {/* continue */}
      <div className="row wrap tabs" role="tablist">{(['all', 'natural', 'systems', 'human-made', 'events', 'compare', 'bookmarks'] as const).map((g) => <button key={g} role="tab" aria-selected={group === g} className={`chip ${group === g ? 'on' : ''}`} onClick={() => setGroup(g)}>{g === 'all' ? 'All' : g === 'compare' ? 'Comparisons' : g === 'bookmarks' ? '★ Bookmarks' : GROUP_LABELS[g]}</button>)}</div> {/* tabs */}
      {group === 'compare' // comparisons tab
        ? <div className="grid">{COMPARISONS.map((c) => <section key={c.title} className="card compare"><h4>{c.title}</h4><p>{c.a}</p><p>{c.b}</p><p className="fineprint">{c.note}</p></section>)}</div>
        : <div className="study-list">{list.map((e) => <Card key={e.id} e={e} open={openId === e.id} onOpen={() => open(e.id)} />)}{list.length === 0 && <p>No matches.</p>}</div>} {/* cards */}
      <p className="fineprint">Audio note: Space is mostly vacuum. This experience uses cinematic audio, spacecraft sounds, and optional scientific sonifications.</p> {/* audio science note */}
    </main>
  );
}
