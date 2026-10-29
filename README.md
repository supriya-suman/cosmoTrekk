# CosmoTrekk
**Your Journey Has No Horizon.** — *Junior Astronaut Mission Trainer*

CosmoTrekk is a family-friendly space-science adventure game. Players create an astronaut, choose a destination, read an immersive briefing, explore and repair equipment, pass a five-question knowledge checkpoint, and earn **Space Walk** kilometres.

> **Everything here is free.** VS Code, Node.js, Git, GitHub, and Vercel's Hobby plan are all free. Gemini, NASA, and Supabase are **optional** extras with free tiers. **The full game runs with no keys and no accounts.**

---

## 0. What's inside (quick map)

| Folder / file | What it is |
|---|---|
| `src/` | The game (React + TypeScript + Phaser 3) |
| `src/data/` | Missions, briefings, Know Your Space cards, 120 reviewed questions, source registry |
| `src/engine/` | Game rules: quiz scoring, reward ledger, saves, store |
| `src/game/` | Phaser exploration scene + React⇄Phaser bridge |
| `src/screens/` | Every screen (title, map, briefing, quiz, study, rankings…) |
| `api/` | Optional Vercel server functions (Gemini, NASA, rankings) |
| `supabase/` | Optional SQL for connected rankings |
| `tests/` | Automatic tests (`npm test`) |
| `public/icons/` | App icons |
| `*.md` | Documentation (design, scoring, demo script, team tasks…) |

---

## 1. Install the free tools (one time only)

1. **Node.js (LTS)** — https://nodejs.org → download the **LTS** version → install with default options. (This also installs `npm`.)
2. **Git** — https://git-scm.com/downloads → install with default options.
3. **VS Code** — https://code.visualstudio.com → install.
4. **GitHub account** — https://github.com/signup (free).
5. **Vercel account** — https://vercel.com/signup → choose **Hobby (free)** → **Continue with GitHub**.

Check the installs. Open **VS Code → Terminal → New Terminal** and type:
```bash
node -v     # should print v20 or higher (v22 recommended)
npm -v      # should print a version number
git --version
```

---

## 2. Open the project in VS Code

1. Unzip `cosmotrekk.zip` somewhere easy (for example `Documents/cosmotrekk`).
2. VS Code → **File → Open Folder…** → pick the **`cosmotrekk`** folder (the one that contains `package.json`).
3. If VS Code asks *"Do you trust the authors?"* → **Yes, I trust the authors**.
4. Open a terminal: **Terminal → New Terminal**. The terminal opens inside the project folder.

---

## 3. Install dependencies and run locally

```bash
npm install        # downloads the libraries listed in package.json (takes 1–3 minutes, one time)
npm run dev        # starts the game in development mode
```
Open the address it prints, usually **http://localhost:5173**. Press **Ctrl + C** in the terminal to stop.

Other useful commands:
```bash
npm test           # runs the automatic tests (scoring, ledger, content)
npm run typecheck  # checks TypeScript types
npm run build      # makes the production version in the dist/ folder
npm run preview    # serves the production build at http://localhost:4173
```

---

## 4. Put the project on GitHub

### Option A: the easy VS Code way (recommended for beginners)
1. Click the **Source Control** icon on the left bar (the branch symbol).
2. Click **Initialize Repository**.
3. Type a message such as `First version of CosmoTrekk` and click **✓ Commit** (choose **Yes** if asked to stage all changes).
4. Click **Publish Branch** → choose **Publish to GitHub public repository** (or private) → name it `cosmotrekk`.
5. Sign in to GitHub in the browser window that opens, then click **Allow**.

### Option B: the terminal way
Create an **empty** repository on github.com named `cosmotrekk` (don't add a README). Then:
```bash
git config --global user.name "Your Name"            # first time on this computer only
git config --global user.email "you@example.com"     # first time on this computer only
git init
git add .
git commit -m "First version of CosmoTrekk"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cosmotrekk.git
git push -u origin main
```
`.gitignore` already keeps `node_modules/`, `dist/` and secret `.env` files out of GitHub.

**If two people share one laptop:** before publishing, check which GitHub account VS Code is signed into (the **Accounts** icon, bottom-left). Pushing from the wrong account is the most common surprise.

---

## 5. Deploy on Vercel (free Hobby plan)

1. Go to https://vercel.com/new and sign in with GitHub.
2. Find **cosmotrekk** in the list and click **Import**. (If it isn't listed, click **Adjust GitHub App Permissions** and allow the repo.)
3. Vercel detects **Vite** automatically. Check:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Click **Deploy**. After about a minute you get a free link like `https://cosmotrekk-xyz.vercel.app`.
5. From now on, every `git push` (or **Sync Changes** in VS Code) redeploys automatically.

No environment variables are needed for the game to work.

---

## 6. Optional environment variables (all free tiers)

Copy `.env.example`. Put the values in **Vercel → Project → Settings → Environment Variables**, then **Redeploy**.

| Variable | Where it's used | Free source |
|---|---|---|
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Server only: AI question candidates | https://aistudio.google.com/apikey (pick a current "flash" model name shown in AI Studio) |
| `NASA_API_KEY` | Optional; the NASA Image Library used by Mission Intel needs no key | https://api.nasa.gov |
| `ADMIN_REFRESH_TOKEN` | Protects `/api/generate-questions` | Any long random text you invent |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | **Public** values for connected rankings | Supabase project → Settings → API |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | **Secret**, server only | Supabase project → Settings → API |

⚠️ Only variables starting with `VITE_` reach the browser. **Never** put a secret key in a `VITE_` variable.

Full details: **API_SETUP.md**.

---

## 7. Run the server functions locally (optional)

`npm run dev` runs the game only. To also run `api/` functions on your computer:
```bash
npm install -g vercel      # free Vercel command-line tool
vercel login               # sign in (browser opens)
vercel link                # connect this folder to your Vercel project
vercel env pull .env.local # (optional) download your env variables
vercel dev                 # game + /api at http://localhost:3000
```
Test it: open http://localhost:3000/api/health

---

## 8. Optional Supabase connected rankings
See **API_SETUP.md → Supabase**. Short version: create a free project → enable **Anonymous sign-ins** → run `supabase/migrations/001_connected_rankings.sql`, then `supabase/seed_ranked_questions.sql` in the SQL Editor → add the four Supabase variables to Vercel → redeploy.

---

## 9. Install as an app (PWA) and play offline
- **Android (Chrome) / desktop Chrome or Edge:** open the Vercel link → browser menu → **Install app** / **Add to Home screen** (shown when the browser supports it).
- **iPhone (Safari):** Share button → **Add to Home Screen**.
- This is a web app (PWA), **not** an App Store package or `.exe`.
- After one online visit, the bundled campaign, expeditions, and question bank work **offline**. Source links, Mission Intel, and connected rankings need internet.
- When a new version is deployed, the game shows **"A new CosmoTrekk version is ready → Update"**.

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `npm` is not recognised | Install Node.js LTS, then **close and reopen VS Code**. |
| Windows: *"running scripts is disabled on this system"* | In the VS Code terminal dropdown choose **Command Prompt** instead of PowerShell, or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once in PowerShell. |
| `npm install` fails | Check internet, then run `npm cache clean --force` and `npm install` again. |
| Port 5173 already in use | Stop the other terminal (Ctrl + C) or run `npm run dev -- --port 5174`. |
| Blank page after deploy | In Vercel, check that the Output Directory is `dist` and the build log shows ✓ built. |
| `git push` asks for a password | GitHub needs a browser sign-in or a Personal Access Token, not your account password. VS Code Option A handles this for you. |
| Pushed from the wrong GitHub account | Sign out from the VS Code Accounts menu, sign in with the right one, and push again. |
| Old version still showing | Click **Update** in the banner, or close all tabs of the game and reopen. |
| No sound | Click or tap once (browsers block audio until you interact) and check Settings → Sound on. |
| `/api/...` returns 404 locally | `npm run dev` doesn't run server functions. Use `vercel dev` (section 7). |
| Mission Intel says "Offline training bank" | That's the honest fallback when offline or when NASA can't be reached. The game still works. |

---

## 11. Verification status (honest)
- ✅ Type checking, production build and 17 automatic tests pass.
- ✅ Browser smoke tests (desktop + mobile): campaign levels 1–4 completed, all 8 expedition tier-1 missions completed, a failed then passed retry, replay without extra km, and saves surviving a reload.
- ⚠️ Gemini, NASA Mission Intel, and Supabase connected rankings were unit-tested with mocked responses and checked to load as Node modules. They were **not** tested against the live services, because they need your own free keys. Test them after you add keys.

Credits: see **ASSET_CREDITS.md**. Science sources: **SCIENCE_SOURCES.md**.
