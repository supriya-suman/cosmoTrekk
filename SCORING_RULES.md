# CosmoTrekk — Scoring Rules

## Space Walk
**Space Walk** is your cumulative, game-earned expedition distance.
> *Your earned expedition distance in CosmoTrekk. Simulation kilometres, not real travel distance.*

It does not describe real spacecraft travel, real distance from Earth, or real astronaut spacewalks. **Every new profile starts at 0 km**, whatever its starting destination.

## Reward schedule (same for every category)
| Tier | Reward |
|---|---|
| 1 | +100 km |
| 2 | +250 km |
| 3 | +500 km |
| 4 | +1,000 km |
| **Full four-tier expedition** | **1,850 km** |

You can change these values in `src/config/rewards.ts` (and in the SQL function `complete_attempt` for connected mode).

Distance is awarded **only after BOTH** the exploration objectives **and** a passing checkpoint (≥ 3 of 5 correct = 60%).

**No distance is ever given for** choosing a faraway object, opening the game, idling, reading lessons, practice quizzes, refreshing, replaying a rewarded milestone, or editing browser scores.

## Ranks (fictional)
0 km Cadet · 100 Explorer · 350 Navigator · 850 Pathfinder · 1,850 Expedition Commander · 5,550 Deep-Space Veteran

## Checkpoints & retries
- Exactly five questions, four options each, one correct answer. Each correct answer adds 20 percentage points.
- 0/5, 1/5 and 2/5 do not pass. 3/5 or more passes.
- A wrong answer never ends the attempt early. Answers lock on first click.
- **Unlimited retries.** Every retry is a brand-new attempt (answers reset and are never combined), and it avoids the previous questions where the bank allows.
- Exploration progress is kept after a failed quiz.

## Duplicate prevention (the idempotent ledger)
- Each milestone has a unique **completion ID**, such as `exp-mars:stage2` or `campaign:stage4`.
- `src/engine/ledger.ts` pays a completion ID **once**. Replays can raise your **best score** but add no km.
- On load, the total is **recalculated from the ledger**, so editing the saved total has no effect.
- The grading function has a double-click guard. Connected mode uses a database primary key `(user_id, completion_id)`.

## Rankings
Order: **Space Walk ↓ → quiz accuracy ↓ → active completion time ↑**.

Active time counts only while exploring, answering, or in launch countdown, and only when the tab is visible and the game isn't paused.

## Verified vs local scores
| | Local ("On this device") | Verified (connected, optional) |
|---|---|---|
| Stored in | Browser localStorage | Supabase via Vercel server functions |
| Who grades | Browser | Server (private answer key) |
| Who awards km | Browser ledger | SQL function, one transaction, primary-key protected |
| Label | "On this device" / "Demo player" | "Verified by server" |
| Trust | Not verified — never presented as global | Server-recorded, but **no browser game is cheat-proof** |

**Known limitations of verification:**
1. Exploration happens in the browser, so the server trusts that the milestone was explored.
2. If the ranked pool reuses the bundled questions, answers are visible in the client code. Seed new teacher-approved questions for a serious contest.
3. Anonymous accounts can be recreated.

Demo-mode results are labelled and are refused by the ranked server.
