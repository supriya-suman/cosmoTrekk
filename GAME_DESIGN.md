# CosmoTrekk — Game Design

**Name:** CosmoTrekk · **Tagline:** Your Journey Has No Horizon. · **Descriptor:** Junior Astronaut Mission Trainer
**Goal:** *Explore further, grow your knowledge, and build your Space Walk.*

## Core loop
Choose destination → immersive briefing → explore → collect & repair → five-question checkpoint → clearance → earn Space Walk → unlock the next tier.

State machine (`src/engine/store.ts`):
`TITLE → PROFILE → MAP → (LAUNCH, campaign only) → BRIEFING → EXPLORATION → QUIZ → RESULTS → UPGRADE → NEXT TIER … → SUMMARY`
Study, pause, retry, replay, reset, and category switching all keep a consistent state.

## Modes
1. **Eight starting expeditions** (four tiers each, one reusable mission framework): Mars (planet), Moon, Sun (star, remote deck only), Training Asteroid KT-7 (fictional), Comet Lumen-K (fictional flyby), Exoplanet Aurelia b (fictional), Relay-9 satellite (fictional), Horizon Research Station (fictional).
2. **Featured campaign** (fictional itinerary): Earth → Moon (*Lunar Readiness*) → Mars (*Red Planet Pioneer*, "Chapter One Complete") → Venus (*Heat Shield Protocol*) → Saturn Orbital Station (*Ring Guardian*: energy-routing puzzle + friendly rogue-drone encounter → **Horizon Star Map**).

Campaign extras: pre-launch checklist (equipment + knowledge clearance both required), "Heat-shield module required before departure", explicit confirmation, then a 10-second abortable countdown.

## Exploration
- Controls: WASD/arrows to move, E/Space to interact, Esc to pause, plus an on-screen pad and a big ✋ button on touch screens.
- HUD: Space Walk, oxygen, fuel, health, suit integrity, modules, objective, pause, and sound.
- Collect items → enable the target action (e.g. 3 repair modules → repair relay).
- Forgiving resources: oxygen ~100 s with two O₂ refills; fuel drains only while moving; health only drops when O₂ or the suit fails. Depletion restarts the activity without losing progress.
- Pauses during overlays, the puzzle, the pause menu, and when the tab is hidden.
- Upgrades after each new clearance: O₂ tank, suit armour, thrusters.
- Never requires landing on a star, black hole, or gas giant.

## Content principles
Science Fact vs Simulation Fiction labels. Diagrams are "Illustrative · Not to scale." Distances always name a reference point. No claims of alien life, no infinite content, and no claim that the universe is known to be infinite.

## Accessibility
Keyboard menus, visible focus, ✓/✗ symbols alongside colour, large touch targets, reduced motion, untimed quizzes by default, no strobing, text for every narration.
