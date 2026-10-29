// src/data/catalogue.ts — Know Your Space content: every catalogue category has a sourced study card.
// This is a practical discovery catalogue, not an exhaustive or mutually exclusive scientific taxonomy.
import type { CatalogueEntry, CatalogueGroup } from '../types'; // types for a card and its group

// Helper "c" builds a card with less typing. Arguments, in order:
// id, name, group, category, [beginner, intermediate, advanced], vocabulary, hazards, equipment, facts, sources, extra options
function c(
  id: string, name: string, group: CatalogueGroup, category: string, // identity of the card
  levels: [string, string, string], // beginner / intermediate / advanced text
  vocabulary: string[], hazards: string[], equipment: string[], facts: string[], sourceIds: string[], // learning content
  extra: Partial<CatalogueEntry> = {}, // optional fields (expeditionId, fictional)
): CatalogueEntry { // returns a complete CatalogueEntry
  return { id, name, group, category, beginner: levels[0], intermediate: levels[1], advanced: levels[2], vocabulary, hazards, equipment, facts, sourceIds, ...extra }; // spread "extra" last so it can add fields
}

export const CATALOGUE: CatalogueEntry[] = [ // the full list of study cards
  // ---------------- A. NATURAL OBJECTS ----------------
  c('mars', 'Mars', 'natural', 'Planet', [ // Mars — playable
    'Mars is a cold, dusty, rocky planet — the fourth from the Sun.', // beginner
    'Mars has a thin carbon-dioxide atmosphere, about 38% of Earth’s gravity and red iron-oxide dust.', // intermediate
    'Low pressure means liquid water is unstable on the surface today; habitats need pressurisation, radiation shielding and engineered life support.', // advanced
  ], ['sol', 'iron oxide', 'regolith', 'habitat'], ['Dust storms', 'Thin air', 'Radiation', 'Cold nights'], ['Pressurised suit', 'Solar panels', 'Dust filters'],
  ['Home of Olympus Mons, the largest known volcano in the solar system.', 'Has two small moons: Phobos and Deimos.', 'A Martian day (sol) is about 24 h 37 min.'], ['nasa-mars'], { expeditionId: 'exp-mars' }),
  c('venus', 'Venus', 'natural', 'Planet', [ // Venus — campaign destination
    'Venus is the second planet from the Sun and the hottest planet.', // beginner
    'Its thick carbon-dioxide atmosphere traps heat (around 465 °C) and its clouds contain sulfuric acid.', // intermediate
    'Surface pressure is about 90 times Earth’s; any visit needs heavy heat and pressure protection. Venus also spins backwards.', // advanced
  ], ['greenhouse effect', 'retrograde', 'pressure'], ['Extreme heat', 'Crushing pressure', 'Acid clouds'], ['Heat shield', 'Pressure hull'],
  ['Hotter than Mercury despite being farther from the Sun.', 'A Venus day is longer than its year.', 'Similar in size to Earth.'], ['nasa-venus']),
  c('saturn', 'Saturn', 'natural', 'Planet', [ // Saturn — campaign destination (orbital station only)
    'Saturn is a giant planet famous for its bright rings.', // beginner
    'It is a gas giant made mostly of hydrogen and helium with no solid surface to land on.', // intermediate
    'Its rings are countless pieces of ice and rock; its moon Titan has a thick atmosphere.', // advanced
  ], ['gas giant', 'ring system', 'Titan'], ['No landing surface', 'Ring particles', 'Radiation'], ['Orbital station', 'Shielding'],
  ['Saturn is less dense than water on average.', 'Titan is larger than the planet Mercury.', 'About 9.5 AU from the Sun.'], ['nasa-saturn']),
  c('earth', 'Earth', 'natural', 'Planet', [ // Earth — campaign hub
    'Earth is our home planet, the third from the Sun.', // beginner
    'Its nitrogen–oxygen atmosphere and liquid water support life.', // intermediate
    'Earth is the only place currently known to host life.', // advanced
  ], ['atmosphere', 'biosphere'], ['Launch forces'], ['Launch suit'], ['About 1 AU from the Sun.', 'Has one natural satellite: the Moon.', 'About 71% of the surface is water.'], ['nasa-earth']),
  c('dwarf-planets', 'Dwarf planets', 'natural', 'Dwarf planet', [ // dwarf planets
    'Dwarf planets are small round worlds like Pluto and Ceres.', // beginner
    'They orbit the Sun and are round, but have not cleared their orbital neighbourhood.', // intermediate
    'Many are icy bodies in the Kuiper Belt; Ceres lives in the asteroid belt.', // advanced
  ], ['Pluto', 'Ceres', 'orbital neighbourhood'], ['Extreme cold'], ['Insulated suit'], ['Pluto was reclassified as a dwarf planet in 2006.'], ['nasa-solar-system']),
  c('moon', 'Earth’s Moon', 'natural', 'Moon', [ // the Moon — playable
    'The Moon is Earth’s natural satellite.', // beginner
    'It is about 384,400 km away on average, with one-sixth of Earth’s gravity and almost no air.', // intermediate
    'It is tidally locked, so we always see the same side; its craters come mainly from impacts.', // advanced
  ], ['natural satellite', 'tidal locking', 'crater', 'regolith'], ['No breathable air', 'Temperature extremes', 'Sharp dust'], ['Oxygen supply', 'Suit cooling', 'Relay radio'],
  ['Twelve Apollo astronauts walked on it (1969–1972).', 'Its gravity is about 1/6 of Earth’s.', 'Earthrise can be seen from lunar orbit.'], ['nasa-moon'], { expeditionId: 'exp-moon' }),
  c('moons', 'Natural satellites (moons)', 'natural', 'Moon', [ // moons in general
    'A moon is a natural object that orbits a planet.', // beginner
    'Many planets have moons; Mercury and Venus have none.', // intermediate
    'Moons like Europa and Enceladus may hide oceans under their ice — that does not prove life.', // advanced
  ], ['natural satellite', 'orbit'], ['Varies by moon'], ['Varies by mission'], ['A natural satellite is NOT human-made.'], ['nasa-satellites']),
  c('sun', 'The Sun', 'natural', 'Star', [ // the Sun — playable
    'The Sun is a star — the one at the centre of our solar system.', // beginner
    'It is a ball of hot plasma powered by nuclear fusion; sunlight takes about 8 minutes to reach Earth.', // intermediate
    'Magnetic activity makes sunspots, flares and coronal mass ejections that affect space weather.', // advanced
  ], ['star', 'fusion', 'plasma', 'sunspot'], ['Intense radiation', 'Solar flares', 'Never look directly at it'], ['Solar filters', 'Radiation shielding'],
  ['About 109 Earths fit across its diameter.', 'Earth is about 1 AU (≈150 million km) away.', 'Nobody can land on a star.'], ['nasa-sun'], { expeditionId: 'exp-sun' }),
  c('stars', 'Stars', 'natural', 'Star', [ // stars in general
    'Stars are giant glowing balls of hot gas.', // beginner
    'They shine by nuclear fusion in their cores.', // intermediate
    'A star’s mass decides its life: Sun-like stars become white dwarfs; massive ones may explode as supernovae.', // advanced
  ], ['fusion', 'luminosity'], ['Radiation'], ['Remote observation'], ['The Sun is an ordinary star.'], ['nasa-sun', 'nasa-universe']),
  c('exoplanet', 'Exoplanets', 'natural', 'Exoplanet', [ // exoplanets — playable (fictional simulation)
    'An exoplanet is a planet outside our solar system.', // beginner
    'Most are found with the transit method: a star dims slightly when a planet passes in front.', // intermediate
    'Spectroscopy of starlight through an atmosphere reveals gases; a habitable-zone orbit does not prove life.', // advanced
  ], ['transit', 'habitable zone', 'spectroscopy'], ['Unknown conditions', 'Enormous distances'], ['Telescope', 'Spectrometer'],
  ['Thousands have been confirmed.', 'Potential habitability ≠ confirmed life.'], ['nasa-exoplanets'], { expeditionId: 'exp-exoplanet' }),
  c('asteroid', 'Asteroids', 'natural', 'Asteroid', [ // asteroids — playable (fictional site)
    'Asteroids are rocky leftovers from when the planets formed.', // beginner
    'Most orbit in the main belt between Mars and Jupiter; their gravity is very weak.', // intermediate
    'Some are rubble piles; returned samples reveal the early solar system’s chemistry.', // advanced
  ], ['main belt', 'rubble pile', 'sample return'], ['Very low gravity', 'Loose rocks', 'Dust'], ['Tether', 'Sample container'],
  ['Sizes range from metres to hundreds of km.', 'They have no air.'], ['nasa-asteroids'], { expeditionId: 'exp-asteroid' }),
  c('comet', 'Comets', 'natural', 'Comet', [ // comets — playable (fictional flyby)
    'Comets are icy balls of dust and rock.', // beginner
    'Near the Sun they release gas and dust, forming a glowing coma and tails.', // intermediate
    'Tails point away from the Sun; long-period comets are thought to come from the inferred Oort Cloud.', // advanced
  ], ['nucleus', 'coma', 'tail', 'Oort Cloud'], ['Dust jets', 'Unstable surface'], ['Dust shield', 'Spectrometer'],
  ['A comet’s solid centre is its nucleus.', 'Comets are frozen leftovers from the solar system’s birth.'], ['nasa-comets'], { expeditionId: 'exp-comet' }),
  c('meteoroids', 'Meteoroids', 'natural', 'Meteoroid', [ // meteoroids
    'A meteoroid is a small rock or particle travelling through space.', // beginner
    'When one burns up in Earth’s air we see a meteor; a surviving piece on the ground is a meteorite.', // intermediate
    'Meteoroids are often fragments of asteroids or dust shed by comets.', // advanced
  ], ['meteoroid', 'meteor', 'meteorite'], ['High-speed impacts'], ['Micrometeoroid shielding'], ['A meteor is a streak of light, not a floating rock.'], ['nasa-meteors']),
  c('brown-dwarfs', 'Brown dwarfs', 'natural', 'Brown dwarf', [ // brown dwarfs
    'Brown dwarfs are objects bigger than planets but too small to be true stars.', // beginner
    'They are not massive enough to sustain hydrogen fusion like the Sun.', // intermediate
    'They glow faintly, mostly in infrared light.', // advanced
  ], ['failed star', 'infrared'], ['Strong gravity'], ['Infrared telescope'], ['Sometimes called "failed stars".'], ['nasa-universe']),
  c('white-dwarfs', 'White dwarfs', 'natural', 'White dwarf', [ // white dwarfs
    'A white dwarf is the hot leftover core of a star like the Sun.', // beginner
    'It packs about a Sun’s worth of mass into an Earth-sized ball.', // intermediate
    'It no longer fuses hydrogen and slowly cools over billions of years.', // advanced
  ], ['stellar remnant', 'density'], ['Intense gravity'], ['Remote observation'], ['Our Sun will one day become a white dwarf.'], ['nasa-universe']),
  c('neutron-stars', 'Neutron stars & pulsars', 'natural', 'Neutron star', [ // neutron stars
    'Neutron stars are tiny, super-dense leftovers of exploded massive stars.', // beginner
    'Pulsars are spinning neutron stars that sweep beams of radiation like lighthouses.', // intermediate
    'A teaspoon of neutron-star matter would weigh billions of tonnes on Earth.', // advanced
  ], ['pulsar', 'supernova remnant'], ['Extreme gravity and radiation'], ['Radio telescope'], ['Only about city-sized across.'], ['nasa-universe']),
  c('black-holes', 'Black holes', 'natural', 'Black hole', [ // black holes
    'A black hole is a place where gravity is so strong that light cannot escape.', // beginner
    'Its boundary is called the event horizon.', // intermediate
    'Black holes are studied by their effect on nearby matter, light and gravitational waves.', // advanced
  ], ['event horizon', 'accretion disk'], ['Nothing can return from inside'], ['Observe from very far away'], ['Never a landing destination.'], ['nasa-universe']),
  // ---------------- B. SYSTEMS, STRUCTURES, REGIONS ----------------
  c('planetary-systems', 'Planetary systems', 'systems', 'Planetary system', ['A star with planets orbiting it.', 'Our solar system has eight planets.', 'Thousands of other planetary systems are known.'], ['solar system'], ['Distance'], ['Telescopes'], ['Our system is about 4.6 billion years old.'], ['nasa-solar-system']), // planetary systems
  c('binary-stars', 'Binary & multiple stars', 'systems', 'Star system', ['Two or more stars orbiting each other.', 'Many stars in our galaxy have companions.', 'Planets can orbit one or both stars.'], ['binary', 'barycentre'], ['Complex orbits'], ['Telescopes'], ['A binary system has two stars.'], ['nasa-universe']), // binary stars
  c('rings', 'Planetary rings', 'systems', 'Rings', ['Rings are bands of ice and rock around planets.', 'Saturn’s are brightest; Jupiter, Uranus and Neptune also have rings.', 'Ring particles range from dust to house-sized chunks.'], ['ring particle'], ['Collisions'], ['Shielding'], ['All four giant planets have rings.'], ['nasa-saturn']), // rings
  c('asteroid-belt', 'Asteroid belt', 'systems', 'Belt', ['A region between Mars and Jupiter with many asteroids.', 'Despite films, asteroids there are usually far apart.', 'Ceres, a dwarf planet, is the largest object in it.'], ['main belt'], ['Rare collisions'], ['Navigation'], ['Mostly empty space.'], ['nasa-asteroids']), // asteroid belt
  c('kuiper-belt', 'Kuiper Belt', 'systems', 'Belt', ['An icy region beyond Neptune.', 'Home of Pluto and many trans-Neptunian objects.', 'A source of many short-period comets.'], ['trans-Neptunian'], ['Extreme cold'], ['Nuclear power source'], ['Beyond Neptune’s orbit.'], ['nasa-solar-system']), // Kuiper Belt
  c('oort-cloud', 'Oort Cloud', 'systems', 'Region', ['A huge, distant shell of icy objects thought to surround the solar system.', 'It is inferred from comet orbits — it has not been directly observed.', 'It may extend a large fraction of the way to the nearest stars.'], ['inferred', 'long-period comet'], ['Unknown'], ['None yet'], ['An inferred distant reservoir.'], ['nasa-solar-system']), // Oort Cloud
  c('nebulae', 'Nebulae', 'systems', 'Nebula', ['Clouds of gas and dust in space.', 'Some are stellar nurseries where stars form.', 'Others are shells thrown off by dying stars.'], ['stellar nursery'], ['Distance'], ['Telescopes'], ['Many glow from nearby hot stars.'], ['nasa-universe']), // nebulae
  c('molecular-clouds', 'Molecular clouds', 'systems', 'Cloud', ['Cold, dense clouds of gas.', 'Stars are born when parts collapse under gravity.', 'They contain molecules like hydrogen and carbon monoxide.'], ['collapse'], ['Distance'], ['Radio telescope'], ['Birthplaces of stars.'], ['nasa-universe']), // molecular clouds
  c('star-clusters', 'Star clusters', 'systems', 'Cluster', ['Groups of stars born together.', 'Open clusters are loose; globular clusters are dense and old.', 'Clusters help astronomers measure star ages.'], ['open cluster', 'globular cluster'], ['Distance'], ['Telescopes'], ['The Pleiades is an open cluster.'], ['nasa-universe']), // star clusters
  c('galaxies', 'Galaxies', 'systems', 'Galaxy', ['Huge collections of stars, gas and dust.', 'We live in the Milky Way galaxy.', 'Galaxies are held together by gravity, including dark matter.'], ['Milky Way', 'spiral', 'elliptical'], ['Unimaginable distance'], ['Telescopes'], ['Billions of galaxies exist in the observable universe.'], ['nasa-universe']), // galaxies
  c('galaxy-groups', 'Galaxy groups & clusters', 'systems', 'Large-scale structure', ['Galaxies gather into groups, clusters and superclusters.', 'The Milky Way belongs to the Local Group.', 'These form a cosmic web.'], ['Local Group', 'supercluster'], ['Distance'], ['Telescopes'], ['The Andromeda galaxy is in our Local Group.'], ['nasa-universe']), // galaxy groups
  c('interstellar', 'Interstellar & intergalactic space', 'systems', 'Region', ['The space between stars and between galaxies.', 'It is not totally empty: it contains thin gas and dust.', 'We do not know whether the whole universe is infinite.'], ['interstellar medium'], ['Radiation', 'Distance'], ['None — far beyond current travel'], ['Voyager 1 has entered interstellar space.'], ['nasa-universe']), // interstellar
  // ---------------- C. HUMAN-MADE OBJECTS ----------------
  c('satellite', 'Artificial satellites', 'human-made', 'Artificial satellite', [ // satellites — playable
    'Artificial satellites are human-made machines that orbit Earth or other worlds.', // beginner
    'They help with communication, weather, navigation (like GPS) and science; many use solar panels.', // intermediate
    'A satellite stays up because it moves sideways so fast that it keeps "falling around" Earth.', // advanced
  ], ['orbit', 'solar panel', 'artificial'], ['Space debris', 'Radiation', 'Power failure'], ['Tether', 'Tool kit', 'Spare panels'],
  ['The Moon is a natural satellite; these are artificial.', 'Thousands orbit Earth today.'], ['nasa-satellites'], { expeditionId: 'exp-satellite' }),
  c('station', 'Space stations', 'human-made', 'Space station', [ // stations — playable (fictional station)
    'A space station is a home and laboratory in orbit.', // beginner
    'The ISS orbits about 400 km up and circles Earth about every 90 minutes.', // intermediate
    'Crews float because the station is in continuous free fall; life support recycles air and water.', // advanced
  ], ['microgravity', 'life support', 'module'], ['Air leaks', 'CO₂ build-up', 'Debris'], ['Oxygen generator', 'CO₂ scrubber'],
  ['About 16 sunrises a day for ISS crews.', 'Built by several space agencies.'], ['nasa-iss'], { expeditionId: 'exp-station' }),
  c('telescopes', 'Space telescopes', 'human-made', 'Space telescope', ['Telescopes placed in space to avoid Earth’s blurry air.', 'Webb sees mostly infrared light; Hubble sees visible and ultraviolet too.', 'Webb works near the Sun–Earth L2 point, about 1.5 million km from Earth.'], ['infrared', 'L2'], ['Cold', 'Distance'], ['Sunshield'], ['Space telescopes see light our atmosphere blocks.'], ['nasa-webb']), // telescopes
  c('probes', 'Probes, orbiters, landers & rovers', 'human-made', 'Spacecraft', ['Robots we send to explore.', 'Orbiters circle a world, landers touch down, rovers drive around.', 'Probes like Voyager fly past many worlds.'], ['orbiter', 'lander', 'rover'], ['Landing risk', 'Communication delays'], ['Radio antenna'], ['Rovers have explored Mars for decades.'], ['nasa-mars']), // robotic explorers
  c('crew-craft', 'Crew & cargo spacecraft', 'human-made', 'Spacecraft', ['Spacecraft that carry people or supplies.', 'They dock with stations and bring crews home.', 'Re-entry needs a heat shield.'], ['docking', 're-entry'], ['Re-entry heat'], ['Heat shield'], ['Cargo craft resupply the ISS.'], ['nasa-iss']), // crew craft
  c('launch-vehicles', 'Launch vehicles', 'human-made', 'Rocket', ['Rockets that carry spacecraft to space.', 'They burn fuel to push exhaust down and the rocket up.', 'Most use stages that drop away when empty.'], ['stage', 'thrust'], ['Explosions', 'G-forces'], ['Launch suit'], ['Newton’s third law makes rockets work.'], ['nasa-solar-system']), // rockets
  c('debris', 'Space debris', 'human-made', 'Space debris', ['Old, broken human-made objects left in orbit.', 'Even tiny pieces move fast enough to damage spacecraft.', 'Agencies track larger debris to help spacecraft avoid it.'], ['orbital debris'], ['High-speed impacts'], ['Shielding', 'Tracking'], ['A fleck of paint can chip a window.'], ['nasa-debris']), // debris
  // ---------------- EVENTS & PHENOMENA ----------------
  c('meteors', 'Meteors & meteor showers', 'events', 'Event', ['A meteor is a streak of light when a meteoroid burns up in our air.', 'Meteor showers happen when Earth passes through comet dust.', 'A meteor is an event in the atmosphere, not a rock floating in space.'], ['meteor shower', 'radiant'], ['None from the ground'], ['Your eyes!'], ['"Shooting stars" are meteors, not stars.'], ['nasa-meteors']), // meteors
  c('meteorites', 'Meteorites', 'events', 'Recovered material', ['A meteorite is a space rock that landed on Earth.', 'Scientists study them to learn about asteroids and planets.', 'Some meteorites even come from Mars and the Moon.'], ['meteorite'], ['None'], ['Gloves for samples'], ['Meteorites are recovered material on the ground.'], ['nasa-meteors']), // meteorites
  c('eclipses', 'Eclipses', 'events', 'Event', ['An eclipse is when one body blocks light from another.', 'Solar eclipse: Moon between Sun and Earth. Lunar eclipse: Earth’s shadow on the Moon.', 'Never look at a solar eclipse without certified eclipse glasses.'], ['umbra', 'totality'], ['Eye damage from the Sun'], ['Eclipse glasses'], ['Total solar eclipses are rare at any one place.'], ['spaceplace-eclipse']), // eclipses
  c('auroras', 'Auroras', 'events', 'Event', ['Colourful lights in the sky near the poles.', 'Caused by charged particles from the Sun hitting our upper atmosphere.', 'Strong solar storms push auroras farther from the poles.'], ['aurora', 'magnetosphere'], ['None'], ['Warm clothes'], ['Other planets have auroras too.'], ['spaceplace-aurora']), // auroras
  c('solar-flares', 'Solar flares', 'events', 'Event', ['Sudden bright bursts on the Sun.', 'They release radiation that can disturb radio communication.', 'Astronauts need shielding during strong events.'], ['flare', 'space weather'], ['Radiation'], ['Shielding'], ['Flares come from tangled magnetic fields.'], ['nasa-sun']), // flares
  c('cmes', 'Coronal mass ejections', 'events', 'Event', ['Huge clouds of solar material thrown into space.', 'When they hit Earth they can cause geomagnetic storms and auroras.', 'They can affect satellites and power grids.'], ['CME', 'geomagnetic storm'], ['Satellite damage'], ['Forecasting'], ['They can take a day or more to reach Earth.'], ['nasa-sun']), // CMEs
  c('supernovae', 'Supernovae', 'events', 'Event', ['A supernova is a giant star explosion.', 'It can briefly outshine a whole galaxy.', 'It spreads heavy elements and can leave a neutron star or black hole.'], ['supernova', 'remnant'], ['Radiation (from far away it is safe)'], ['Telescopes'], ['Elements in your body were made in stars.'], ['nasa-universe']), // supernovae
  c('gravitational-waves', 'Gravitational waves', 'events', 'Event', ['Ripples in space-time.', 'Made when massive objects like black holes collide.', 'First detected directly in 2015 by the LIGO observatories.'], ['space-time', 'LIGO'], ['None'], ['Laser detectors'], ['They stretch space by less than the width of a proton.'], ['nasa-universe']), // gravitational waves
];

export const CATALOGUE_BY_ID: Record<string, CatalogueEntry> = Object.fromEntries(CATALOGUE.map((e) => [e.id, e])); // id → card lookup

export const GROUP_LABELS: Record<CatalogueGroup, string> = { // headings for the four sections
  natural: 'A. Natural objects', // section A
  systems: 'B. Systems, structures & regions', // section B
  'human-made': 'C. Human-made space objects', // section C
  events: 'Events & phenomena', // separate learning section
};

export const COMPARISONS: { title: string; a: string; b: string; note: string }[] = [ // side-by-side comparisons
  { title: 'Planet vs Star', a: 'Planet: orbits a star; shines by reflected light.', b: 'Star: makes its own light by nuclear fusion.', note: 'The Sun is a star; Mars is a planet.' }, // planet vs star
  { title: 'Moon vs Artificial satellite', a: 'Moon: a NATURAL satellite.', b: 'Artificial satellite: a HUMAN-MADE machine in orbit.', note: 'Both orbit — only one was built by people.' }, // moon vs satellite
  { title: 'Asteroid vs Comet', a: 'Asteroid: mostly rock/metal, usually no tail.', b: 'Comet: ice + dust; grows a coma and tails near the Sun.', note: 'Comet tails point away from the Sun.' }, // asteroid vs comet
  { title: 'Meteoroid vs Meteor vs Meteorite', a: 'Meteoroid: a small rock in space. Meteor: the streak of light in our air.', b: 'Meteorite: the piece that reaches the ground.', note: 'Same object, three names for three stages.' }, // meteor trio
  { title: 'Gas giant vs Rocky planet', a: 'Gas giant (Saturn): mostly hydrogen and helium, no solid surface.', b: 'Rocky planet (Mars): solid surface of rock and metal.', note: 'You cannot land on a gas giant.' }, // gas vs rocky
  { title: 'Astronomy facts vs Simulation fiction', a: 'Science Fact: sourced, checkable statements (labelled with a source link).', b: 'Simulation Fiction: game stations, drones, star maps and training sites we invented.', note: 'CosmoTrekk labels both clearly.' }, // fact vs fiction
];
