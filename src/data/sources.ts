// src/data/sources.ts — the Source Registry: every fact and question points to one of these.
// The AI question generator (api/generate-questions.ts) may ONLY use statements listed here.
import type { Source } from '../types.js'; // the Source shape from types.ts

const REVIEWED = '2026-10-29'; // date the bundled statements were reviewed for this build

export const SOURCES: Source[] = [ // the registry itself (an array of Source objects)
  { id: 'nasa-mars', title: 'NASA Science — Mars', url: 'https://science.nasa.gov/mars/', category: 'Planet', retrievedAt: REVIEWED, statements: [
    'Mars is the fourth planet from the Sun.', // basic position
    'Mars has a thin atmosphere made mostly of carbon dioxide.', // atmosphere
    'Mars has two small moons, Phobos and Deimos.', // moons
    'Mars gets its red colour from iron oxide (rust) in its dust and rocks.', // colour
    'Olympus Mons on Mars is the largest volcano known in the solar system.', // landmark
    'Surface gravity on Mars is about 38 percent of Earth gravity.', // gravity
    'A day on Mars (a sol) lasts about 24 hours and 37 minutes.', // day length
    'Mars is about half the diameter of Earth.', // size
  ] },
  { id: 'nasa-moon', title: 'NASA Science — Earth’s Moon', url: 'https://science.nasa.gov/moon/', category: 'Moon', retrievedAt: REVIEWED, statements: [
    'The Moon is Earth’s only natural satellite.', // definition
    'The Moon is on average about 384,400 km from Earth.', // distance
    'The Moon has almost no atmosphere (an extremely thin exosphere).', // atmosphere
    'Gravity on the Moon is about one-sixth of Earth gravity.', // gravity
    'The Moon always shows Earth the same side because it is tidally locked.', // tidal locking
    'Twelve astronauts walked on the Moon during NASA’s Apollo programme (1969–1972).', // history
    'Craters on the Moon were formed mostly by impacts of asteroids and comets.', // craters
  ] },
  { id: 'nasa-sun', title: 'NASA Science — The Sun', url: 'https://science.nasa.gov/sun/', category: 'Star', retrievedAt: REVIEWED, statements: [
    'The Sun is a star at the centre of our solar system.', // definition
    'The Sun is a ball of hot plasma powered by nuclear fusion of hydrogen into helium in its core.', // power source
    'Earth is about 150 million km (1 AU) from the Sun.', // distance
    'Sunlight takes about 8 minutes to reach Earth.', // light travel
    'The Sun’s diameter is about 109 times that of Earth.', // size
    'Sunspots are cooler, darker regions caused by magnetic activity.', // sunspots
    'Never look directly at the Sun without proper certified solar filters.', // safety
  ] },
  { id: 'nasa-venus', title: 'NASA Science — Venus', url: 'https://science.nasa.gov/venus/', category: 'Planet', retrievedAt: REVIEWED, statements: [
    'Venus is the second planet from the Sun.', // position
    'Venus is the hottest planet in the solar system, with surface temperatures around 465 °C.', // heat
    'Venus has a thick carbon dioxide atmosphere with clouds of sulfuric acid.', // atmosphere
    'Surface pressure on Venus is about 90 times that on Earth.', // pressure
    'Venus spins backwards (retrograde) compared with most planets.', // rotation
    'A day on Venus is longer than its year.', // day length
    'Venus is similar in size to Earth.', // size
  ] },
  { id: 'nasa-saturn', title: 'NASA Science — Saturn', url: 'https://science.nasa.gov/saturn/', category: 'Planet', retrievedAt: REVIEWED, statements: [
    'Saturn is the sixth planet from the Sun and a gas giant.', // definition
    'Saturn is made mostly of hydrogen and helium and has no solid surface to land on.', // no surface
    'Saturn’s rings are made of countless pieces of ice and rock.', // rings
    'Titan is Saturn’s largest moon and has a thick atmosphere.', // Titan
    'Saturn is about 9.5 AU from the Sun on average.', // distance
    'Saturn has the lowest average density of the planets, less than water.', // density
  ] },
  { id: 'nasa-asteroids', title: 'NASA Science — Asteroids', url: 'https://science.nasa.gov/solar-system/asteroids/', category: 'Asteroid', retrievedAt: REVIEWED, statements: [
    'Asteroids are rocky, airless remnants left over from the formation of the solar system.', // definition
    'Most known asteroids orbit the Sun in the main belt between Mars and Jupiter.', // location
    'Asteroids range in size from a few metres to hundreds of kilometres.', // size
    'Small asteroids have very weak gravity.', // gravity
    'Scientists study asteroid samples to learn about the early solar system.', // samples
    'Some asteroids are rubble piles: loose collections of rock held together by gravity.', // structure
  ] },
  { id: 'nasa-comets', title: 'NASA Science — Comets', url: 'https://science.nasa.gov/solar-system/comets/', category: 'Comet', retrievedAt: REVIEWED, statements: [
    'Comets are frozen leftovers from the formation of the solar system made of ice, dust and rock.', // definition
    'When a comet comes near the Sun, it heats up and releases gas and dust, forming a coma and tails.', // activity
    'A comet’s tails point away from the Sun.', // tail direction
    'Many short-period comets come from the Kuiper Belt; long-period comets are thought to come from the Oort Cloud.', // origin
    'The solid centre of a comet is called the nucleus.', // nucleus
  ] },
  { id: 'nasa-exoplanets', title: 'NASA Science — Exoplanets', url: 'https://science.nasa.gov/exoplanets/', category: 'Exoplanet', retrievedAt: REVIEWED, statements: [
    'An exoplanet is a planet outside our solar system, usually orbiting another star.', // definition
    'Thousands of exoplanets have been confirmed.', // count
    'The transit method detects an exoplanet by the small dip in a star’s brightness when the planet passes in front.', // transit
    'The habitable zone is the range of distances where liquid water could exist on a planet’s surface.', // habitable zone
    'Being in the habitable zone does not mean a planet has life.', // caution
    'Telescopes can study exoplanet atmospheres by analysing starlight that passes through them (spectroscopy).', // spectroscopy
  ] },
  { id: 'nasa-satellites', title: 'NASA Space Place — What Is a Satellite?', url: 'https://spaceplace.nasa.gov/satellite/en/', category: 'Artificial satellite', retrievedAt: REVIEWED, statements: [
    'A satellite is any object that orbits a larger object; the Moon is a natural satellite.', // definition
    'Artificial satellites are human-made machines launched into orbit.', // artificial
    'Satellites are used for communication, weather forecasting, navigation and science.', // uses
    'Many satellites use solar panels for electrical power.', // power
    'Satellites stay in orbit because they move sideways fast enough that they keep falling around Earth.', // orbit
  ] },
  { id: 'nasa-iss', title: 'NASA — International Space Station', url: 'https://www.nasa.gov/international-space-station/', category: 'Space station', retrievedAt: REVIEWED, statements: [
    'The International Space Station orbits Earth about every 90 minutes.', // orbit period
    'The ISS orbits roughly 400 km above Earth.', // altitude
    'Astronauts on the ISS appear weightless because they are in continuous free fall around Earth.', // microgravity
    'The ISS uses life-support systems to provide oxygen, remove carbon dioxide and recycle water.', // life support
    'The ISS is a partnership of several space agencies.', // partnership
  ] },
  { id: 'nasa-earth', title: 'NASA Science — Earth', url: 'https://science.nasa.gov/earth/', category: 'Planet', retrievedAt: REVIEWED, statements: [
    'Earth is the third planet from the Sun and the only place known to have life.', // basics
    'Earth’s atmosphere is mostly nitrogen and oxygen.', // atmosphere
  ] },
  { id: 'nasa-meteors', title: 'NASA Science — Meteors & Meteorites', url: 'https://science.nasa.gov/solar-system/meteors-meteorites/', category: 'Meteoroid', retrievedAt: REVIEWED, statements: [
    'A meteoroid is a small rock or particle in space.', // meteoroid
    'A meteor is the streak of light seen when a meteoroid burns up in Earth’s atmosphere.', // meteor
    'A meteorite is a piece that survives the trip and lands on the ground.', // meteorite
  ] },
  { id: 'nasa-solar-system', title: 'NASA Science — Our Solar System', url: 'https://science.nasa.gov/solar-system/', category: 'System', retrievedAt: REVIEWED, statements: [
    'The solar system has eight planets orbiting the Sun.', // planets
    'Dwarf planets such as Pluto and Ceres are smaller worlds that have not cleared their orbital neighbourhood.', // dwarf planets
    'The Kuiper Belt is a region of icy bodies beyond Neptune.', // Kuiper Belt
    'The Oort Cloud is a distant, inferred reservoir of icy objects that has not been directly observed.', // Oort Cloud
  ] },
  { id: 'nasa-universe', title: 'NASA Science — Universe', url: 'https://science.nasa.gov/universe/', category: 'Universe', retrievedAt: REVIEWED, statements: [
    'Galaxies are huge systems of stars, gas, dust and dark matter held together by gravity.', // galaxies
    'Black holes are regions where gravity is so strong that not even light can escape.', // black holes
    'Nebulae are clouds of gas and dust where stars can form.', // nebulae
    'Neutron stars are extremely dense remnants of massive stars; pulsars are rotating neutron stars that emit beams.', // neutron stars
    'White dwarfs are the hot, dense remnants of stars like the Sun.', // white dwarfs
    'Scientists do not know whether the entire universe is infinite.', // honest uncertainty
  ] },
  { id: 'spaceplace-aurora', title: 'NASA Space Place — Auroras', url: 'https://spaceplace.nasa.gov/aurora/en/', category: 'Event', retrievedAt: REVIEWED, statements: [
    'Auroras are lights in the sky caused by charged particles from the Sun interacting with Earth’s atmosphere near the poles.', // auroras
  ] },
  { id: 'spaceplace-eclipse', title: 'NASA Space Place — Eclipses', url: 'https://spaceplace.nasa.gov/eclipses/en/', category: 'Event', retrievedAt: REVIEWED, statements: [
    'A solar eclipse happens when the Moon passes between the Sun and Earth.', // solar eclipse
    'A lunar eclipse happens when Earth’s shadow falls on the Moon.', // lunar eclipse
  ] },
  { id: 'nasa-webb', title: 'NASA — James Webb Space Telescope', url: 'https://science.nasa.gov/mission/webb/', category: 'Space telescope', retrievedAt: REVIEWED, statements: [
    'The James Webb Space Telescope observes mainly in infrared light.', // infrared
    'Webb operates near the Sun–Earth L2 point, about 1.5 million km from Earth.', // location
  ] },
  { id: 'nasa-debris', title: 'NASA — Orbital Debris Program Office', url: 'https://orbitaldebris.jsc.nasa.gov/', category: 'Space debris', retrievedAt: REVIEWED, statements: [
    'Orbital debris is human-made objects in orbit that no longer serve a purpose.', // definition
    'Even tiny debris can damage spacecraft because it travels at very high speed.', // danger
  ] },
];

export const SOURCE_BY_ID: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s])); // quick lookup: id → source

export function sourceUrl(id: string): string { // returns the URL for a source ID (or the NASA hub as a safe fallback)
  return SOURCE_BY_ID[id]?.url ?? 'https://science.nasa.gov/'; // "?." avoids a crash if the ID is unknown
}
