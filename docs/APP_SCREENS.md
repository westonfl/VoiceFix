# VoiceFix - Screen catalog (onboarding + main app)

Visual and interaction spec so you can picture each screen. Layout is platform-agnostic, phone-first, and can adapt to web.

**Related:** [`PRODUCT.md`](PRODUCT.md) (what we build), [`APP_FLOW_PERSONAS.md`](APP_FLOW_PERSONAS.md) (how sessions differ by user type), [`BRAND_DESIGN_SYSTEM.md`](BRAND_DESIGN_SYSTEM.md) (dark-first brand, visual language, and UI tokens).

**Conventions**

- **Screen ID** - stable name for design/engineering (e.g. `ONB-04`).
- **Primary action** - one main button per screen when possible.
- **Back** - system back / top-left chevron unless noted.
- Copy in *italics* is example text, not final marketing.

---

## Navigation model (after onboarding)

```
┌──────────────────────────────────────┐
│            Screen content            │
├──────────────────────────────────────┤
│  [ Today ]    [ Journal ]  [ Settings ] │
└──────────────────────────────────────┘
```

- **Today** - start or continue practice; session lives here.
- **Journal** - saved sessions and clips.
- **Settings** - privacy, mic, account, safety copy, plan preferences.

During a session, hide the tab bar and show session progress instead.

---

# Part 1 - Long onboarding

Onboarding should be **20+ screens minimum**. The goal is not to teach everything; the goal is to make the user feel, before the first session, that VoiceFix has understood their situation and built a personal plan. This is closer to a high-conversion coaching intake than a short app intro.

The user should finish onboarding thinking:

> This app knows what I want, what feels hard, how much time I have, how nervous I am, and what my first practice focus should be.

## Onboarding principles

- Long onboarding is allowed because singing is personal, emotional, and confusing for beginners.
- Each screen should ask only one thing or explain one concept.
- Every answer should visibly feed the personalized plan.
- The flow should include both **declared data** (quiz answers) and **behavioral data** (short recordings).
- The voice check should feel like a gentle baseline, not a pass/fail exam.
- The plan reveal should feel earned: "based on your answers + your voice check."
- Keep skip paths, but do not make skipping the recommended path.

## Full onboarding flow overview (24 screens)

```
ONB-01  Splash
ONB-02  Core promise
ONB-03  Why this is not karaoke scoring
ONB-04  Goal
ONB-05  Desired use case
ONB-06  Experience level
ONB-07  Learning history
ONB-08  Voice symptom picker
ONB-09  Biggest frustration
ONB-10  Playback comfort
ONB-11  Feedback style
ONB-12  Practice time
ONB-13  Practice environment
ONB-14  Voice health / strain
ONB-15  Privacy and mic trust
ONB-16  Mic permission
ONB-17  Voice check intro
ONB-18  Recording check 1: steady hiss
ONB-19  Recording check 2: gentle hum
ONB-20  Recording check 3: sustained ah
ONB-21  Recording check 4: pitch match
ONB-22  Recording check 5: three-note echo
ONB-23  Building plan / analysis
ONB-24  Diagnostic recap
ONB-25  14-day plan reveal
ONB-26  First session preview
ONB-27  Conversion bridge
ONB-28  Ready to start
```

The requirement is **minimum 20 screens**. The recommended product spec is **28 screens**, with `ONB-27` optional for very early MVP if monetization is not present yet.

## Data captured by onboarding

| Category | Screens | Used for |
|---|---:|---|
| Motivation | `ONB-04` to `ONB-05` | Plan framing, first win language, future content recommendations |
| Experience | `ONB-06` to `ONB-07` | Difficulty, amount of explanation, how fast to introduce pitch tasks |
| Symptoms | `ONB-08` to `ONB-09` | Initial routing bucket: air, pitch, tension, mixed, confidence |
| Emotional safety | `ONB-10` to `ONB-11` | Playback defaults, directness of copy, shame-aware thresholds |
| Logistics | `ONB-12` to `ONB-13` | Session length, reminder timing, mic/headphone tips |
| Safety | `ONB-14` | Avoid range pressure; professional referral copy if needed |
| Permission/trust | `ONB-15` to `ONB-16` | Mic permission conversion |
| Behavioral baseline | `ONB-17` to `ONB-22` | Starter focus and first-session drill selection |
| Plan conversion | `ONB-23` to `ONB-28` | Commitment, perceived personalization, first-session start |

---

## Detailed onboarding screens

### ONB-01 - Splash / brand

| | |
|---|---|
| **Purpose** | Brand moment; load app. |
| **Primary action** | Auto-advance or tap. |
| **Data captured** | None. |

**Content**

- Logo / wordmark: **VoiceFix**
- Tagline: *Hear what changed.*
- Tone: calm, precise, not flashy.

---

### ONB-02 - Core promise

| | |
|---|---|
| **Purpose** | Explain the product in one human promise. |
| **Primary action** | **Build my voice plan** |
| **Data captured** | Onboarding started. |

**Copy direction**

- *Short voice checks. One likely issue. One thing to try next.*
- *We compare you to your last take, not to a celebrity.*

**Design note:** This screen should feel like relief, not hype.

---

### ONB-03 - Why this is not karaoke scoring

| | |
|---|---|
| **Purpose** | Differentiate before asking many questions. |
| **Primary action** | **Continue** |
| **Data captured** | User saw positioning. |

**Content blocks**

- **Karaoke apps:** Did you hit the note?
- **VoiceFix:** What probably made the note unstable?
- **Your plan:** Try one fix, repeat the same task, compare against yourself.

---

### ONB-04 - Primary goal

| | |
|---|---|
| **Purpose** | Capture main transformation goal. |
| **Primary action** | Select one option, then **Continue**. |
| **Data captured** | `primary_goal` |

**Options**

- Hit notes more reliably
- Stop sounding shaky or thin
- Sing higher without pushing
- Feel less embarrassed recording
- Build a consistent practice habit

---

### ONB-05 - Desired use case

| | |
|---|---|
| **Purpose** | Understand where the user wants to use their voice. |
| **Primary action** | Select one or more. |
| **Data captured** | `use_case[]` |

**Options**

- Singing alone at home
- Karaoke
- Choir / worship / group singing
- Posting covers online
- Preparing for lessons
- Speaking / mic confidence

**Routing note:** Speaking/mic confidence can later route to adjacent vocal-control content without changing the core product.

---

### ONB-06 - Experience level

| | |
|---|---|
| **Purpose** | Set difficulty and vocabulary level. |
| **Primary action** | Select one. |
| **Data captured** | `experience_level` |

**Options**

- Total beginner
- Self-taught
- Returning after a break
- Some lessons before
- Musician, but not trained vocally

---

### ONB-07 - Learning history

| | |
|---|---|
| **Purpose** | Detect tool fragmentation and existing habits. |
| **Primary action** | Select all that apply. |
| **Data captured** | `learning_sources[]` |

**Options**

- YouTube lessons
- Tuner / pitch apps
- Karaoke apps
- Teacher / coach
- Choir practice
- I mostly just sing songs

**Copy direction:** *This helps us avoid giving you another disconnected exercise list.*

---

### ONB-08 - Voice symptom picker

| | |
|---|---|
| **Purpose** | Capture what the user hears as wrong. |
| **Primary action** | Select all that apply. |
| **Data captured** | `reported_symptoms[]` |

**Options**

- My sound fades at the end
- I drift flat or sharp
- My notes wobble
- My voice sounds breathy
- My voice sounds harsh or squeezed
- I crack when going higher
- I rush or lose timing
- I cannot tell what is wrong

---

### ONB-09 - Biggest frustration

| | |
|---|---|
| **Purpose** | Capture emotional pain, not just technique. |
| **Primary action** | Select one. |
| **Data captured** | `biggest_frustration` |

**Options**

- I do not know what to practice
- I sound worse on recordings
- I can match notes only with a guide
- I feel embarrassed practicing
- I improve one day and lose it the next

---

### ONB-10 - Playback comfort

| | |
|---|---|
| **Purpose** | Shame-aware defaults. |
| **Primary action** | Select one. |
| **Data captured** | `playback_comfort` |

**Options**

- I hate hearing my recorded voice
- I can listen if it helps
- I want before/after playback
- I prefer metrics first, playback later

**UX rule:** If user hates playback, do not auto-play clips after recording.

---

### ONB-11 - Feedback style

| | |
|---|---|
| **Purpose** | Tune copy tone. |
| **Primary action** | Select one. |
| **Data captured** | `feedback_style` |

**Options**

- Gentle and encouraging
- Direct but not harsh
- Technical once I understand the basics

**Copy examples**

- Gentle: *Try making the sound smaller first.*
- Direct: *The ending faded; repeat with less push at the start.*
- Technical: *The loudness curve dropped in the last third.*

---

### ONB-12 - Practice time

| | |
|---|---|
| **Purpose** | Match plan length to reality. |
| **Primary action** | Select one. |
| **Data captured** | `practice_length` |

**Options**

- 5 minutes most days
- 10-12 minutes
- 20 minutes
- I am not sure yet

**Routing note:** "Not sure" defaults to the smallest repeatable plan.

---

### ONB-13 - Practice environment

| | |
|---|---|
| **Purpose** | Reduce failed recordings and anxiety. |
| **Primary action** | Select all that apply. |
| **Data captured** | `practice_environment[]` |

**Options**

- Quiet room
- Shared space
- Car
- Headphones available
- Phone mic only
- I need to practice quietly

**Routing note:** Quiet practice routes toward hums and soft drills first.

---

### ONB-14 - Voice health / strain

| | |
|---|---|
| **Purpose** | Safety boundary. |
| **Primary action** | Select one. |
| **Data captured** | `strain_status` |

**Options**

- No pain or strain
- Sometimes tight
- Pain when singing
- Not sure

**Required copy:** *VoiceFix is practice feedback, not medical advice. If singing hurts, stop and consider a qualified professional.*

**Routing note:** Pain disables range-growth positioning and routes to gentle reset / referral copy.

---

### ONB-15 - Privacy and mic trust

| | |
|---|---|
| **Purpose** | Make mic permission feel safe. |
| **Primary action** | **Continue to microphone** |
| **Data captured** | Trust screen viewed. |

**Content**

- VoiceFix listens only during exercises you start.
- Clips are private by default.
- Saved clips are used for your journal and progress comparisons.
- You can delete saved clips later.

---

### ONB-16 - Microphone permission

| | |
|---|---|
| **Purpose** | OS mic permission. |
| **Primary action** | **Allow microphone** |
| **Data captured** | `mic_permission_status` |

**Denied state**

- Explain that the voice check needs a mic.
- Primary: **Open settings**
- Secondary: **Continue without voice check** (allowed, but plan confidence is lower).

---

### ONB-17 - Voice check intro

| | |
|---|---|
| **Purpose** | Frame recordings as baseline, not test. |
| **Primary action** | **Start voice check** |
| **Data captured** | Voice check started. |

**Content**

- *Five tiny recordings help us personalize your first plan.*
- *This is not a grade.*
- *If something feels uncomfortable, stop.*

**Progress indicator:** `1 of 5` once recording begins.

---

### ONB-18 - Recording check 1: steady hiss

| | |
|---|---|
| **Purpose** | Airflow steadiness proxy. |
| **Primary action** | **Record** then **Stop** |
| **Data captured** | Audio sample; duration; loudness envelope. |

**Instruction**

*Take a comfortable breath. Make a soft "sss" and keep it even until you naturally stop.*

**Listens for**

- Duration
- Evenness
- Drop-off near the end

---

### ONB-19 - Recording check 2: gentle hum

| | |
|---|---|
| **Purpose** | Gentle phonation and comfort baseline. |
| **Primary action** | **Record** then **Stop** |
| **Data captured** | Audio sample; stability; user comfort confirmation. |

**Instruction**

*Hum softly on one comfortable pitch. It should feel easy, not loud.*

**Listens for**

- Stability
- Roughness / noise proxy (cautious)
- Whether user reports strain

---

### ONB-20 - Recording check 3: sustained ah

| | |
|---|---|
| **Purpose** | Combine pitch, tone, and airflow. |
| **Primary action** | **Record** then **Stop** |
| **Data captured** | Audio sample; F0 stability; loudness curve. |

**Instruction**

*Sing "ah" on one comfortable note for about five seconds.*

**Listens for**

- Pitch drift
- Wobble
- End-of-note fade

---

### ONB-21 - Recording check 4: pitch match

| | |
|---|---|
| **Purpose** | Basic pitch target behavior. |
| **Primary action** | **Play tone**, then **Record** |
| **Data captured** | Target pitch; offset; stability. |

**Instruction**

*Listen to the note. Sing "ah" and try to match it.*

**Listens for**

- Sharp / flat tendency
- How quickly user finds the pitch
- Stability after finding it

---

### ONB-22 - Recording check 5: three-note echo

| | |
|---|---|
| **Purpose** | Tiny melodic coordination. |
| **Primary action** | **Play pattern**, then **Record** |
| **Data captured** | Interval matching; timing; connection between notes. |

**Instruction**

*Listen to three slow notes, then echo them on "ah."*

**Listens for**

- Which note is hardest
- Whether pitch falls apart during movement
- Timing confidence

---

### ONB-23 - Building plan / analysis

| | |
|---|---|
| **Purpose** | Processing moment that makes personalization feel real. |
| **Primary action** | Auto-advance. |
| **Data captured** | None. |

**Visible analysis steps**

- Reading your goals
- Checking comfort and safety
- Comparing the five voice samples
- Choosing your first focus
- Building your first 14 days

**Timing:** 3-6 seconds; do not fake long waits.

---

### ONB-24 - Diagnostic recap

| | |
|---|---|
| **Purpose** | Show why the plan will be personal. |
| **Primary action** | **See my plan** |
| **Data captured** | Recap viewed. |

**Content**

- **From your answers:** e.g. *You want steadier tone and feel nervous about playback.*
- **From the voice check:** e.g. *Endings faded more than starts; pitch was easier on one note than moving notes.*
- **Careful claim:** *This suggests a steady-air foundation first, not a full diagnosis.*

**UX rule:** Use "suggests" and "likely"; avoid absolute cause claims.

---

### ONB-25 - 14-day plan reveal

| | |
|---|---|
| **Purpose** | Main conversion moment. |
| **Primary action** | **Preview first session** |
| **Data captured** | Plan shown. |

**Required content**

- Starting focus: e.g. **Steady air at endings**
- Why this focus was chosen
- Days 1-3: baseline loop
- Days 4-9: repeat what moved
- Days 10-14: first progress proof
- What will unlock later if the user keeps practicing

**Design note:** This should feel like a plan, not a static result card.

---

### ONB-26 - First session preview

| | |
|---|---|
| **Purpose** | Reduce anxiety before starting. |
| **Primary action** | **Continue** |
| **Data captured** | First session preview viewed. |

**Example session**

1. Steady hiss
2. Soft ah sustain
3. Two-note connection

**Copy**

*Each drill has the same loop: record, get one note, try once more, compare to yourself.*

---

### ONB-27 - Conversion bridge

| | |
|---|---|
| **Purpose** | Set up monetization without blocking the first win. |
| **Primary action** | **Start free first session** |
| **Secondary action** | **See what premium adds** |
| **Data captured** | Conversion exposure. |

**Free promise**

- First personalized session
- Basic feedback
- Limited daily checks

**Premium preview**

- Unlimited sessions
- Deeper journal history
- More plan adaptation
- Before/after comparisons over time

**Rule:** Do not paywall the first meaningful result.

---

### ONB-28 - Ready to start

| | |
|---|---|
| **Purpose** | Bridge onboarding to the first session. |
| **Primary action** | **Start first session** |
| **Secondary action** | **Do it later** |
| **Data captured** | Onboarding completed. |

**Content**

- *You're set.*
- First session length
- Focus
- 3 drills
- Safety reminder: stop if it hurts

---

## Onboarding routing buckets

| Bucket | Trigger examples | First focus |
|---|---|---|
| `air` | Fading endings, short hiss, loudness drop | Steady air at endings |
| `pitch` | Pitch-match misses, flat/sharp symptom | Finding and holding one pitch |
| `tension` | Range goal + tightness/strain | Easy coordination before range |
| `confidence` | Hates playback, embarrassed, short takes | Private tiny wins |
| `mixed` | No dominant signal | Foundation mix |
| `safety` | Pain when singing | Gentle reset + professional boundary |

---

# Part 2 - Main app

Main app = **Today tab** (repeatable sessions) + **Journal** + **Settings**. Core repetition: **instruction -> record -> feedback -> retry -> next exercise -> summary**.

## Session flow overview

```
MAIN-01 -> MAIN-02 -> MAIN-03 -> MAIN-04 -> MAIN-05 -> MAIN-06
 Today      Intro      Instruct   Record    Feedback   Retry result
                         ^                     |
                         |_____________________|

After 3 drills -> MAIN-08 Summary -> MAIN-01 Today or MAIN-10 Journal
```

---

### MAIN-01 - Today

| | |
|---|---|
| **Purpose** | Habit entry; show focus + streak light. |
| **Entry** | Tab **Today**; end of onboarding; end of session. |
| **Exit** | **Start session** -> `MAIN-02`. |

**Content**

- Today's focus
- Session length
- Three drills
- Last session delta if available
- Option to retake voice control check later

---

### MAIN-02 - Session intro

| | |
|---|---|
| **Purpose** | Set scope before exercise 1. |
| **Exit** | **Begin** -> `MAIN-03`. |

**Content**

- Focus
- Drill list
- Find a quiet spot
- Headphones help
- Safety reminder if strain bucket

---

### MAIN-03 - Exercise instruction

| | |
|---|---|
| **Purpose** | Explain this drill only. |
| **Exit** | **Record** -> `MAIN-04`. |

**Content**

- Drill title
- One-sentence instruction
- Optional play example
- What not to do (only if safety-relevant)

---

### MAIN-04 - Recording

| | |
|---|---|
| **Purpose** | Capture take. |
| **Exit** | **Stop** -> `MAIN-05`. |

**Content**

- Timer
- Live waveform or simple recording indicator
- Stop button
- Optional target tone

---

### MAIN-05 - Feedback

| | |
|---|---|
| **Purpose** | 1-2 observations + one fix; no score wall. |
| **Exit** | **Try again** -> `MAIN-04`; secondary **Continue without retry**. |

**Rule:** Encourage one retry before continuing, but do not trap the user.

---

### MAIN-06 - Retry result

| | |
|---|---|
| **Purpose** | Compare this take vs previous take on the same drill. |
| **Exit** | **Next exercise** -> `MAIN-03` or `MAIN-08`. |

**Copy bands**

- A bit better
- About the same
- Harder this time

No fake precision percentages in MVP.

---

### MAIN-07 - Between exercises

| | |
|---|---|
| **Purpose** | Short reset between drills. |
| **Exit** | **Continue** -> next `MAIN-03`. |

**Content**

- Progress: `1 of 3 done`
- Up next
- Encouraging but not childish copy

---

### MAIN-08 - Session summary

| | |
|---|---|
| **Purpose** | Close loop and save progress. |
| **Exit** | **Done** -> `MAIN-01`; **View journal** -> `MAIN-10`. |

**Content**

- Today's focus
- Best movement
- One thing still hard
- Next session hint
- Save clips toggle

---

### MAIN-09 - Empty journal

| | |
|---|---|
| **Purpose** | Explain future value of saved sessions. |
| **Exit** | **Start session** -> `MAIN-02`. |

**Content**

- What will appear here
- Why clips matter
- Privacy reassurance

---

### MAIN-10 - Journal detail

| | |
|---|---|
| **Purpose** | Show saved clips and interpreted progress. |
| **Exit** | Back to Journal or Today. |

**Content**

- Date
- Focus
- Before/after clips
- Plain-language delta
- Delete clip option

---

### MAIN-11 - Settings

| | |
|---|---|
| **Purpose** | Preferences and trust controls. |
| **Exit** | Any settings sub-screen. |

**Content**

- Playback defaults
- Feedback style
- Practice length
- Privacy
- Mic permission
- Safety note
