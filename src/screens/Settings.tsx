// src/screens/Settings.tsx — audio, accessibility, quiz timer and demo mode (all saved on this device).
import { useGame, updateSettings, back } from '../engine/store'; // state + actions
import { applySettings } from '../audio/audio'; // live audio update
import type { Settings } from '../types'; // type

export function SettingsScreen() { // the settings page
  const s = useGame(); const st = s.save.settings; // current settings
  const set = (patch: Partial<Settings>) => { updateSettings(patch); applySettings({ ...st, ...patch }); }; // save + apply immediately
  const toggle = (k: keyof Settings, label: string, help: string) => ( // one checkbox row
    <label className="setting"><input type="checkbox" checked={Boolean(st[k])} onChange={(e) => set({ [k]: e.target.checked } as Partial<Settings>)} /> <span><b>{label}</b><small>{help}</small></span></label> // checkbox + text
  );
  return (
    <main className="page"> {/* page */}
      <header className="row wrap"><h2>Settings</h2><button className="btn small" onClick={back}>Back</button></header> {/* header */}
      <h3>Audio</h3> {/* section */}
      {toggle('master', 'Sound on', 'Master mute switch.')} {/* master */}
      <label className="setting">Music volume <input type="range" min={0} max={1} step={0.05} value={st.music} onChange={(e) => set({ music: Number(e.target.value) })} /></label> {/* music slider */}
      <label className="setting">Effects volume <input type="range" min={0} max={1} step={0.05} value={st.sfx} onChange={(e) => set({ sfx: Number(e.target.value) })} /></label> {/* sfx slider */}
      {toggle('narration', 'Narration', 'Reads briefings aloud when available. All narrated text is also shown on screen.')} {/* narration */}
      {toggle('breathing', 'Soft suit breathing', 'Optional ambient breathing sound.')} {/* breathing */}
      <p className="fineprint">Space is mostly vacuum. This experience uses cinematic audio, spacecraft sounds, and optional scientific sonifications. Nothing here is a raw recording of sound travelling through empty space.</p> {/* science note */}
      <h3>Accessibility</h3> {/* section */}
      {toggle('reducedMotion', 'Reduced motion', 'Fewer animations, no camera shake.')} {/* reduced motion */}
      {toggle('timedQuiz', 'Timed quizzes', 'Off by default. Adds 45 seconds per question.')} {/* timer */}
      <h3>Presentation</h3> {/* section */}
      {toggle('demoMode', 'Demo mode', 'Shorter exploration for hackathon demos. Still five questions and the 60% rule. Results are labelled demo and excluded from verified rankings.')} {/* demo */}
    </main>
  );
}
