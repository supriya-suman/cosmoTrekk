// src/data/briefings.ts — immersive briefing content for every playable destination.
// Rule: distances always name their reference point; game Space Walk km is never mixed with real distances.
import type { Briefing } from '../types'; // the Briefing shape

export const BRIEFINGS: Record<string, Briefing> = { // destinationId → briefing
  earth: { destinationId: 'earth', name: 'Earth — Launch Hub', category: 'Planet', theme: 'earth', diagram: 'solar-system', // Earth (campaign tutorial)
    location: 'Third planet from the Sun', facts: [ // fact table rows
      { label: 'Distance from Sun', value: '≈ 1 AU (≈ 150 million km)' }, // reference: the Sun
      { label: 'Diameter', value: '≈ 12,700 km' }, // size
      { label: 'Atmosphere', value: 'Nitrogen and oxygen — breathable' }, // air
      { label: 'Gravity', value: '1 g (reference value)' }, // gravity
    ], equipment: ['Launch suit', 'Checklist'], memorable: ['Only world known to host life.', 'One natural satellite: the Moon.', 'Most of its surface is ocean.'], sourceIds: ['nasa-earth'] },
  moon: { destinationId: 'moon', name: 'Earth’s Moon', category: 'Moon (natural satellite)', theme: 'moon', diagram: 'moon-orbit', // the Moon
    location: 'Orbits Earth', facts: [
      { label: 'Average distance from Earth', value: '≈ 384,400 km' }, // reference: Earth
      { label: 'Diameter', value: '≈ 3,475 km (about ¼ of Earth)' }, // size
      { label: 'Atmosphere', value: 'Almost none (extremely thin exosphere)' }, // air
      { label: 'Gravity', value: '≈ 1/6 of Earth’s' }, // gravity
      { label: 'Hazard', value: 'No breathable air; large temperature swings' }, // hazard
    ], equipment: ['Oxygen supply', 'Thermal suit', 'Relay radio'], memorable: ['Tidally locked: we always see the same face.', 'Twelve Apollo astronauts walked here.', 'Craters come mostly from impacts.'], sourceIds: ['nasa-moon'] },
  mars: { destinationId: 'mars', name: 'Mars', category: 'Planet', theme: 'mars', diagram: 'solar-system', // Mars
    location: 'Fourth planet from the Sun', facts: [
      { label: 'Average distance from Sun', value: '≈ 1.5 AU (≈ 228 million km)' }, // reference: the Sun
      { label: 'Distance from Earth', value: 'Varies a lot as both planets orbit — roughly 55 to 400 million km' }, // honest range, not a precise current value
      { label: 'Diameter', value: '≈ 6,800 km (about half of Earth)' }, // size
      { label: 'Atmosphere', value: 'Thin, mostly carbon dioxide — not breathable' }, // air
      { label: 'Gravity', value: '≈ 38% of Earth’s' }, // gravity
    ], equipment: ['Pressurised suit', 'Dust filters', 'Solar panels'], memorable: ['Red from iron-oxide dust.', 'Olympus Mons: largest known volcano in the solar system.', 'A sol lasts about 24 h 37 min.'], sourceIds: ['nasa-mars'] },
  venus: { destinationId: 'venus', name: 'Venus — Protected Cloud Platform', category: 'Planet', theme: 'venus', diagram: 'solar-system', // Venus (we never land)
    location: 'Second planet from the Sun', facts: [
      { label: 'Average distance from Sun', value: '≈ 0.72 AU (≈ 108 million km)' }, // reference: the Sun
      { label: 'Diameter', value: '≈ 12,100 km (similar to Earth)' }, // size
      { label: 'Surface temperature', value: '≈ 465 °C' }, // heat
      { label: 'Atmosphere', value: 'Thick CO₂, sulfuric-acid clouds; ≈ 90× Earth surface pressure' }, // air
      { label: 'Gravity', value: '≈ 90% of Earth’s' }, // gravity
    ], equipment: ['Heat-shield module', 'Pressure hull', 'Acid-resistant panels'], memorable: ['Hottest planet in the solar system.', 'Spins backwards.', 'A day is longer than its year.'], sourceIds: ['nasa-venus'],
    fictionNote: 'Simulation Fiction: the high-altitude shield platform is invented for this game.' },
  saturn: { destinationId: 'saturn', name: 'Saturn Orbital Station', category: 'Planet (gas giant) — orbital station', theme: 'saturn', diagram: 'solar-system', // Saturn (orbit only)
    location: 'Sixth planet from the Sun', facts: [
      { label: 'Average distance from Sun', value: '≈ 9.5 AU (≈ 1.4 billion km)' }, // reference: the Sun
      { label: 'Diameter', value: '≈ 116,000 km (about 9× Earth)' }, // size
      { label: 'Surface', value: 'Not applicable — no solid surface to land on' }, // no landing
      { label: 'Atmosphere', value: 'Mostly hydrogen and helium' }, // air
      { label: 'Hazard', value: 'Ring particles and radiation' }, // hazard
    ], equipment: ['Orbital station', 'Shielding', 'Energy routing tools'], memorable: ['Rings are ice and rock pieces.', 'Less dense than water on average.', 'Titan has a thick atmosphere.'], sourceIds: ['nasa-saturn'],
    fictionNote: 'Simulation Fiction: the orbital station and rogue drone are invented for this game.' },
  sun: { destinationId: 'sun', name: 'The Sun — Remote Observation Deck', category: 'Star', theme: 'sun', diagram: 'star-remote', // the Sun (remote only)
    location: 'Centre of the solar system', facts: [
      { label: 'Distance from Earth', value: '≈ 1 AU (≈ 150 million km)' }, // reference: Earth
      { label: 'Diameter', value: '≈ 1.39 million km (≈ 109 Earths)' }, // size
      { label: 'Surface', value: 'Not applicable — a ball of hot plasma; no landing possible' }, // no landing
      { label: 'Power source', value: 'Nuclear fusion in the core' }, // fusion
      { label: 'Hazard', value: 'Intense light, heat and radiation; flares' }, // hazard
    ], equipment: ['Certified solar filters', 'Radiation shielding'], memorable: ['Sunlight takes about 8 minutes to reach Earth.', 'Sunspots are cooler magnetic regions.', 'Never look at the Sun directly.'], sourceIds: ['nasa-sun'],
    fictionNote: 'Simulation Fiction: the observation deck is a protected, remote station invented for this game.' },
  asteroid: { destinationId: 'asteroid', name: 'Training Asteroid KT-7', category: 'Asteroid (fictional training site)', theme: 'asteroid', diagram: 'solar-system', // fictional asteroid
    location: 'Fictional main-belt object between Mars and Jupiter', facts: [
      { label: 'Distance from Sun', value: 'Main belt ≈ 2.2–3.2 AU (real region); KT-7 itself is fictional' }, // honest
      { label: 'Diameter', value: '≈ 2 km (fictional)' }, // fictional size
      { label: 'Atmosphere', value: 'None' }, // air
      { label: 'Gravity', value: 'Extremely weak — tethers required' }, // gravity
    ], equipment: ['Tether', 'Sample containers', 'Thrusters'], memorable: ['Asteroids are rocky leftovers of planet formation.', 'Main-belt asteroids are usually far apart.', 'Samples reveal early solar-system chemistry.'], sourceIds: ['nasa-asteroids'],
    fictionNote: 'Simulation Fiction: KT-7 is an invented training asteroid.' },
  comet: { destinationId: 'comet', name: 'Comet Lumen-K Flyby', category: 'Comet (fictional flyby simulation)', theme: 'comet', diagram: 'conceptual', // fictional comet
    location: 'Fictional comet on an elongated orbit around the Sun', facts: [
      { label: 'Distance', value: 'Changes along its orbit (fictional object)' }, // honest
      { label: 'Nucleus size', value: '≈ 4 km (fictional)' }, // fictional size
      { label: 'Atmosphere', value: 'Temporary coma of gas and dust near the Sun' }, // coma
      { label: 'Hazard', value: 'Dust jets — protected flyby only' }, // hazard
    ], equipment: ['Dust shield', 'Ice scanner'], memorable: ['Comets are icy leftovers from the solar system’s birth.', 'Tails point away from the Sun.', 'The solid centre is the nucleus.'], sourceIds: ['nasa-comets'],
    fictionNote: 'Simulation Fiction: Lumen-K is an invented comet.' },
  exoplanet: { destinationId: 'exoplanet', name: 'Aurelia b (simulated exoplanet)', category: 'Exoplanet (fictional simulation)', theme: 'exoplanet', diagram: 'conceptual', // fictional exoplanet
    location: 'Fictional planet orbiting a fictional star', facts: [
      { label: 'Distance from Earth', value: 'Fictional — real exoplanets are light-years away (1 ly ≈ 9.46 trillion km)' }, // honest scale
      { label: 'Size', value: 'Fictional super-Earth' }, // fictional size
      { label: 'Atmosphere', value: 'Simulated signals to analyse' }, // simulated
      { label: 'Life', value: 'Unknown — habitability does not prove life' }, // caution
    ], equipment: ['Space telescope', 'Spectrometer'], memorable: ['Most exoplanets are found by transits.', 'Spectroscopy reveals atmospheric gases.', 'Habitable zone ≠ life.'], sourceIds: ['nasa-exoplanets'],
    fictionNote: 'Simulation Fiction: Aurelia b and its signals are invented.' },
  satellite: { destinationId: 'satellite', name: 'Relay-9 Servicing Mission', category: 'Artificial satellite (fictional)', theme: 'orbit', diagram: 'earth-orbit', // fictional satellite
    location: 'Fictional satellite in low Earth orbit', facts: [
      { label: 'Altitude above Earth', value: '≈ 500 km (illustrative low Earth orbit)' }, // reference: Earth surface
      { label: 'Size', value: 'Bus-sized spacecraft (fictional)' }, // size
      { label: 'Atmosphere', value: 'Not applicable — vacuum' }, // vacuum
      { label: 'Hazard', value: 'Space debris, radiation' }, // hazard
    ], equipment: ['Tether', 'Tool kit', 'Spare solar panel'], memorable: ['Artificial satellites are human-made.', 'Many run on solar power.', 'They keep "falling around" Earth.'], sourceIds: ['nasa-satellites', 'nasa-debris'],
    fictionNote: 'Simulation Fiction: Relay-9 is an invented satellite.' },
  station: { destinationId: 'station', name: 'Horizon Research Station', category: 'Space station (fictional)', theme: 'orbit', diagram: 'earth-orbit', // fictional station
    location: 'Fictional station in low Earth orbit', facts: [
      { label: 'Altitude above Earth', value: '≈ 400 km (similar to the real ISS)' }, // reference: Earth surface
      { label: 'Orbit time', value: '≈ 90 minutes per lap' }, // ISS-like
      { label: 'Atmosphere', value: 'Inside: engineered life support. Outside: vacuum' }, // air
      { label: 'Hazard', value: 'CO₂ build-up, debris' }, // hazard
    ], equipment: ['Oxygen generator', 'CO₂ scrubber', 'Patch kit'], memorable: ['Crews float because they are in free fall.', 'Life support recycles air and water.', 'About 16 sunrises a day.'], sourceIds: ['nasa-iss'],
    fictionNote: 'Simulation Fiction: Horizon Research Station is invented.' },
};
