// src/screens/Title.tsx — cinematic title screen + How to Play.
import { useGame, go, activeProfile } from '../engine/store'; // state + navigation
import { Rocket } from '../components/Art'; // rocket art
import { AvatarView } from '../components/Avatar'; // astronaut art
import { sfx } from '../audio/audio'; // click sound

export function TitleScreen() { // the first screen players see
  const s = useGame(); // read state
  const p = activeProfile(s); // current commander (if any)
  const hasSave = s.save.profiles.length > 0; // "Continue Journey" only when a save exists
  const nav = (to: Parameters<typeof go>[0]) => () => { sfx.click(); go(to); }; // click handler helper
  return (
    <main className="title-screen"> {/* full-screen layout */}
      <div className="title-planet" aria-hidden="true" /> {/* recognisable planetary backdrop (Saturn-like, CSS) */}
      <div className="title-art" aria-hidden="true"><Rocket size={150} /><AvatarView a={p?.avatar ?? { presentation: 'neutral', skin: '#c68642', suit: '#ff8c1a', visor: '#4fe3ff', helmet: 'round', patch: 'star' }} size={130} /></div> {/* rocket + astronaut */}
      <h1 className="logo">CosmoTrekk</h1> {/* game name — exact spelling */}
      <p className="tagline">Your Journey Has No Horizon.</p> {/* tagline */}
      <p className="descriptor">Junior Astronaut Mission Trainer</p> {/* descriptor */}
      {s.recovered && <p className="notice" role="status">Your previous save could not be read, so a fresh save was started. A backup copy was kept on this device.</p>} {/* corrupt-save notice */}
      <nav className="menu" aria-label="Main menu"> {/* main actions */}
        <button className="btn primary" onClick={nav('create')}>Start Journey</button> {/* new commander */}
        <button className="btn" disabled={!hasSave} onClick={nav(p ? 'map' : 'rankings')}>Continue Journey</button> {/* disabled without a save */}
        <button className="btn" onClick={nav('study')}>Know Your Space</button> {/* learning centre */}
        <button className="btn" onClick={nav('rankings')}>Space Walk Rankings</button> {/* rankings */}
        <button className="btn" onClick={nav('howto')}>How to Play</button> {/* instructions */}
        <button className="btn" onClick={nav('settings')}>Settings</button> {/* settings */}
      </nav>
      <p className="fineprint">Science Fact and Simulation Fiction are labelled throughout. Space Walk is game distance, not real travel.</p> {/* honesty line */}
    </main>
  );
}

export function HowToPlay() { // instructions screen
  return (
    <main className="page"> {/* standard page */}
      <h2>How to Play CosmoTrekk</h2> {/* heading */}
      <ol className="steps"> {/* numbered steps */}
        <li><b>Create your astronaut.</b> Pick a name and style — every look has identical abilities.</li> {/* step 1 */}
        <li><b>Choose an expedition</b> (Mars, Moon, Sun, asteroid, comet, exoplanet, satellite or station) or the featured campaign.</li> {/* step 2 */}
        <li><b>Read the briefing.</b> Gameplay is paused while you read. You can listen to it too.</li> {/* step 3 */}
        <li><b>Explore.</b> Move with <kbd>W A S D</kbd> / arrow keys (or the on-screen pad). Walk into items to collect them. Press <kbd>E</kbd> or <kbd>Space</kbd> (or ✋) at the glowing target. <kbd>Esc</kbd> pauses.</li> {/* step 4 */}
        <li><b>Watch your resources.</b> Oxygen, fuel, health and suit. Grab O₂ refills; avoid red hazards. Running out just restarts the activity — your progress is safe.</li> {/* step 5 */}
        <li><b>Pass the checkpoint:</b> five questions, 3 correct (60%) needed. Wrong answers never end the attempt early. Retry as often as you like.</li> {/* step 6 */}
        <li><b>Earn Space Walk:</b> +100, +250, +500, +1,000 km for tiers 1–4. Each milestone pays once — replays can improve your best score only.</li> {/* step 7 */}
      </ol>
      <h3>Install as an app (PWA)</h3> {/* install help */}
      <ul>
        <li><b>Android / desktop Chrome or Edge:</b> use the browser menu → <i>Install app</i> (or <i>Add to Home screen</i>) when offered.</li> {/* Android/desktop */}
        <li><b>iPhone Safari:</b> tap Share → <i>Add to Home Screen</i>.</li> {/* iOS */}
        <li>This is a web app, not an App Store package. Bundled missions and questions work offline after the first visit; live source links need internet.</li> {/* honest limits */}
      </ul>
      <button className="btn" onClick={() => go('title')}>Back</button> {/* back */}
    </main>
  );
}
