// src/components/Avatar.tsx — the astronaut drawn as SVG (helmet, visor, backpack, gloves, boots, suit colour).
import type { Avatar as AvatarT } from '../types'; // avatar type

export const SKIN_TONES = ['#f6d7c3', '#e8b48f', '#c68642', '#8d5524', '#5c3a21']; // several skin tones
export const SUIT_COLOURS = ['#ff8c1a', '#f2f5fa', '#4fa3ff', '#7d5cff', '#2ecc71', '#ff5d8f']; // at least four suit colours
export const VISOR_COLOURS = ['#4fe3ff', '#ffc857', '#9b8cff', '#7dff9a']; // visor tints

export function randomAvatar(): AvatarT { // "Randomize Astronaut" button
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]; // random element helper
  return { presentation: pick(['girl', 'boy', 'neutral'] as const), skin: pick(SKIN_TONES), suit: pick(SUIT_COLOURS), visor: pick(VISOR_COLOURS), helmet: pick(['round', 'sleek'] as const), patch: pick(['none', 'star', 'planet', 'rocket'] as const) }; // random everything
}

export function AvatarView({ a, size = 160, title }: { a: AvatarT; size?: number; title?: string }) { // draws the avatar
  const dark = '#1b2233'; // outline colour
  return ( // SVG drawing, 200×240 units, scaled to "size"
    <svg viewBox="0 0 200 240" width={size} height={size * 1.2} role="img" aria-label={title ?? `Astronaut avatar in a ${a.presentation} presentation`}> {/* accessible picture */}
      <ellipse cx="100" cy="228" rx="55" ry="8" fill="#000" opacity="0.3" /> {/* shadow */}
      <rect x="44" y="96" width="30" height="70" rx="8" fill="#c9d1de" stroke={dark} strokeWidth="3" /> {/* backpack */}
      <rect x="62" y="100" width="76" height="80" rx="18" fill={a.suit} stroke={dark} strokeWidth="3" /> {/* torso in suit colour */}
      <rect x="66" y="172" width="28" height="40" rx="8" fill={a.suit} stroke={dark} strokeWidth="3" /> {/* left leg */}
      <rect x="106" y="172" width="28" height="40" rx="8" fill={a.suit} stroke={dark} strokeWidth="3" /> {/* right leg */}
      <rect x="60" y="206" width="38" height="16" rx="6" fill="#3a3f4b" /> {/* left boot */}
      <rect x="102" y="206" width="38" height="16" rx="6" fill="#3a3f4b" /> {/* right boot */}
      <rect x="40" y="110" width="22" height="50" rx="10" fill={a.suit} stroke={dark} strokeWidth="3" /> {/* left arm */}
      <rect x="138" y="110" width="22" height="50" rx="10" fill={a.suit} stroke={dark} strokeWidth="3" /> {/* right arm */}
      <circle cx="51" cy="164" r="11" fill="#fff" stroke={dark} strokeWidth="3" /> {/* left glove */}
      <circle cx="149" cy="164" r="11" fill="#fff" stroke={dark} strokeWidth="3" /> {/* right glove */}
      <rect x="84" y="122" width="32" height="20" rx="4" fill="#dfe6f2" stroke={dark} strokeWidth="2" /> {/* chest control panel */}
      <circle cx="92" cy="132" r="3" fill="#ff5d5d" /><circle cx="102" cy="132" r="3" fill="#ffc857" /><circle cx="110" cy="132" r="3" fill="#7dff9a" /> {/* status lights */}
      {a.patch !== 'none' && <circle cx="122" cy="156" r="10" fill="#0b1430" stroke="#ffc857" strokeWidth="2" />} {/* mission patch background */}
      {a.patch === 'star' && <polygon points="122,148 124,154 130,154 125,158 127,164 122,160 117,164 119,158 114,154 120,154" fill="#ffc857" />} {/* star patch */}
      {a.patch === 'planet' && <g><circle cx="122" cy="156" r="5" fill="#4fe3ff" /><ellipse cx="122" cy="156" rx="9" ry="3" fill="none" stroke="#ffc857" strokeWidth="1.5" /></g>} {/* planet patch */}
      {a.patch === 'rocket' && <path d="M122 147 l4 8 v6 h-8 v-6 z" fill="#ff8c1a" />} {/* rocket patch */}
      {a.helmet === 'round' // helmet shape choice
        ? <circle cx="100" cy="62" r="46" fill="#f2f5fa" stroke={dark} strokeWidth="3" /> // round helmet
        : <rect x="56" y="18" width="88" height="88" rx="34" fill="#f2f5fa" stroke={dark} strokeWidth="3" />} {/* sleek helmet */}
      <ellipse cx="100" cy="64" rx="32" ry="26" fill={a.skin} /> {/* face (skin tone) behind the visor */}
      {a.presentation === 'girl' && <path d="M68 58 q32 -34 64 0 q-6 -8 -32 -10 q-26 2 -32 10 z M66 60 q-6 22 4 34 M134 60 q6 22 -4 34" fill="#3b2416" stroke="#3b2416" strokeWidth="5" />} {/* longer hair */}
      {a.presentation === 'boy' && <path d="M70 54 q30 -26 60 0 q-10 -6 -30 -6 q-20 0 -30 6 z" fill="#2a1a10" />} {/* short hair */}
      <circle cx="89" cy="66" r="3.5" fill={dark} /><circle cx="111" cy="66" r="3.5" fill={dark} /> {/* eyes */}
      <path d="M91 78 q9 7 18 0" stroke={dark} strokeWidth="2.5" fill="none" strokeLinecap="round" /> {/* friendly smile */}
      <ellipse cx="100" cy="64" rx="34" ry="28" fill={a.visor} opacity="0.32" stroke={dark} strokeWidth="2" /> {/* tinted visor over the face */}
      <ellipse cx="116" cy="50" rx="9" ry="5" fill="#fff" opacity="0.6" /> {/* visor reflection */}
    </svg>
  );
}
