# VoiceFix - Brand and Design System

Source of truth for brand direction, visual language, interaction patterns, and UI tokens. This doc should guide product copy, design mockups, and implementation across the mobile app.

Related docs: [`PRODUCT.md`](PRODUCT.md), [`APP_SCREENS.md`](APP_SCREENS.md), [`APP_FLOW_PERSONAS.md`](APP_FLOW_PERSONAS.md)

---

## 1. Brand Core

### 1.1 Brand idea

VoiceFix is a calm practice companion that helps singers hear what changed, try one focused adjustment, and repeat the same exercise with less guesswork.

The product should feel like a voice debugger: observe the signal, name the likely pattern, try one small fix, and rerun the same drill.

### 1.2 Positioning

**One-line positioning:** Find what is going on with your voice in a few minutes; try one small fix; repeat the same exercise and see if it moved.

**Short tagline options:**

- Hear what changed.
- One small fix. One clearer take.
- Practice with a feedback loop.
- Less guessing between takes.

Use **Hear what changed.** as the default splash/onboarding tagline unless a later brand round replaces it.

### 1.3 Brand promise

VoiceFix does not promise to make someone a professional singer or replace a teacher. It promises a tighter practice loop:

- short guided exercises
- plain feedback
- one useful cue
- a retry on the same task
- progress compared to the user's own last take

### 1.4 Brand personality

| Trait | What it means in product | Avoid |
|------|---------------------------|-------|
| Calm | Low-pressure, private, steady pacing. | Hype, panic, urgency, shame. |
| Specific | Names one pattern and one next action. | Generic praise or vague critique. |
| Humble | Uses careful language: "likely," "sounds like," "often." | Medical claims or overconfident diagnosis. |
| Encouraging | Treats practice as repeatable, not as talent judgment. | Scores that feel like grades. |
| Focused | One exercise, one fix, one retry. | Dense dashboards during practice. |

### 1.5 Brand archetype

VoiceFix should feel like a patient coach's notebook plus an audio lab. It is not a karaoke game, a social performance app, or a medical voice tool.

---

## 2. Naming and Language

### 2.1 Product name

**VoiceFix**

The name should read as practical relief: something sounds off, and the app helps you find a small fix to try. Do not make "fix" sound like the user is broken.

### 2.2 Vocabulary

Prefer plain language over vocal pedagogy jargon.

| Prefer | Use carefully | Avoid |
|--------|---------------|-------|
| what we heard | analysis, diagnosis | grade, score, failure |
| one thing to try | correction | flaw, problem with your voice |
| steady air | breath support | diaphragm diagnosis |
| pitch match | intonation | bad ear |
| a bit better | improvement percentage | perfect, professional |
| try again | retry, rerun | pass/fail |

### 2.3 Feedback copy rules

Feedback should follow this pattern:

1. **Observation:** "Volume dipped at the end of the note."
2. **Likely interpretation:** "That often means the air thinned out before the note finished."
3. **One fix:** "Try the same note with a smaller sound, like a slow leak of air."
4. **Retry:** "Try again on the same note."

Keep feedback to 1-2 observations and one cue. The app should never dump every signal it detected.

### 2.4 Safety language

Use direct, calm language around strain:

- "If your throat hurts, stop and rest."
- "This app is for practice feedback. It does not replace a vocal teacher or medical professional."
- "Do not push for a high note today."

Avoid fear-based safety copy. The app should be clear without sounding alarming.

---

## 3. Visual Direction

### 3.1 Design mood

VoiceFix is **dark-first**. The visual mood should sit between a premium dark music app and a restrained cyberpunk signal interface: moody, technical, musical, and cool, without becoming a game HUD.

The target direction is **Midnight Signal Studio**:

- a dark recording room
- audio waveform light
- cyan signal accents
- small violet/magenta energy
- soft glassy panels
- clear human feedback copy

The product should feel like the user is stepping into a private voice lab, not onto a stage.

Design keywords:

- focused
- clear
- nocturnal
- musical
- signal-driven
- lightly cyberpunk
- premium dark mode
- private
- repeatable

Avoid:

- full cyberpunk overload
- neon karaoke energy
- heavy gamification
- hacker-terminal aesthetics
- medical-clinic sterility
- generic wellness beige
- dense audio-engineering dashboards
- pure black screens with harsh white text
- glow on every element

### 3.2 Visual principles

1. **Practice first:** The main screen should make starting or continuing a session obvious.
2. **One dominant action:** Each step should have one primary command.
3. **Progress is personal:** Visuals compare this take to the last take, not to an ideal singer.
4. **Graphs support copy:** Waveforms and meters should confirm the state, not dominate the screen.
5. **No shame states:** Empty, failed, or noisy recordings should stay gentle and actionable.
6. **Neon is a signal, not decoration:** Bright cyan, violet, and magenta should mean active recording, progress, focus, or comparison.
7. **Cool visuals, human words:** The UI can look technical; the copy must stay calm and plain.

### 3.3 Cyberpunk restraint rules

Use these rules to keep the design in the intended middle zone:

| Do | Avoid |
|----|-------|
| Dark navy/graphite backgrounds | Pure black everywhere |
| One neon accent per screen | Cyan, pink, purple, green all competing |
| Subtle waveform glow | Giant glowing panels |
| Crisp cards with faint borders | Overdesigned sci-fi frames |
| Technical rhythm in meters/progress | Fake terminal code or hacker motifs |
| Soft gradients behind audio moments | Decorative gradient blobs |

### 3.4 First visual proof screens

Before committing the entire product to this style, design or prototype these four screens first:

1. **Splash / brand** - proves logo, darkness, and tagline.
2. **Today home** - proves daily practice can still feel simple.
3. **Recording** - proves the music/signal mood.
4. **Feedback / retry result** - proves the cyberpunk layer does not make critique feel cold.

---

## 4. Color System

The current Expo template uses placeholder teal values in `mobile/constants/theme.ts`. Replace those with the dark-first product tokens below when building the real UI.

VoiceFix should default to dark mode. A light theme may exist later for accessibility or platform preference, but the brand direction is defined by the dark palette.

### 4.1 Dark-first palette

| Token | Hex | Use |
|-------|-----|-----|
| `void.950` | `#070A10` | App background, splash background |
| `void.900` | `#0B1018` | Primary screen background |
| `void.850` | `#101722` | Elevated sections |
| `void.800` | `#151E2B` | Cards, tab bar, modals |
| `void.700` | `#203044` | Pressed surfaces, strong borders |
| `text.100` | `#F1F7FA` | Primary text |
| `text.300` | `#B8C7D3` | Secondary text |
| `text.500` | `#788897` | Muted labels, inactive icons |
| `signal.400` | `#32E6E2` | Primary neon accent, active recording |
| `signal.500` | `#17C9D2` | Primary buttons, selected tab |
| `signal.700` | `#0C7F8B` | Pressed primary, deeper accents |
| `signal.900` | `#073F49` | Soft cyan surfaces |
| `violet.400` | `#9B7CFF` | Journal/history accent, secondary glow |
| `magenta.400` | `#F05ACB` | Rare energy accent, focus highlights |
| `coral.400` | `#FF7A70` | Strain, pain, destructive action |
| `amber.400` | `#F4B85E` | Needs attention, in-progress |
| `green.400` | `#64D99A` | Better, saved, complete |

### 4.2 Supporting light palette

Light mode is secondary. If implemented, it should feel like a daylight version of the same studio interface, not a separate beige wellness brand.

| Token | Hex | Use |
|-------|-----|-----|
| `day.000` | `#F7FAFC` | Light app background |
| `day.050` | `#EEF4F8` | Subtle section background |
| `day.100` | `#DCE7EE` | Borders and dividers |
| `day.900` | `#101722` | Primary text |
| `day.700` | `#394858` | Secondary text |
| `signal.600` | `#108C98` | Light theme primary |
| `violet.600` | `#6F58D9` | Light theme journal accent |

### 4.3 Color usage

- Use `signal` for practice progress, primary buttons, active tabs, waveform peaks, and recording-ready states.
- Use `coral` only for pain, strain, destructive actions, or leaving a session.
- Use `green` sparingly for "a bit better," saved clips, and complete states.
- Use `violet` for Journal so history feels distinct from today's active practice.
- Use `magenta` only as a rare accent for focus moments, never as a default button color.
- Do not use red/yellow/green as a constant scorecard. That makes the app feel like grading.

### 4.4 Glow and gradient rules

Glow should feel like light emitted from audio data.

- Primary glow: cyan at 12-24% opacity.
- Secondary glow: violet or magenta at 8-16% opacity.
- Use glow on recording controls, active waveform, progress confirmations, and the logo mark.
- Do not put glow behind large blocks of text.
- Do not use decorative orbs, bokeh blobs, or random neon clouds.
- Gradients should be subtle radial or linear lighting inside real UI moments, especially waveform and recording states.

### 4.5 Suggested screen color recipe

| Screen | Background | Main accent | Secondary accent |
|--------|------------|-------------|------------------|
| Splash | `void.950` | `signal.400` logo glow | `violet.400` edge light |
| Today | `void.900` | `signal.500` Start session | `green.400` last session improvement |
| Recording | `void.950` | `signal.400` waveform | `magenta.400` peak accents |
| Feedback | `void.900` | `signal.500` Try again | `amber.400` likely note |
| Journal | `void.900` | `violet.400` saved history | `signal.400` clip playback |
| Settings | `void.900` | `signal.500` toggles | `coral.400` safety/destructive |

---

## 5. Typography

### 5.1 Font stack

Use platform system fonts for the MVP:

- iOS: SF Pro / SF Pro Rounded where available
- Android: Roboto
- Web: system UI stack

Rounded typography can be used for brand moments, focus labels, and friendly headings. Body copy should stay highly readable.

For the dark/cyberpunk direction, typography should stay more **premium music app** than sci-fi poster. Do not use novelty cyber fonts for body text. A slightly technical mono style may be used for timers, pitch labels, and compact signal metadata.

### 5.2 Type scale

| Role | Size | Line height | Weight | Use |
|------|------|-------------|--------|-----|
| Display | 34 | 40 | 700 | Splash, major onboarding promise |
| Title | 28 | 34 | 700 | Screen titles |
| Section | 22 | 28 | 700 | Exercise names, summary headings |
| Body | 16 | 24 | 400 | Instructions, feedback |
| Body strong | 16 | 24 | 600 | Key phrase inside body |
| Caption | 13 | 18 | 500 | Timers, helper text, metadata |
| Tab | 12 | 16 | 600 | Tab labels |
| Signal mono | 13 | 18 | 600 | Timers, cents, take labels |

### 5.3 Typography rules

- Keep exercise instructions short enough to read before recording.
- Use sentence case for headings and buttons.
- Do not use all caps except tiny internal labels, and even then prefer title case.
- Keep line length comfortable: 32-45 characters on phone layouts.
- Use mono text only for data-like details, not emotional feedback.
- Avoid aggressive tracking or condensed display type.

---

## 6. Layout and Spacing

### 6.1 Grid

Use a 4-point spacing system.

| Token | Value |
|-------|-------|
| `space.1` | 4 |
| `space.2` | 8 |
| `space.3` | 12 |
| `space.4` | 16 |
| `space.5` | 20 |
| `space.6` | 24 |
| `space.8` | 32 |
| `space.10` | 40 |
| `space.12` | 48 |

### 6.2 Screen structure

Phone screens should use:

- 20-24 px horizontal padding
- top safe-area spacing
- a compact header row for back/close and progress
- main content centered vertically only on splash, empty, or transient states
- primary action pinned near the bottom when the screen has a clear next step

Dark-first screens should use layered depth:

- base: `void.900` or `void.950`
- surface: `void.850` / `void.800`
- border: 1 px low-opacity cyan or slate
- active glow: cyan only around recording, progress, or selected state
- text: never pure white unless it is a small active label

### 6.3 Shape

| Element | Radius |
|---------|--------|
| Buttons | 12 |
| Input fields | 10 |
| Small chips | 999 |
| Repeated cards | 8 |
| Modals | 16 |
| Waveform/meter tracks | 999 |

Cards should be used for repeated items, summary modules, and modals. Avoid nesting cards inside cards.

For the cyberpunk-adjacent style, cards should be crisp and restrained:

- dark fill
- faint border
- optional inner highlight at the top edge
- no heavy glass blur unless the underlying screen actually benefits from depth
- no decorative corner brackets unless they serve a clear recording/progress state

---

## 7. Core Components

### 7.1 Buttons

**Primary:** filled `signal.500`, near-black or white text depending on contrast, 48-56 px high. Use for Start, Record, Try again, Continue, Done.

**Secondary:** dark surface with cyan border or soft `signal.900`, `signal.400` text. Use for Play example, View in Journal, optional actions.

**Destructive:** use `coral.400` only for Delete recordings, Leave session, or other destructive actions.

Primary buttons may have a subtle cyan shadow/glow, but only one primary action should glow on a screen.

Button copy should be verbs:

- Start session
- Record
- Stop
- Try again
- Next exercise
- Save to Journal
- Done

### 7.2 Recording control

Recording is the emotional center of the app. It should feel obvious and steady.

States:

- Idle: large record control, "Tap to record"
- Recording: timer, live waveform/meter, clear Stop button
- Processing: short listening state, no blank screen
- Error/noisy: explain and offer retry

Avoid tiny record buttons. Recording should be reachable with one thumb.

Dark/cyberpunk treatment:

- Idle record button: cyan ring, dark center, minimal glow.
- Recording state: waveform becomes the brightest object on screen.
- Stop state: use coral sparingly; make it clear without making the screen feel dangerous.
- Live meter: cyan base with rare magenta peaks for loud moments.
- Timer: mono style, low visual noise.

### 7.3 Progress

Use progress as reassurance, not pressure.

Patterns:

- Onboarding check: `Step 1 of 3` plus simple dots
- Session: `Exercise 2 of 3` plus a thin progress bar
- Retry result: qualitative comparison, e.g. "A bit better" or "About the same"

Avoid total scores, leaderboards, streak pressure, or "accuracy" as the dominant visual.

Progress bars should look like signal rails: thin, precise, and softly lit. Avoid chunky game-like progress bars.

### 7.4 Feedback block

Recommended structure:

```
What we heard
- Volume dipped near the end.
- Pitch sagged slightly.

Likely
Air thinned out before the note finished.

Try this
Same note, smaller sound. Keep the air moving slowly.
```

The "Try this" cue should be the most visually prominent text after the heading.

In the dark visual system, the feedback block should use a calm surface with one accent stripe or small signal marker. Do not put the user's mistake inside a warning-colored panel unless there is pain, strain, or a destructive action.

### 7.5 Journal rows

Journal entries should make progress easy to revisit:

- date
- focus label
- short result
- number of saved clips
- optional comparison to previous session

Example: `Mon, May 11 - Steadier endings - 3 clips`

Journal should be slightly quieter than Today. Use violet for history and playback accents so it feels reflective, not active-recording urgent.

---

## 8. Motion and Sound

### 8.1 Motion principles

Use motion to show continuity between takes:

- record control gently expands into waveform
- progress bar advances between exercises
- feedback appears in a short upward fade
- retry comparison can subtly highlight the changed metric

Motion should be quick, soft, and interruptible. Avoid bouncy celebration after ordinary practice moments.

For the Midnight Signal Studio direction, motion can feel like signal activation:

- waveform lines brighten from center outward when recording starts
- primary button glow rises slightly on press
- progress rail fills with a soft cyan sweep
- retry comparison can briefly pulse the changed metric

Avoid glitch effects as a default. A tiny glitch-like shimmer may be acceptable in a logo animation or loading moment, but it should never affect readability.

### 8.2 Haptics

Use light haptics for:

- recording started
- recording stopped
- session complete
- clip saved

Avoid haptics on every small navigation tap.

### 8.3 Audio cues

Audio cues should be functional:

- reference tones
- examples
- playback
- optional gentle start/stop cue

Do not add decorative sounds that could interfere with recording.

---

## 9. Iconography and Imagery

### 9.1 Icon style

Use simple line icons with rounded caps where possible. Icons should support scanning, not decorate every label. In dark mode, icons should use muted slate by default and switch to cyan/violet only when active.

Recommended icon meanings:

- Today: small waveform or target
- Journal: notebook or archive
- Settings: gear
- Play example: play triangle
- Record: circle
- Stop: square
- Save: bookmark or check
- Safety: alert circle

### 9.2 Logo direction

The logo should combine the ideas of voice and iteration. Strong directions:

- a waveform resolving into a check mark
- a circular retry arrow around a small waveform
- a tuning fork or note abstracted into a clean signal mark
- a compact signal mark that can glow in cyan on dark backgrounds

Avoid microphones as the only mark. The product is about feedback and retry, not just recording.

### 9.3 Imagery

The app does not need lifestyle photography in the MVP. If imagery is used for marketing later, it should show private practice spaces, ordinary users, and calm focus rather than stage performance.

In-product visuals should be generated from the user's practice state where possible: waveform, pitch trace, progress rail, take comparison, and saved clips. This supports the cyberpunk-adjacent mood without adding fake decoration.

---

## 10. Accessibility

- Minimum body text size: 16 px.
- Minimum tap target: 44 x 44 px.
- Do not communicate recording or feedback state by color alone.
- Provide captions or text labels for all audio examples and feedback.
- Keep contrast at WCAG AA or better.
- Respect reduced motion settings.
- Make safety and privacy copy available in Settings.
- Keep glow behind text low enough that letters stay crisp.
- Provide a reduced-glow mode if the final visual system becomes visually intense.

---

## 11. Implementation Notes

### 11.1 Suggested theme shape

When replacing the starter theme, define semantic tokens rather than hardcoding palette names into components.

```ts
export const Theme = {
  dark: {
    background: '#0B1018',
    backgroundDeep: '#070A10',
    surface: '#151E2B',
    surfaceRaised: '#101722',
    surfacePressed: '#203044',
    text: '#F1F7FA',
    textMuted: '#B8C7D3',
    textSubtle: '#788897',
    border: '#203044',
    primary: '#17C9D2',
    primaryBright: '#32E6E2',
    primaryPressed: '#0C7F8B',
    primarySoft: '#073F49',
    journal: '#9B7CFF',
    energy: '#F05ACB',
    caution: '#FF7A70',
    warning: '#F4B85E',
    success: '#64D99A',
    glowPrimary: 'rgba(50, 230, 226, 0.18)',
    glowEnergy: 'rgba(240, 90, 203, 0.12)',
  },
  light: {
    background: '#F7FAFC',
    backgroundDeep: '#EEF4F8',
    surface: '#FFFFFF',
    surfaceRaised: '#EEF4F8',
    surfacePressed: '#DCE7EE',
    text: '#101722',
    textMuted: '#394858',
    textSubtle: '#667788',
    border: '#DCE7EE',
    primary: '#108C98',
    primaryBright: '#17C9D2',
    primaryPressed: '#0C7F8B',
    primarySoft: '#D8F4F6',
    journal: '#6F58D9',
    energy: '#C0449F',
    caution: '#C94F48',
    warning: '#B87920',
    success: '#3E8D5D',
    glowPrimary: 'rgba(23, 201, 210, 0.14)',
    glowEnergy: 'rgba(192, 68, 159, 0.10)',
  },
};
```

### 11.2 Suggested gradient tokens

Use gradients only for surfaces tied to audio or focus.

```ts
export const Gradients = {
  appBackground: ['#070A10', '#0B1018', '#101722'],
  recordingHalo: ['rgba(50, 230, 226, 0.22)', 'rgba(155, 124, 255, 0.10)', 'rgba(7, 10, 16, 0)'],
  waveformActive: ['#32E6E2', '#17C9D2', '#9B7CFF'],
  focusEnergy: ['rgba(23, 201, 210, 0.18)', 'rgba(240, 90, 203, 0.10)'],
};
```

### 11.3 Visual prototype requirement

Because this direction depends heavily on feel, build a quick visual proof before implementing every screen:

- `ONB-01` splash
- `MAIN-01` Today
- `MAIN-04` Recording
- `MAIN-05` Feedback

The prototype should be judged on four questions:

- Does it feel musical rather than gamer?
- Does it feel premium rather than noisy?
- Does feedback still feel emotionally safe?
- Does the primary action remain obvious?

### 11.4 Current app gap

The current mobile app still contains Expo starter screens and placeholder theme values. Before visual implementation, replace:

- starter teal with the dark-first VoiceFix semantic tokens
- React logo imagery with VoiceFix logo/mark
- tutorial copy with Today, Journal, Settings flows from `APP_SCREENS.md`
- generic cards with focused practice components
- bright template backgrounds with the Midnight Signal Studio direction

---

## 12. Changelog

| Date | Change |
|------|--------|
| 2026-05-12 | Updated visual direction to dark-first "Midnight Signal Studio": premium dark mode between music app and restrained cyberpunk. |
| 2026-05-12 | Initial brand and design system guide for VoiceFix. |
