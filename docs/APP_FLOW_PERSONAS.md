# Rehear — App flow by user persona (detailed)

This document explains **what the user sees and does**, step by step, for **different kinds of beginners**. You do not need prior singing vocabulary; tricky words are explained in plain language.

**How this ties to the product:** Every persona goes through the **same type of session** (guided task → record → short feedback → one fix → retry → next exercise → summary). What changes is **which exercises come first, how many, and what the app says**—that is how **pedagogy (breath → pitch → …)** shows up without a separate “school mode.”

---

## Part A — Singing ideas in plain English (read once)

These are **labels we use in the personas**. They are not medical facts; they are **simple ways to talk about sound**.

| Idea | Plain meaning | What the app might notice |
|------|----------------|---------------------------|
| **Airflow / support** | Keeping air **steady** while you make sound—not necessarily “big breath,” but **not letting the note die or wobble** because you ran out of steam wrong. | Volume **drops** toward the end of a long tone; wobble; “breathy squeeze.” |
| **Pitch match** | Singing **the same note** the app played (higher/lower correct). | Cents off target; **wobble**; hitting wrong note entirely. |
| **Stability** | Note doesn’t **drift** or shake wildly when you try to hold it. | Jitter; drifting flat by the end of a phrase. |
| **Tension** | Throat/jaw **fighting** the sound—often feels like pushing, squeezing, or pain later. | Harsh/noisy tone; crack; reports strain (user); sometimes brighter “pressed” sound. |

**Important:** The app does **not** “see your diaphragm.” It hears **patterns** and uses careful wording: **“likely,” “sounds like,” “try this.”**

---

## Part B — The session shell (same for every persona)

Every full session follows this **chassis**. Only the **contents** of each box change.

```
┌─────────────────────────────────────────────────────────────────┐
│  0. Home  →  Start session (or: Resume / Foundation check)         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Optional: Foundation check (first launch or periodic)          │
│  2–3 tiny recordings → “Here’s what we’d focus on first”        │
│  (Soft recommendation—not a locked gate in the default product)│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Session header                                                  │
│  “Today • ~10–15 min • Focus: [short plain phrase]”            │
└─────────────────────────────────────────────────────────────────┘
                                    │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
   Exercise 1                  Exercise 2                 Exercise 3
   (see personas)              (see personas)              (see personas)
          │                          │                          │
          └──────────────────────────┴──────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  For EACH exercise, the same micro-loop:                        │
│  1) Instruction + demo (optional)  2) Record                    │
│  3) Feedback (1–2 bullets)         4) ONE fix (one sentence)     │
│  5) Retry same exercise            6) “Better / same / worse”*  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Session summary                                                 │
│  • Plain recap  • Optional save clips  • “Next time” hint       │
└─────────────────────────────────────────────────────────────────┘
```

\*Early MVP may skip numbers and only use qualitative comparison to **your last take**.

---

## Part C — Personas

Each persona has:

- **Profile** — who they are  
- **Signals** — what the app is likely to measure  
- **Foundation check result** — what we conclude the first time (example)  
- **Example session** — **Exercise 1 → 2 → 3** with **screen-by-screen** detail  
- **Why this ordering** — short pedagogical note  
- **Next sessions (outline)** — how the path shifts  

---

### Persona 1 — **Asha: “Air runs out” (weak airflow / support)**

**Profile:** Gets **quiet** or **shaky** at the end of long sounds. May feel “out of breath” even on short phrases. Pitch might be “okay” at the start then **falls apart**.

**Signals the model cares about:**  
- Loudness **curve** drops clearly in the last third of a sustained sound.  
- Pitch **drifts** (often flat) late in the note.  
- Sustained **hiss** (“ssss”) ends in steps or waves instead of steady.

**Foundation check (example conclusion):**  
“We heard **air dropping off** before the note finished. We’ll prioritize **steady air** drills for now.”

#### Example first session (detailed)

| Step | Screen | User action | App behavior / copy (example) |
|------|--------|-------------|----------------------------------|
| 1 | Home | Tap **Start** | Headline: “Three short exercises—about 12 minutes.” Sub: “Focus: **steady air**.” |
| 2 | Exercise 1 — Steady hiss | Read: “Breathe in through your nose. Make a **soft ‘ssss’** and keep it even until you need to stop.” Optional **Play demo** | Tap **Record** → hiss 12–15s → **Stop** |
| 3 | Feedback | — | **“We heard:** the ‘sss’ **faded early** / **wobbled** at the end.” **“Often means:** air isn’t leaving **smoothly**.” **One fix:** “Try again with a **smaller** hiss—easier to keep even.” |
| 4 | Retry | Tap **Try again** | Same screen → record again → “**vs last try:** a bit **steadier** / about the **same**.” |
| 5 | Exercise 2 — Sustain “Ah” on one comfortable note | “We’ll play a tone—sing **ah** and hold it **steady**. Don’t push loud.” | Record **same length** as tone |
| 6 | Feedback | — | **“We heard:** volume **dropped** in the last seconds” / pitch sagged. **One fix:** “Same note—think **slow leak** of air, not one big push at the start.” |
| 7 | Retry | — | Same exercise; compare takes. |
| 8 | Exercise 3 — Two-note step (slow) | “We play **do–re** slowly. Echo it on **ah**.” | Record |
| 9 | Feedback | — | May note **second note weaker**—ties back to support. **One fix:** “Connect with **continuous** air between the two.” |
| 10 | Summary | Tap **Done** | “**Today’s theme:** endings. Next time we’ll keep building **steady exits** before harder patterns.” Optional: save clips. |

**Why this order:** Hiss isolates **air** without pitch stress. Single pitch shows **support + pitch** together. Tiny step introduces **small pitch change** while air is still the lesson.

**Later sessions:** Add slightly longer sustains, **three-note** echoes, **lip trill** if needed—still tagged **airflow-first** until endings stop collapsing as often.

---

### Persona 2 — **Jordan: “Pitch is hard, breath feels fine” (weak pitch match, decent airflow)**

**Profile:** Can **hold** a comfortable note without huge dying-off. **Matching** a played note or singing intervals **on demand** is the struggle (flat/sharp, “can’t find” the note).

**Signals:**  
- On pitch-match tasks: **offset from target** in cents; large misses.  
- Loudness curve **less** dramatic than Persona 1.  
- Stability may still wobble **because of ear coordination**, not only air.

**Foundation check (example):**  
“Air is **okay for a short tone**. **Finding the note quickly** is the sticky part.”

#### Example first session

| Step | Screen | User action | App behavior / copy (example) |
|------|--------|-------------|----------------------------------|
| 1 | Home | Start | “Focus: **pitch matching**.” |
| 2 | Exercise 1 — Single reference tone | App plays **A3** for 3s. “Match **ah**. Hold ~5s.” | Record → match |
| 3 | Feedback | — | “**Sharp / flat** by roughly X” (or qualitative band). **One fix:** “**Hum** the tone first, then open to **ah** on the same pitch.” |
| 4 | Retry | — | Same target note. |
| 5 | Exercise 2 — Tone + same tone (confirm) | Replay same target: “Lock in twice.” | Record |
| 6 | Exercise 3 — Two-note pattern (slow, small interval) | “Echo **do–re** after the piano.” | Record |
| 7 | Feedback | — | If second note wrong: “**Second step** is usually harder—listen to the **gap** between notes.” |
| 8 | Summary | — | “**Today:** pitch targets. Tomorrow: slightly **wider** steps or a tiny scale—still slow.” |

**Why order still starts easy:** Even “pitch-first” days include **one** breath-adjacent warm-up in a fuller library (e.g. short hum before match)—not because Jordan failed breathing, but because **warm, easy phonation** reduces **unnecessary tension** that **looks** like pitch error.

**Later sessions:** **Half-step / whole-step** drills; **slow scales**; optional **hide reference after** you heard it once (advanced feature).

---

### Persona 3 — **Riley: “Okay on easy stuff, strains when going higher” (tension / pushing)**

**Profile:** Comfortable **mid** range on short tasks. **Neck/throat feels tight**, or sound gets **hooty/pressed** when climbing; may **crack** early.

**Signals:**  
- On higher guided patterns: noisier spectrum or **pitch instability** at the top.  
- User may report discomfort (in-app **“any strain?”** check later—not MVP blocker).  
- Lower exercises may look “fine.”

**Foundation check:**  
“Easy notes work; **step-ups** get scratchy or tight.”

#### Example first session (no injury—stay mid range first)

| Step | Screen | User action | App behavior / copy (example) |
|------|--------|-------------|----------------------------------|
| 1 | Home | Start | “Focus: **easy coordination** first—no pushing high today.” |
| 2 | Exercise 1 — Lip trill or gentle hum | “Loose **brrr** on a **mid** slide or small pattern.” | Record |
| 3 | Feedback | — | “We’re listening for **smooth** changes, not power.” **One fix:** “**Softer** volume, **tiny** steps.” |
| 4 | Exercise 2 — Small step in **comfortable** range | Two-note pattern **not** at top of range | Record |
| 5 | Exercise 3 — **Sustain mid ah** | Single note—watch for **pressing** | Record |
| 6 | Summary | — | “We kept you **out of the strain zone** today. If anything **hurt**, stop and rest—that’s not ‘push through.’” |

**Why this path:** We **do not** reward “hit the high note” if it trains **squeeze**. The roadmap still applies: **coordination before stretch**. High range expansion comes **after** repeated smooth mid-range wins.

**Later sessions:** Gradually **raise the ceiling** in **small** semitone steps with **frequent** checks.

---

### Persona 4 — **Sam: “True beginner, everything is medium-bad” (balanced weak)**

**Profile:** Nothing feels **terrible** alone, nothing **good** yet—classic **everything at 4/10** early on.

**Signals:** Mix of mild breath drift, mild pitch miss, mild wobble—no single **dominant** flag.

**Foundation check:**  
“**Foundation mix**—we’ll train **small wins** across two pillars at once.”

#### Example first session (same day: a little breath + a little pitch—but ordered)

| Step | Screen | User action | App behavior / copy (example) |
|------|--------|-------------|----------------------------------|
| 1 | Home | Start | “Today: **foundation mix**.” |
| 2 | Exercise 1 — Hiss **or** lip trill (2 min) | Steady air | Record / retry |
| 3 | Exercise 2 — One reference tone | Simple match | Record / retry |
| 4 | Exercise 3 — 3-note echo (very slow) | Tiny melody | Record / retry |
| 5 | Summary | — | “**Two themes:** steady air **and** listening for target pitches—we’ll see which ‘lights up’ first as you log more sessions.” |

**Why both same day:** Sam isn’t **blocked** from pitch for a month. Order is **foundation → single pitch → pattern** so pitch isn’t **abstract**. The app watches which skill **separates** first and **tilts** future sessions (becomes more like Persona 1 or 2 over time).

---

### Persona 5 — **Morgan: “Nervous / embarrassed” (low confidence, shaky performance on record)**

**Profile:** **Knows** basics a bit or not—**freezes** on recording, **rushes**, **quits early**, **quiet** voice.

**Signals:**  
- Very **short** takes; **volume** low; **timing** rushed vs metronome.  
- May look “bad at everything” **only** because of performance anxiety, not only skill.

**Foundation check:**  
“Hard to tell—we only got **tiny** samples. Let’s shorten drills and **normalize** recording.”

#### Example first session (UX-heavy, same engine)

| Step | Screen | User action | App behavior / copy (example) |
|------|--------|-------------|----------------------------------|
| 1 | Home | Start | Calm copy: “**Private** practice—nothing posts anywhere.” |
| 2 | Exercise 1 — **10s max** hiss or hum | Shorter target | Record |
| 3 | Feedback | — | Emphasize **completion**, not perfection: “You **finished**—that’s the bar today.” |
| 4 | Exercise 2 — Unison tone | Single note, **soft** OK | Record |
| 5 | Exercise 3 — Optional **second** retry slot — user may **skip** third exercise in MVP flag | — | “**Skip** is okay—we’re building habit.” |
| 6 | Summary | — | “**Streak:** you showed up. Next session can be identical difficulty.” |

**Why:** Pedagogy still runs, but **retention** requires **emotional safety**—same loop, **gentler** thresholds and shorter bars.

---

### Persona 6 — **Taylor: “Used to play an instrument” (good ear, weak vocal control)**

**Profile:** Can **hear** when something’s off; **executing** with voice is hard—**mind–body lag**.

**Signals:** Pitch error may be **small** but **inconsistent**; **timing** good; **breath** varies under stress.

**Foundation check:**  
“**Ear** ahead of **voice**—we’ll use **slow** targets and **immediate** retry.”

#### Example first session

- Same structure as **Persona 2–4 mix**, but copy often says: **“You **heard** it—let’s get one **clean** repeat.”**  
- Exercises: slow match, then **echo**; possibly **sing back** a rhythm on one pitch.

**Why:** **Validation** reduces frustration; drills still **kinesthetic**—ear alone isn’t enough.

---

## Part D — How the router uses this (conceptual)

After each session the app updates a **simple internal picture** (not shown raw to user in MVP):

- **Dominant issue bucket:** `air` | `pitch` | `tension` | `mixed` | `unknown`  
- **Session count / streak**  
- **Last exercise difficulties passed** (rule-based)

**Next session playlist** = mostly exercises **tagged** for the weakest bucket + **one** “stretch” item when safe.

That is **how the months-long roadmap enters**: tags like `phase_foundation`, `phase_pitch`, `phase_range_safe` attach to exercises; the router walks the user **through** them without forcing a calendar.

---

## Part E — What this document is not

- Not a promise that **one app session** fixes breathing or pitch **permanently**.  
- Not a substitute for a vocal teacher if there is **pain**, lasting hoarseness, or **professional** vocal goals.  
- Not claiming perfect separation of “breath problems” vs “pitch problems”—often **coupled**; the app prioritizes **what’s most obvious** in **measured** drills.

---

## Changelog

| Date | Author | Note |
|------|--------|------|
| 2026-05-10 | — | First version: six personas, full session shell, routing outline. |
