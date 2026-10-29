# CosmoTrekk — Team Tasks (5 people)

| # | Owner role | Owns these files | Before the demo |
|---|---|---|---|
| 1 | **Game scenes & controls** | `src/game/*`, `src/screens/Explore.tsx` | Tune drain rates, item placement and hazards; test keyboard and touch on 2 phones |
| 2 | **UI, avatar, visuals, audio, accessibility** | `src/components/*`, `src/styles.css`, `src/audio/audio.ts`, title/profile screens | Check contrast, focus outlines, reduced motion, mute, mobile layout |
| 3 | **Science content, questions, Know Your Space** | `src/data/*`, `SCIENCE_SOURCES.md` | Open every source link, re-check facts, add questions (keep 4 options + 1 answer), run `npm test` |
| 4 | **APIs, persistence, competition backend** | `api/*`, `supabase/*`, `src/engine/save.ts`, `src/engine/connected.ts` | Optional: add free keys, run SQL, test `/api/health`, run one verified checkpoint |
| 5 | **QA, deployment, packaging, presentation** | `tests/*`, `README.md`, `HACKATHON_DEMO.md`, Vercel project | Run typecheck/test/build, deploy, rehearse the 3-minute demo twice, prepare the offline backup |

Daily routine: `git pull` → work → `npm test` → commit → `git push` (Vercel redeploys).
Rule: never commit `.env.local` or any key.
