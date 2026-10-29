// src/components/Art.tsx — original procedural SVG art: destination previews, labelled diagrams, rocket.
import type { Briefing, SceneTheme } from '../types'; // types

export function DestinationPreview({ theme, size = 220 }: { theme: SceneTheme; size?: number }) { // big "planet" picture for briefings and cards
  const g = (id: string, c1: string, c2: string) => ( // helper: a radial gradient definition
    <radialGradient id={id} cx="35%" cy="35%" r="75%"><stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} /></radialGradient> // light → dark shading
  );
  return ( // 200×200 drawing
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Illustration of ${theme}`}> {/* accessible */}
      <defs> {/* reusable gradients */}
        {g('moon', '#f1f3f7', '#6d7280')}{g('mars', '#f0a070', '#7a2d18')}{g('venus', '#ffe2a0', '#b06a14')}{g('saturn', '#f6e3b0', '#a27c3e')} {/* planet shades */}
        {g('sun', '#fff5c0', '#ff7a1a')}{g('asteroid', '#b9a58f', '#4a3b30')}{g('comet', '#ffffff', '#7fb7d9')}{g('exoplanet', '#9cf0e0', '#4b2a8f')}{g('orbit', '#7fc4ff', '#0d3c8a')}{g('earth', '#7fc4ff', '#0d3c8a')} {/* more shades */}
      </defs>
      {theme === 'sun' && <circle cx="100" cy="100" r="92" fill="#ff9a3c" opacity="0.25" />} {/* solar glow */}
      {theme === 'comet' && <path d="M100 100 L200 40 L200 160 Z" fill="#bfe9ff" opacity="0.35" />} {/* comet tail (points away from Sun) */}
      {theme === 'saturn' && <ellipse cx="100" cy="100" rx="96" ry="22" fill="none" stroke="#e8d39a" strokeWidth="8" opacity="0.9" />} {/* back of the rings */}
      {theme === 'asteroid' // irregular rocky shape
        ? <path d="M40 90 Q50 40 100 45 Q160 40 165 95 Q170 150 110 160 Q50 165 40 90 Z" fill="url(#asteroid)" />
        : <circle cx="100" cy="100" r={theme === 'comet' ? 26 : 70} fill={`url(#${theme})`} />} {/* round body */}
      {theme === 'mars' && <><circle cx="80" cy="80" r="10" fill="#8a3a22" opacity="0.6" /><ellipse cx="100" cy="40" rx="22" ry="6" fill="#fff" opacity="0.8" /></>} {/* crater + polar cap */}
      {theme === 'moon' && <><circle cx="80" cy="85" r="12" fill="#9aa0ab" /><circle cx="120" cy="120" r="9" fill="#9aa0ab" /><circle cx="110" cy="70" r="6" fill="#9aa0ab" /></>} {/* craters */}
      {(theme === 'orbit' || theme === 'earth') && <><path d="M60 80 q20 -20 40 0 q10 20 -10 30 q-30 0 -30 -30z" fill="#3fa66b" /><path d="M110 120 q25 -10 30 15 q-15 15 -30 -15z" fill="#3fa66b" /></>} {/* continents */}
      {theme === 'saturn' && <path d="M4 100 A96 22 0 0 0 196 100" fill="none" stroke="#e8d39a" strokeWidth="8" />} {/* front of the rings */}
      {theme === 'venus' && <path d="M40 90 q60 -20 120 0 M45 115 q55 15 110 0" stroke="#fff3c4" strokeWidth="6" opacity="0.5" fill="none" />} {/* cloud bands */}
      {theme === 'exoplanet' && <ellipse cx="100" cy="95" rx="70" ry="10" fill="#7fd8c8" opacity="0.35" />} {/* atmospheric band */}
      {theme === 'orbit' && <g transform="translate(150 40) rotate(20)"><rect x="-6" y="-6" width="12" height="12" fill="#ddd" /><rect x="-30" y="-3" width="22" height="6" fill="#4f8ad9" /><rect x="8" y="-3" width="22" height="6" fill="#4f8ad9" /></g>} {/* little satellite */}
    </svg>
  );
}

export function Diagram({ b }: { b: Briefing }) { // simple labelled diagram — "Illustrative · Not to scale."
  const label = (x: number, y: number, t: string) => <text x={x} y={y} fill="#cfe6ff" fontSize="11" textAnchor="middle">{t}</text>; // small text helper
  return (
    <figure className="diagram"> {/* figure with caption */}
      <svg viewBox="0 0 320 130" width="100%" role="img" aria-label={`Diagram: location of ${b.name}`}> {/* accessible diagram */}
        {b.diagram === 'solar-system' && <> {/* planet in the solar system */}
          <circle cx="20" cy="65" r="14" fill="#ffb347" />{label(20, 98, 'Sun')} {/* Sun */}
          {[50, 80, 110, 140, 190, 240, 280, 305].map((x, i) => <circle key={i} cx={x} cy="65" r={i > 3 ? 7 : 4} fill={['#bbb', '#e0a540', '#3f8fd8', '#c9774f', '#d9b38c', '#e8d39a', '#9fe8ff', '#4f7cff'][i]} />)} {/* the eight planets in order */}
          {(() => { const xs: Record<string, number> = { venus: 80, earth: 110, mars: 140, asteroid: 165, saturn: 240 }; const x = xs[b.destinationId] ?? 165; return <><circle cx={x} cy="65" r="13" fill="none" stroke="#4fe3ff" strokeWidth="2" />{label(x, 40, b.destinationId === 'asteroid' ? 'Main belt (between Mars & Jupiter)' : 'You are here')}</>; })()} {/* highlight the destination's position */}
        </>}
        {b.diagram === 'moon-orbit' && <> {/* Moon orbiting Earth */}
          <circle cx="110" cy="65" r="22" fill="#3f8fd8" />{label(110, 105, 'Earth')} {/* Earth */}
          <ellipse cx="110" cy="65" rx="95" ry="40" fill="none" stroke="#5f7aa8" strokeDasharray="4 4" /> {/* orbit path */}
          <circle cx="205" cy="65" r="8" fill="#d9dde5" />{label(232, 50, 'Moon')} {/* Moon */}
          {label(160, 122, '≈ 384,400 km average (Earth → Moon)')} {/* distance with reference */}
        </>}
        {b.diagram === 'earth-orbit' && <> {/* satellite / station around Earth */}
          <circle cx="160" cy="65" r="38" fill="#3f8fd8" />{label(160, 70, 'Earth')} {/* Earth */}
          <ellipse cx="160" cy="65" rx="70" ry="50" fill="none" stroke="#5f7aa8" strokeDasharray="4 4" /> {/* illustrative orbit */}
          <rect x="226" y="58" width="12" height="12" fill="#ddd" />{label(262, 50, b.name.split(' ')[0])} {/* the craft */}
          {label(160, 126, 'Illustrative low Earth orbit')} {/* caption */}
        </>}
        {b.diagram === 'star-remote' && <> {/* remote observation of the Sun */}
          <circle cx="45" cy="65" r="38" fill="#ffb347" />{label(45, 120, 'Sun')} {/* Sun */}
          <line x1="90" y1="65" x2="250" y2="65" stroke="#5f7aa8" strokeDasharray="4 4" /> {/* line of sight */}
          <rect x="250" y="55" width="30" height="20" fill="#9aa3b5" />{label(265, 95, 'Observation deck')} {/* deck */}
          {label(170, 55, 'Far, shielded viewing — no landing')} {/* note */}
        </>}
        {b.diagram === 'conceptual' && <> {/* fictional / distant object */}
          <circle cx="40" cy="65" r="18" fill="#ff8f6b" />{label(40, 100, 'Star')} {/* star */}
          <ellipse cx="40" cy="65" rx="140" ry="45" fill="none" stroke="#5f7aa8" strokeDasharray="4 4" /> {/* orbit */}
          <circle cx="180" cy="65" r="10" fill="#9cf0e0" />{label(180, 45, 'Target')} {/* object */}
          {label(250, 120, 'Conceptual location')} {/* note */}
        </>}
      </svg>
      <figcaption>Illustrative · Not to scale.</figcaption> {/* required label */}
    </figure>
  );
}

export function Rocket({ size = 120 }: { size?: number }) { // simple rocket for the title and launch screens
  return (
    <svg viewBox="0 0 60 140" width={size * 0.43} height={size} aria-hidden="true"> {/* decorative */}
      <path d="M30 4 C48 24 50 60 46 96 H14 C10 60 12 24 30 4 Z" fill="#e9eef7" stroke="#1b2233" strokeWidth="3" /> {/* body */}
      <circle cx="30" cy="48" r="9" fill="#4fe3ff" stroke="#1b2233" strokeWidth="3" /> {/* window */}
      <path d="M14 80 L2 108 L16 100 Z M46 80 L58 108 L44 100 Z" fill="#ff8c1a" stroke="#1b2233" strokeWidth="2" /> {/* fins */}
      <path className="flame" d="M18 98 Q30 140 42 98 Z" fill="#ffc857" /> {/* exhaust flame (animated in CSS) */}
    </svg>
  );
}
