# CosmoTrekk — Optional API Setup (all free tiers)

The game is **100% playable with none of this.** Each integration is optional and degrades gracefully.

## Endpoints (Vercel server functions in `api/`)
| Endpoint | Purpose | Needs |
|---|---|---|
| `GET /api/health` | Shows which integrations are configured (true/false only) | nothing |
| `GET /api/intel?topic=mars` | Mission Intel: items from the free NASA Image and Video Library; CDN-cached for 1 day | nothing (NASA image search needs no key) |
| `POST /api/generate-questions` | Gemini turns approved source statements into **candidate** questions | `ADMIN_REFRESH_TOKEN`, `GEMINI_API_KEY`, `GEMINI_MODEL` (+ Supabase to store candidates) |
| `POST /api/ranked/start` · `/answer` · `/complete` | Server-validated ranked attempts | Supabase |
| `GET /api/ranked/leaderboard` | Verified board | Supabase |

## Gemini (free key)
1. Go to https://aistudio.google.com/apikey → **Create API key** (free tier; limits vary — check the AI Studio rate-limit page).
2. Choose a current model name from AI Studio (e.g. a "flash" model). Put it in `GEMINI_MODEL`. Model names change, so check before demo day.
3. In Vercel, add `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ADMIN_REFRESH_TOKEN` (make up a long password), then redeploy.
4. Generate candidates (never on page load — only when you run this):
```bash
curl -X POST https://YOUR-APP.vercel.app/api/generate-questions \
  -H "Authorization: Bearer YOUR_ADMIN_REFRESH_TOKEN" -H "Content-Type: application/json" \
  -d '{"destination":"mars","count":5}'
```
How it works and how it stays safe:
- It uses Gemini REST `v1beta/models/{model}:generateContent` with the key in the `x-goog-api-key` header and asks for JSON (`responseMimeType: application/json`).
- Only allow-listed destinations are accepted. There are no arbitrary URLs or user prompts. Source text is treated as **data**.
- Every candidate is checked by `src/engine/questionSchema.ts` for: four distinct options, a single valid answer, the right destination, an approved source ID, supporting evidence copied from an approved statement, no duplicates, and no "all/none of the above".
- **Schema validity ≠ factual correctness.** Candidates are stored as `pending_review`. A person must approve them before copying them into `ranked_questions` or `src/data/questions.ts`.
- Limits: 512-byte request body, 1–10 questions, at most 2 attempts, 25 s timeout. It stops on 429 (quota) and reports invalid JSON. The game falls back to the reviewed bank.
- Players are graded by deterministic code, never by the AI.

## NASA
Mission Intel uses `https://images-api.nasa.gov/search` (free, no key). `NASA_API_KEY` (free at https://api.nasa.gov) is reserved for future api.nasa.gov endpoints. NASA provides content and datasets. It does **not** provide a ready-made quiz API.

Statuses shown are honest: **Cached source content** (with a checked time) or **Offline training bank**. Nothing is ever labelled "Live".

## Supabase (free project) — connected rankings
1. https://supabase.com → **New project** (Free plan).
2. **Authentication → Sign In / Providers → Anonymous sign-ins → Enable** (guest play, no email).
3. **SQL Editor** → paste and run `supabase/migrations/001_connected_rankings.sql`, then `supabase/seed_ranked_questions.sql`.
4. **Project Settings → API**: copy the Project URL, the anon public key, and the service_role secret key.
5. In Vercel, set:
   - `VITE_SUPABASE_URL` = Project URL (public)
   - `VITE_SUPABASE_ANON_KEY` = anon key (public, protected by row-level security)
   - `SUPABASE_URL` = Project URL (server)
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (**SECRET**, never prefixed with `VITE_`)
6. Redeploy. **Rankings → Verified (connected)** now lets players run verified checkpoints.

Security model: row-level security is on for every table. Browsers can only **read** `players`. All writes go through server functions → SECURITY DEFINER SQL functions (`start_attempt`, `submit_answer`, `complete_attempt`), which run as single transactions. Questions are sent **without** answer keys. Rewards have a primary key `(user_id, completion_id)`.

## Secrets checklist
- Never commit `.env` / `.env.local` (`.gitignore` covers this).
- The ZIP contains only a blank `.env.example`.
- Search the built bundle before demo day: `grep -r "service_role\|AIza" dist/` should print nothing.
- In-memory serverless variables are **not** durable storage or global rate limiting. Use Supabase/Vercel features for that.

## Untested here
These integrations were tested with mocked responses only. Test them with your own keys before the demo.
