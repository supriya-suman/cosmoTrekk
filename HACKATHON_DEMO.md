# CosmoTrekk — 3-Minute Hackathon Demo

**Before you start:** open the deployed link. In **Settings**, turn on **Demo mode** (shorter exploration, still 5 questions and the 60% rule; results are labelled demo and never verified). Unmute your speakers.

| Time | Do | Say |
|---|---|---|
| 0:00 | Title screen | "This is **CosmoTrekk — Your Journey Has No Horizon.** A Junior Astronaut Mission Trainer that mixes exploration with real space science." |
| 0:15 | **Start Journey** → type a name → 🎲 Randomize → Launch | "Anyone can create an astronaut: no email, every look has the same abilities, and **Space Walk starts at 0 km**." |
| 0:35 | Map: point to 8 expeditions + campaign → click **Moon Expedition, Tier 1** | "You can start anywhere, not just Earth. Every category uses the same reward schedule." |
| 0:50 | Briefing: point to the fact table, diagram, sources → **Listen to Briefing** for 3 s | "Before every destination, gameplay pauses for a sourced briefing. Real distances name their reference point, and diagrams say 'not to scale'." |
| 1:10 | **Begin Mission**: walk, collect 2 canisters, press **E** at Base camp | "Collect resources to unlock repairs. Watch oxygen, fuel, health and suit integrity. It's forgiving and pauses when you pause." |
| 1:35 | Checkpoint: answer 5 questions (get one wrong on purpose) | "Five questions, three correct for clearance. A wrong answer shows the explanation and a source, and the attempt carries on." |
| 2:05 | Results: **Space Walk increased by 100 km** → choose an upgrade | "Distance is paid only after exploration *and* the quiz, once per milestone, through an idempotent ledger. Replays can't farm km." |
| 2:20 | **Know Your Space** → open Comets → Comparisons tab | "A searchable learning centre: three levels, vocabulary, hazards, comparisons like meteoroid vs meteor vs meteorite, and practice quizzes. Studying never awards km." |
| 2:35 | **Rankings** | "Local rankings are labelled 'On this device' and 'Demo player'. Optional connected mode uses Supabase, where the server holds the answer keys and awards km in one transaction." |
| 2:45 | (Optional) show `/api/health` | "Gemini turns *approved NASA statements* into candidate questions. They're validated and wait for human review, and the AI never grades players. With no internet or keys, the whole game still works offline as a PWA." |
| 3:00 | Back to title | "CosmoTrekk. Your Journey Has No Horizon." |

**Backup plan:** if Wi-Fi fails, run `npm run preview` on the laptop, or use the installed PWA (it works offline after one visit).
**Questions judges ask:** see the FAQ page in the presenter PDF.
