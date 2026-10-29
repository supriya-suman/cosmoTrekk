// src/audio/audio.ts — centralised audio, generated live with the Web Audio API (no sound files, no licences needed).
// Science note shown in Settings: space is mostly vacuum; these are cinematic and spacecraft sounds, not recordings of space.
import type { Settings } from '../types'; // settings type

let ctx: AudioContext | null = null; // the browser's audio engine (created only after the first click → no autoplay)
let musicGain: GainNode | null = null, sfxGain: GainNode | null = null, master: GainNode | null = null; // volume knobs
let ambientNodes: AudioNode[] = []; // currently playing ambient sounds
let breathNode: AudioBufferSourceNode | null = null; // optional suit breathing loop

export function unlockAudio(s: Settings): void { // call on the first user interaction (browsers block audio before that)
  if (!ctx) { // create once
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; // Safari fallback name
    if (!AC) return; // very old browser: play silently
    ctx = new AC(); // start the engine
    master = ctx.createGain(); master.connect(ctx.destination); // master volume → speakers
    musicGain = ctx.createGain(); musicGain.connect(master); // music bus
    sfxGain = ctx.createGain(); sfxGain.connect(master); // sound-effects bus
  }
  void ctx.resume(); // resume if the browser suspended it
  applySettings(s); // set volumes
}

export function applySettings(s: Settings): void { // update volumes from settings
  if (!ctx || !master || !musicGain || !sfxGain) return; // not unlocked yet
  master.gain.value = s.master ? 1 : 0; // master mute
  musicGain.gain.value = s.music * 0.35; // music volume (kept soft)
  sfxGain.gain.value = s.sfx * 0.6; // effects volume
  if (s.breathing && !breathNode) startBreathing(); else if (!s.breathing && breathNode) { breathNode.stop(); breathNode = null; } // optional breathing
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, when = 0, bus: GainNode | null = sfxGain): void { // play one short note
  if (!ctx || !bus) return; // audio not ready
  const t = ctx.currentTime + when; // start time
  const o = ctx.createOscillator(), g = ctx.createGain(); // oscillator + envelope
  o.type = type; o.frequency.value = freq; // waveform + pitch
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); // quick fade in/out (no clicks)
  o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05); // wire up and play
}

function noiseBuffer(seconds: number): AudioBuffer | null { // white noise (for rumble, radio static, breathing)
  if (!ctx) return null; // not ready
  const b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate); // empty buffer
  const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; // random samples
  return b; // filled buffer
}

export const sfx = { // all named sound effects
  click: () => tone(660, 0.08, 'triangle', 0.15), // interface tap
  collect: () => { tone(880, 0.12, 'sine', 0.25); tone(1320, 0.15, 'sine', 0.2, 0.06); }, // collection chime
  interact: () => { tone(523, 0.12, 'triangle', 0.25); tone(784, 0.2, 'triangle', 0.25, 0.1); }, // repair done
  deny: () => tone(180, 0.15, 'square', 0.08), // not enough parts
  hit: () => tone(120, 0.18, 'sawtooth', 0.12), // hazard hit
  correct: () => { tone(660, 0.12); tone(990, 0.2, 'sine', 0.3, 0.1); }, // correct answer
  wrong: () => tone(150, 0.25, 'square', 0.07), // subtle optional buzz
  clearance: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 'triangle', 0.25, i * 0.12)), // satisfying arpeggio
  radio: () => { // radio-communication blip + static
    if (!ctx || !sfxGain) return; // not ready
    tone(1200, 0.05, 'square', 0.06); tone(1500, 0.05, 'square', 0.06, 0.07); // beep-beep
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.25); // short static
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2500; // radio band
    const g = ctx.createGain(); g.gain.value = 0.05; src.connect(f).connect(g).connect(sfxGain); src.start(); // play quietly
  },
  countdown: () => tone(440, 0.15, 'sine', 0.2), // countdown tick
  launch: () => { // internal cockpit launch vibration (low rumble)
    if (!ctx || !sfxGain) return; // not ready
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(4); // 4 s of noise
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; // keep only the deep part
    const g = ctx.createGain(); const t = ctx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 4); // swell then fade
    src.connect(f).connect(g).connect(sfxGain); src.start(); tone(55, 3.5, 'sawtooth', 0.15); // rumble + engine tone
  },
};

export function startAmbient(): void { // cinematic ambient pad + cabin hum (loops until stopped)
  if (!ctx || !musicGain || ambientNodes.length) return; // not ready or already playing
  const freqs = [110, 164.8, 220, 277.2]; // soft A-major-ish chord
  freqs.forEach((f, i) => { // one oscillator per note
    const o = ctx!.createOscillator(); o.type = i === 0 ? 'sine' : 'triangle'; o.frequency.value = f; // note
    const g = ctx!.createGain(); g.gain.value = 0.05; // quiet
    const lfo = ctx!.createOscillator(); lfo.frequency.value = 0.05 + i * 0.03; const lg = ctx!.createGain(); lg.gain.value = 0.03; // slow volume wobble
    lfo.connect(lg).connect(g.gain); o.connect(g).connect(musicGain!); o.start(); lfo.start(); // wire + start
    ambientNodes.push(o, lfo); // remember for stopping
  });
  const hum = ctx.createOscillator(); hum.frequency.value = 60; const hg = ctx.createGain(); hg.gain.value = 0.02; hum.connect(hg).connect(musicGain); hum.start(); ambientNodes.push(hum); // cabin hum
}

export function stopAmbient(): void { ambientNodes.forEach((n) => { try { (n as OscillatorNode).stop(); } catch { /* already stopped */ } }); ambientNodes = []; } // silence the ambience

function startBreathing(): void { // optional soft suit breathing (filtered noise, slow in/out)
  if (!ctx || !sfxGain) return; // not ready
  const src = ctx.createBufferSource(); src.buffer = noiseBuffer(2); src.loop = true; // looping noise
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; // breathy band
  const g = ctx.createGain(); g.gain.value = 0; const lfo = ctx.createOscillator(); lfo.frequency.value = 0.25; const lg = ctx.createGain(); lg.gain.value = 0.04; // 4-second breath cycle
  lfo.connect(lg).connect(g.gain); src.connect(f).connect(g).connect(sfxGain); src.start(); lfo.start(); breathNode = src; // play
}

export function speak(text: string, enabled: boolean): void { // optional narration via the browser's speech synthesis
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return; // unavailable → text stays on screen
  try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1; u.lang = 'en-US'; window.speechSynthesis.speak(u); } catch { /* no voices installed → silently skip */ } // speak safely
}

export function stopSpeaking(): void { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } } // stop narration
