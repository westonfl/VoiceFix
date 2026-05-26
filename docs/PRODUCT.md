# VoiceFix — Product Document

Single source of truth for vision, MVP, how the roadmap fits the product, and what problem we solve. Update this file as decisions change.

---

## 1. Vision

Build a practice companion that **helps people hear what changed in their own voice** on short, repeatable drills—not a karaoke scoreboard and not a claim to replace a human vocal coach.

**One-line positioning:** Find what’s going on with your voice in a few minutes; try one small fix; repeat the same exercise and see if it moved.

**Metaphor:** Voice **debugger** (measure → hypothesize → change one thing → re-run), not “learn singing” as an abstract curriculum.

**Honest framing:** Assistant for deliberate practice between lessons or before lessons—not medical advice, not guaranteed root-cause diagnosis from a phone mic.

---

## 2. Problem

### 2.1 User pain (validated directionally)

- **Invisible progress:** Users practice (lessons, YouTube, tuner apps) but still feel *stuck* or *worse* when listening critically—no tight **try → feedback → retry same material** loop.
- **Pitch crutch:** With a reference (app, isolated vocal, piano) they can chase notes; **without** it, pitch sense doesn’t transfer—need structured **with / without reference** phases and **self vs last take** comparison.
- **Tool fragmentation:** Tuner + karaoke + YouTube + occasional recording—nothing ties **today’s 10 minutes** into one **measurable** habit with a clear “what changed?”
- **Pitch-only tools miss the complaint:** Hitting the green line doesn’t fix tone, phrase endings, rushing, or support; users ask for **specific** critique, not only cents sharp/flat.
- **Community norm:** r/singing and similar spaces stress **teachers** and **bad habits from self-teaching**—the product must be **humble**, **safety-aware**, and positioned as **supplement**, not oracle.

### 2.2 Market reality

- Many apps compete on **pitch visualization**, song libraries, and gamification.
- Differentiation is **cause-oriented language (careful: “likely”)**, **one fix at a time**, **retry same drill**, **progress vs your past self**—not a bigger catalog on day one.

---

## 3. Who it’s for

| Segment | Description |
|--------|-------------|
| **Primary** | Beginners and returners who think “something sounds off,” use tuner/YouTube/karaoke, and want **clarity + a daily loop**. |
| **Secondary** | Hobbyists preparing for choir, worship team, or open mic—need **foundation + confidence**. |
| **Anti-target** | Working pros expecting studio-grade coaching or medical voice therapy—out of scope. |

---

## 4. How roadmap and MVP are one product

- **Roadmap (pedagogy):** Breath → phonation → pitch → range → expression → style—**content and difficulty** over months.
- **MVP (interaction):** Every session is still **guided task → record → 1–2 observations → one fix → retry same task → short summary** (optional save/compare).

**Integration rule:** The roadmap does **not** ship as a forced 30-day “only breathing” wall. It ships as **tags and ordering** on exercises (e.g. `airflow`, `pitch_match`, `short_phrase`). The **router** picks the next drills from **weakest signals + prerequisites**; the user sees **“Today: 3 short exercises”**, not “Semester 2.”

---

## 5. Core user flow (MVP)

Exact order users experience:

1. **Long-form onboarding assessment** — 20+ screens that capture goal, identity, experience, current voice symptoms, fear/shame level, practice constraints, music context, safety/strain, and willingness to hear playback.
2. **Personalization bridge** — show why each answer matters and build anticipation that the user is getting a plan, not a generic lesson tree.
3. **Voice control check** — multiple short recordings (hiss, hum, sustained ah, pitch match, echo pattern) used to personalize the starter focus.
4. **Diagnostic recap** — plain-language “what your answers suggest” + “what the recordings suggest,” carefully framed as likely signals.
5. **Plan reveal** — one starting focus, first 14-day arc, weekly milestones, first session recipe, and the first cue to try.
6. **First session** — **Exercise 1 → Record → Feedback (max 1–2 bullets) → One fix → Retry** (same exercise).
7. **Exercises 2-3** — same loop (e.g. pitch match to app-provided tone, short echo pattern).
8. **Session summary** — plain language + optional **better / same / worse** vs last session; optional **save clips** for journal.

**Not in MVP:** Social feed, huge song library, heavy gamification, dense graphs, “AI diagnoses resonance placement,” medical claims.

---

## 5.1 Onboarding strategy

Onboarding is intentionally **longer than a generic app intro** because it must create the feeling of a personalized plan before the first paid or habitual moment. The flow should be **at least 20 screens** and feel like a calm diagnostic intake plus a “custom plan is being built” experience, not a school enrollment form.

**Required onboarding ingredients:**

- **Goal capture:** What the user most wants to fix first (pitch, tone/stability, confidence, range).
- **Aspirational context:** What they want to sing, where they want to use the voice, and what “better” would feel like.
- **Experience profile:** New, self-taught, returning, choir/karaoke background, instrument background, or lessons before.
- **Symptom capture:** Fading endings, pitch drift, wobble, breathiness, harshness, rushing, cracking, pushing/strain.
- **Self-perception:** How they feel about playback, whether they think they are “tone deaf,” and what feedback style helps them continue.
- **Routine fit:** 5, 10-12, or 20 minute practice expectation; preferred pace; reminder timing.
- **Environment:** Quiet room, headphones, phone mic only, practice privacy.
- **Safety boundary:** Pain/strain check and cautious recommendations.
- **Voice control check:** 4-5 short recordings so the plan feels earned by behavior, not only quiz answers.
- **Plan reveal:** Starting focus, first 14 days, weekly milestones, first session recipe, and one immediate cue.
- **Conversion bridge:** Show what free users get now and what deeper history/personalization unlocks later, without blocking the first win.

**Conversion principle:** The user should arrive at the first session thinking, **“This app understood my specific problem and gave me a doable plan.”**

**Guardrail:** Detailed does not mean cluttered. Each screen asks one decision, explains why it matters, and keeps a clear primary action. Long onboarding should feel like progress toward a custom plan, not paperwork.

---

## 6. MVP feature set (strict)

| # | Feature | Notes |
|---|---------|--------|
| 1 | **Guided exercises** | App-known targets: sustain, single-note match, short pattern—**not** arbitrary user-upload songs at first. |
| 2 | **Signal extraction** | Pitch / stability; loudness envelope (support proxy); keep **simple** spectral hints only if validated. |
| 3 | **Diagnosis copy** | Rule-based mapping from signals → **“likely”** issues; optional LLM only for **wording**, not sole source of truth. |
| 4 | **Fix + retry loop** | One cue, one drill; **same** task repeated; compare **this take vs previous**. |
| 5 | **Session summary + optional journal** | Stored clips + one-line “what moved” beats raw storage without interpretation. |

**Foundation check (v1):** 3 tiny exercises (hiss, sustained ah, 3-note echo)—**soft** routing (“we recommend foundation first”), not hard lockout. Name it **Voice control check** or **Foundation check**, not “breathing test” (you infer proxies, not diaphragm imaging).

---

## 7. Technical direction (high level)

- **Signals:** F0 / pitch stability; RMS or amplitude curve over time; later cautious noise/roughness proxies.
- **Stack (flexible):** Client records audio; backend or on-device analysis (Python/librosa-style or native)—decide per platform.
- **Interpretation:** Start **rule-based + explainable**; collect data before ML-heavy claims.
- **Claims discipline:** Prefer “volume dropped at the end → **often** related to airflow steadiness” over “your breath support is wrong.”

---

## 8. Monetization (later)

- Freemium: capped sessions/diagnoses per day; free basic exercises.
- Subscription: unlimited feedback, history, deeper routines, optional coach-aligned packs.
- Creator / coach rev share only after **demo + traction**—partnerships after proof, not before.

---

## 9. Go-to-market notes

- **Validate before scale:** Manual “coach notes” on a few recordings to learn phrasing and failure modes.
- **Content hooks:** “Why this exercise,” “same line two takes,” “without the crutch”—short video friendly.
- **Creators:** Mid-tier vocal coaches; lead with **feedback on tool for their followers**, not “invest in my idea.”

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Wrong feedback stated confidently | Probabilistic copy; simple outputs; user thumbs-down on useless tips. |
| Reference-only pitch ability | Drills that **fade** reference; reward **unaided** repeat of same interval. |
| Shame / hating playback | Gentle defaults; optional delayed playback; supportive tone. |
| Overpromising “AI coach” | Marketing = **practice feedback**, not replacement for lessons or therapy. |
| Legal / voice health | Disclaimers; “stop if pain”; escalate to professional when appropriate. |

---

## 11. Success metrics (MVP)

- **Completion:** % of sessions that reach **≥1 retry** after first feedback.
- **Engagement:** Retries per session; session length sanity (not infinite doom-scroll).
- **Return:** Day 2 / Day 7 return.
- **Qualitative:** “Felt clearer what to do” (in-app micro-prompt optional).

---

## 12. Naming

Working name **VoiceFix** emphasizes relief and clarity for beginners. Alternatives from earlier exploration: **Vocalens** (diagnostic “lens”), **Reson** (premium, abstract). Rename in this doc if product direction shifts.

---

## 13. What we explicitly do not claim (v1)

- We do not detect “true” resonance placement, diaphragm engagement, or medical conditions from a phone mic.
- We do not promise timeline to “sound professional.”
- We do not replace a qualified teacher for injury, pathology, or high-stakes performance prep.

---

## 14. Changelog

| Date | Change |
|------|--------|
| 2026-05-12 | Onboarding expanded into a 20+ screen detailed personalization assessment with voice check, diagnostic recap, plan reveal, and conversion bridge before first session. |
| 2026-05-10 | Initial `PRODUCT.md` from consolidated spec and research notes. |
