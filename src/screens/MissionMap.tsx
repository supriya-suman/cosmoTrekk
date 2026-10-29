// src/screens/MissionMap.tsx — "Choose Your First Expedition": campaign + 8 expeditions + study-only categories.
import { useGame, activeProfile, go, startStage, isUnlocked, openStudy } from '../engine/store'; // state + actions
import { CAMPAIGN, EXPEDITIONS, completionId } from '../data/missions'; // missions
import { CATALOGUE } from '../data/catalogue'; // study-only categories
import { DestinationPreview } from '../components/Art'; // art
import { SpaceWalkChip } from '../components/Hud'; // metric
import { formatKm, TIER_REWARD_KM } from '../config/rewards'; // numbers
import type { Mission, Tier } from '../types'; // types

function TierButtons({ m }: { m: Mission }) { // four tier buttons for one mission
  const s = useGame(); const p = activeProfile(s); // profile
  return (
    <div className="tiers"> {/* row */}
      {m.stages.map((st) => { // one button per stage
        const id = completionId(m.id, st.tier as Tier); // milestone ID
        const done = p?.ledger.some((e) => e.completionId === id); // already cleared?
        const open = isUnlocked(m.id, st.tier as Tier, p); // unlocked?
        return (
          <button key={st.tier} className={`tier ${done ? 'done' : ''}`} disabled={!open} onClick={() => startStage(m.id, st.tier as Tier)} aria-label={`${m.title} tier ${st.tier}: ${st.title}. ${done ? 'Cleared — replay improves best score only.' : open ? `Reward ${formatKm(TIER_REWARD_KM[st.tier as Tier])}` : 'Locked'}`}> {/* accessible label */}
            <span className="tier-n">{done ? '✓' : open ? st.tier : '🔒'}</span> {/* status symbol */}
            <span className="tier-t">{st.title}</span> {/* stage name */}
            <span className="tier-r">{done ? `Best ${p?.bestScores[id] ?? 0}/5` : `+${formatKm(TIER_REWARD_KM[st.tier as Tier])}`}</span> {/* reward or best score */}
          </button>
        );
      })}
    </div>
  );
}

export function MissionMap() { // the mission map
  const s = useGame(); const p = activeProfile(s); // profile
  if (!p) return <main className="page"><p>Create a commander first.</p><button className="btn primary" onClick={() => go('create')}>Start Journey</button></main>; // need a commander first
  const first = p.ledger.length === 0; // brand-new player?
  const studyOnly = CATALOGUE.filter((c) => !c.expeditionId); // categories without an expedition
  return (
    <main className="page map"> {/* page */}
      <header className="map-head"><h2>{first ? 'Choose Your First Expedition' : 'Mission Control'}</h2><SpaceWalkChip km={p.spaceWalkKm} /></header> {/* title + metric */}
      {first && <p className="lead">Pick any starting destination — Earth is not your only option. Every start uses the same reward schedule and begins at 0 km.</p>} {/* first-time hint */}
      {s.save.settings.demoMode && <p className="notice">DEMO MODE ON: shorter exploration (5 questions and 60% rule unchanged). Demo results are labelled and never verified.</p>} {/* demo label */}
      <section className="campaign card"> {/* featured campaign */}
        <DestinationPreview theme="saturn" size={110} /> {/* art */}
        <div><h3>{CAMPAIGN.title}</h3><p>{CAMPAIGN.blurb}</p><p className="fiction">Simulation Fiction: a story itinerary, not a realistic orbital trajectory.</p><TierButtons m={CAMPAIGN} /></div> {/* info + tiers */}
      </section>
      <h3>Starting expeditions</h3> {/* eight expeditions */}
      <div className="grid"> {/* card grid */}
        {EXPEDITIONS.map((m) => (
          <section key={m.id} className="card"> {/* one card */}
            <DestinationPreview theme={m.stages[0].theme === 'orbit' ? 'orbit' : m.stages[0].theme} size={90} /> {/* art */}
            <div><span className="cat">{m.category}</span><h4>{m.title}</h4><p>{m.blurb}</p><TierButtons m={m} /></div> {/* info + tiers */}
          </section>
        ))}
      </div>
      <h3>More of the universe — study now</h3> {/* study-only categories (no misleading Play buttons) */}
      <div className="chips">{studyOnly.map((c) => <button key={c.id} className="chip" onClick={() => openStudy(c.id)}>{c.name} <small>Study available · Expedition not yet available.</small></button>)}</div> {/* list */}
      <div className="row"><button className="btn" onClick={() => go('title')}>Title</button><button className="btn" onClick={() => go('profile')}>Profile</button><button className="btn" onClick={() => go('study')}>Know Your Space</button><button className="btn" onClick={() => go('rankings')}>Rankings</button></div> {/* navigation */}
    </main>
  );
}
