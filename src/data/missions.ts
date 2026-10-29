// src/data/missions.ts — all playable missions, built on ONE reusable mission framework.
// 8 starting expeditions (4 tiers each) + the featured story campaign (4 levels).
import type { Mission, Stage, SceneTheme, TargetDef, Tier } from '../types.js'; // shapes we fill in

// Helper "s" builds one stage so every mission follows the same pattern.
function s(
  tier: Tier, title: string, destinationId: string, theme: SceneTheme, objective: string, // who/where/what
  collectible: Stage['collectible'], targets: TargetDef[], hazardLabel: string, // gameplay pieces
  extra: Partial<Stage> = {}, // optional flags (floating, launch, storyIntro)
): Stage { // returns a full Stage
  return { tier, title, destinationId, theme, objective, collectible, targets, hazards: tier, hazardLabel, ...extra }; // hazards grow with tier (1 → 4)
}

const GOLD = 0xffc857, CYAN = 0x4fe3ff, GREEN = 0x7dff9a, ICE = 0xbfe9ff, ROSE = 0xff8fb1; // collectible colours (hex numbers for Phaser)

export const EXPEDITIONS: Mission[] = [ // the eight starting expeditions
  { id: 'exp-mars', mode: 'expedition', title: 'Mars Expedition', category: 'Planet', blurb: 'Power a habitat and grow the first seedling on the red planet.', stages: [ // 1. Planet
    s(1, 'Touchdown Power', 'mars', 'mars', 'Collect 3 solar cells and connect solar power.', { label: 'Solar cell', count: 3, color: GOLD }, [{ label: 'Solar array', action: 'Connect solar power', needs: 3 }], 'Dust devil'), // tier 1
    s(2, 'Habitat Restart', 'mars', 'mars', 'Collect 4 seal kits and restore the habitat.', { label: 'Seal kit', count: 4, color: CYAN }, [{ label: 'Habitat', action: 'Restore habitat', needs: 4 }], 'Dust devil'), // tier 2
    s(3, 'Green Sprout', 'mars', 'mars', 'Collect 5 water ice samples, then plant a hydroponic seed.', { label: 'Water ice', count: 5, color: ICE }, [{ label: 'Hydroponics bay', action: 'Plant seed', needs: 5 }], 'Dust devil'), // tier 3
    s(4, 'Olympus Survey', 'mars', 'mars', 'Collect 6 survey beacons and link the long-range antenna.', { label: 'Survey beacon', count: 6, color: GREEN }, [{ label: 'Antenna', action: 'Link antenna', needs: 6 }], 'Dust storm'), // tier 4
  ] },
  { id: 'exp-moon', mode: 'expedition', title: 'Moon Expedition', category: 'Moon', blurb: 'Keep the oxygen flowing and repair the lunar relay under Earthrise.', stages: [ // 2. Moon
    s(1, 'Oxygen Run', 'moon', 'moon', 'Collect 3 oxygen canisters for base camp.', { label: 'O₂ canister', count: 3, color: CYAN }, [{ label: 'Base camp', action: 'Store oxygen', needs: 3 }], 'Micrometeoroid'), // tier 1
    s(2, 'Relay Repair', 'moon', 'moon', 'Collect 4 repair modules and repair the communication relay.', { label: 'Repair module', count: 4, color: GOLD }, [{ label: 'Comms relay', action: 'Repair relay', needs: 4 }], 'Micrometeoroid'), // tier 2
    s(3, 'Crater Science', 'moon', 'moon', 'Collect 5 regolith samples and load the analyser.', { label: 'Regolith sample', count: 5, color: 0xd9d9d9 }, [{ label: 'Analyser', action: 'Run analysis', needs: 5 }], 'Micrometeoroid'), // tier 3
    s(4, 'Far-Side Link', 'moon', 'moon', 'Collect 6 relay boosters and connect the far-side network.', { label: 'Relay booster', count: 6, color: GREEN }, [{ label: 'Network hub', action: 'Connect network', needs: 6 }], 'Micrometeoroid'), // tier 4
  ] },
  { id: 'exp-sun', mode: 'expedition', title: 'Sun Observation', category: 'Star', blurb: 'From a protected remote deck, align instruments to study our star. No landing — ever.', stages: [ // 3. Star
    s(1, 'Filter Check', 'sun', 'sun', 'Collect 3 solar filters and fit the viewing port.', { label: 'Solar filter', count: 3, color: GOLD }, [{ label: 'Viewing port', action: 'Fit filters', needs: 3 }], 'Flare burst', { floating: true }), // tier 1
    s(2, 'Sunspot Watch', 'sun', 'sun', 'Collect 4 sensor lenses and align the telescope.', { label: 'Sensor lens', count: 4, color: CYAN }, [{ label: 'Telescope', action: 'Align telescope', needs: 4 }], 'Flare burst', { floating: true }), // tier 2
    s(3, 'Flare Alert', 'sun', 'sun', 'Collect 5 shield plates and protect the instruments.', { label: 'Shield plate', count: 5, color: 0xff9a3c }, [{ label: 'Instrument bay', action: 'Raise shields', needs: 5 }], 'Flare burst', { floating: true }), // tier 3
    s(4, 'Corona Study', 'sun', 'sun', 'Collect 6 data cores and transmit to Earth.', { label: 'Data core', count: 6, color: GREEN }, [{ label: 'Transmitter', action: 'Transmit data', needs: 6 }], 'Flare burst', { floating: true }), // tier 4
  ] },
  { id: 'exp-asteroid', mode: 'expedition', title: 'Asteroid Training Site KT-7', category: 'Asteroid', blurb: 'Fictional training asteroid: tether up and collect rock samples in tiny gravity.', stages: [ // 4. Asteroid
    s(1, 'Tether Practice', 'asteroid', 'asteroid', 'Collect 3 tether anchors and secure the line.', { label: 'Tether anchor', count: 3, color: GOLD }, [{ label: 'Anchor post', action: 'Secure tether', needs: 3 }], 'Loose boulder'), // tier 1
    s(2, 'Sample Grab', 'asteroid', 'asteroid', 'Collect 4 rock samples and seal the container.', { label: 'Rock sample', count: 4, color: 0xc9a27e }, [{ label: 'Sample box', action: 'Seal samples', needs: 4 }], 'Loose boulder'), // tier 2
    s(3, 'Rubble Survey', 'asteroid', 'asteroid', 'Collect 5 seismic pins and run a survey.', { label: 'Seismic pin', count: 5, color: CYAN }, [{ label: 'Survey unit', action: 'Run survey', needs: 5 }], 'Loose boulder'), // tier 3
    s(4, 'Return Capsule', 'asteroid', 'asteroid', 'Collect 6 sample canisters and launch the return capsule.', { label: 'Sample canister', count: 6, color: GREEN }, [{ label: 'Return capsule', action: 'Launch capsule', needs: 6 }], 'Loose boulder'), // tier 4
  ] },
  { id: 'exp-comet', mode: 'expedition', title: 'Comet Lumen-K Flyby', category: 'Comet', blurb: 'Fictional comet: scan ice and dust during a shielded flyby.', stages: [ // 5. Comet
    s(1, 'Shield Up', 'comet', 'comet', 'Collect 3 dust-shield tiles and fit the shield.', { label: 'Shield tile', count: 3, color: GOLD }, [{ label: 'Dust shield', action: 'Fit shield', needs: 3 }], 'Dust jet', { floating: true }), // tier 1
    s(2, 'Ice Scan', 'comet', 'comet', 'Collect 4 ice readings and upload them.', { label: 'Ice reading', count: 4, color: ICE }, [{ label: 'Scanner', action: 'Upload scans', needs: 4 }], 'Dust jet', { floating: true }), // tier 2
    s(3, 'Coma Sampler', 'comet', 'comet', 'Collect 5 gas samples from the coma.', { label: 'Gas sample', count: 5, color: CYAN }, [{ label: 'Sampler', action: 'Store samples', needs: 5 }], 'Dust jet', { floating: true }), // tier 3
    s(4, 'Tail Mapping', 'comet', 'comet', 'Collect 6 tail probes and map the tails.', { label: 'Tail probe', count: 6, color: GREEN }, [{ label: 'Mapper', action: 'Map tails', needs: 6 }], 'Dust jet', { floating: true }), // tier 4
  ] },
  { id: 'exp-exoplanet', mode: 'expedition', title: 'Exoplanet Aurelia b', category: 'Exoplanet', blurb: 'Fictional exoplanet: analyse simulated atmospheric signals from orbit.', stages: [ // 6. Exoplanet
    s(1, 'Transit Watch', 'exoplanet', 'exoplanet', 'Collect 3 light-curve packets and spot the transit.', { label: 'Light-curve packet', count: 3, color: GOLD }, [{ label: 'Photometer', action: 'Detect transit', needs: 3 }], 'Cosmic ray', { floating: true }), // tier 1
    s(2, 'Spectrum Lock', 'exoplanet', 'exoplanet', 'Collect 4 spectrum bands and lock the spectrometer.', { label: 'Spectrum band', count: 4, color: CYAN }, [{ label: 'Spectrometer', action: 'Lock spectrum', needs: 4 }], 'Cosmic ray', { floating: true }), // tier 2
    s(3, 'Gas Signals', 'exoplanet', 'exoplanet', 'Collect 5 gas signals and analyse the atmosphere.', { label: 'Gas signal', count: 5, color: ROSE }, [{ label: 'Analyser', action: 'Analyse atmosphere', needs: 5 }], 'Cosmic ray', { floating: true }), // tier 3
    s(4, 'Careful Report', 'exoplanet', 'exoplanet', 'Collect 6 evidence notes and file an honest report.', { label: 'Evidence note', count: 6, color: GREEN }, [{ label: 'Report console', action: 'File report', needs: 6 }], 'Cosmic ray', { floating: true }), // tier 4
  ] },
  { id: 'exp-satellite', mode: 'expedition', title: 'Relay-9 Satellite Servicing', category: 'Artificial satellite', blurb: 'Fictional satellite: repair its power panel high above Earth.', stages: [ // 7. Satellite
    s(1, 'Tool Up', 'satellite', 'orbit', 'Collect 3 tools and open the service hatch.', { label: 'Tool', count: 3, color: GOLD }, [{ label: 'Service hatch', action: 'Open hatch', needs: 3 }], 'Debris', { floating: true }), // tier 1
    s(2, 'Panel Repair', 'satellite', 'orbit', 'Collect 4 solar cells and repair the power panel.', { label: 'Solar cell', count: 4, color: CYAN }, [{ label: 'Power panel', action: 'Repair panel', needs: 4 }], 'Debris', { floating: true }), // tier 2
    s(3, 'Antenna Align', 'satellite', 'orbit', 'Collect 5 alignment pins and point the antenna.', { label: 'Alignment pin', count: 5, color: GREEN }, [{ label: 'Antenna', action: 'Align antenna', needs: 5 }], 'Debris', { floating: true }), // tier 3
    s(4, 'Debris Dodge', 'satellite', 'orbit', 'Collect 6 thruster cells and boost the orbit away from debris.', { label: 'Thruster cell', count: 6, color: ROSE }, [{ label: 'Thruster', action: 'Boost orbit', needs: 6 }], 'Debris', { floating: true }), // tier 4
  ] },
  { id: 'exp-station', mode: 'expedition', title: 'Horizon Research Station', category: 'Space station', blurb: 'Fictional station: restore oxygen circulation and keep the crew safe.', stages: [ // 8. Station
    s(1, 'Air Check', 'station', 'orbit', 'Collect 3 air filters and restart the fans.', { label: 'Air filter', count: 3, color: CYAN }, [{ label: 'Fan unit', action: 'Restart fans', needs: 3 }], 'Debris', { floating: true }), // tier 1
    s(2, 'Oxygen Flow', 'station', 'orbit', 'Collect 4 oxygen cartridges and restore circulation.', { label: 'O₂ cartridge', count: 4, color: GOLD }, [{ label: 'Oxygen generator', action: 'Restore circulation', needs: 4 }], 'Debris', { floating: true }), // tier 2
    s(3, 'Scrubber Swap', 'station', 'orbit', 'Collect 5 CO₂ scrubbers and install them.', { label: 'CO₂ scrubber', count: 5, color: GREEN }, [{ label: 'Scrubber rack', action: 'Install scrubbers', needs: 5 }], 'Debris', { floating: true }), // tier 3
    s(4, 'Leak Patrol', 'station', 'orbit', 'Collect 6 patch kits and seal the module.', { label: 'Patch kit', count: 6, color: ROSE }, [{ label: 'Module hatch', action: 'Seal module', needs: 6 }], 'Debris', { floating: true }), // tier 4
  ] },
];

export const CAMPAIGN: Mission = { // the featured story campaign (team's original route)
  id: 'campaign', mode: 'campaign', title: 'Featured Campaign: Earth → Saturn', category: 'Story', // identity
  blurb: 'Fictional itinerary: Earth → Moon → Mars → Venus → Saturn Orbital Station. Not the physical order of planets or a real trajectory.', // honest note
  stages: [ // four story levels
    s(1, 'Lunar Readiness', 'moon', 'moon', 'Collect 3 repair modules and repair the lunar comms relay.', { label: 'Repair module', count: 3, color: GOLD }, [{ label: 'Comms relay', action: 'Repair relay', needs: 3 }], 'Micrometeoroid', // level 1
      { launch: { from: 'Earth', to: 'Moon', module: 'Launch suit sealed' }, storyIntro: 'Mission Control: Commander, the launch window is closing — run your checklist calmly. The Moon relay is silent and we need it back.' }),
    s(2, 'Red Planet Pioneer', 'mars', 'mars', 'Collect 4 solar cells, power the habitat, then plant a hydroponic seed.', { label: 'Solar cell', count: 4, color: GOLD }, [{ label: 'Solar array', action: 'Connect power', needs: 4 }, { label: 'Habitat', action: 'Restore habitat', needs: 4 }, { label: 'Hydroponics bay', action: 'Plant seed', needs: 4 }], 'Dust devil', // level 2
      { launch: { from: 'Moon', to: 'Mars', module: 'Habitat kit loaded' }, storyIntro: 'Mission Control: Mars habitat Alpha is dark. Power it up and give it its first green sprout.' }),
    s(3, 'Heat Shield Protocol', 'venus', 'venus', 'Collect 5 shield panels and repair the Venus cloud-platform shield.', { label: 'Shield panel', count: 5, color: 0xff9a3c }, [{ label: 'Shield generator', action: 'Repair shield', needs: 5 }], 'Acid droplet', // level 3
      { floating: true, launch: { from: 'Mars', to: 'Venus', module: 'Heat-shield module' }, storyIntro: 'Mission Control: Heat-shield module required before departure. The Venus platform shield is failing in the acid clouds.' }),
    s(4, 'Ring Guardian', 'saturn', 'saturn', 'Collect 6 calibration chips, route station energy, then calm the rogue drone.', { label: 'Calibration chip', count: 6, color: CYAN }, [{ label: 'Energy junction', action: 'Route energy', needs: 6, kind: 'puzzle' }, { label: 'Rogue drone', action: 'Reprogram drone', needs: 6, kind: 'drone' }], 'Ring particle', // level 4
      { floating: true, launch: { from: 'Venus', to: 'Saturn Orbital Station', module: 'Ring-particle shielding' }, storyIntro: 'Mission Control: The Saturn station’s power is scrambled and a maintenance drone is spinning in circles. Fix the energy grid and calm it down — gently.' }),
  ],
};

export const ALL_MISSIONS: Mission[] = [CAMPAIGN, ...EXPEDITIONS]; // every mission in one list
export const MISSION_BY_ID: Record<string, Mission> = Object.fromEntries(ALL_MISSIONS.map((m) => [m.id, m])); // id → mission

export function completionId(missionId: string, tier: Tier): string { // the unique milestone ID used by the reward ledger
  return `${missionId}:stage${tier}`; // e.g. "exp-mars:stage2" — each one can award distance only once
}
