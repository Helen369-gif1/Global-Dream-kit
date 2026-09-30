# GLOBAL DREAM — Gia Landing Page Build Spec

**For: Claude Code (VS Code extension) · Project: Glonari / Digital Banker / Global Dream · Version 1.1 · 2026-09-28**

---

## RULE 0 — LANGUAGE (READ FIRST)

- This document and every project file are English only. Never emit Cyrillic characters into any file: not in markup, copy, CSS, comments, commit messages, filenames, or `alt` / `aria-label` / `title` attributes.
- All user-facing copy is quoted verbatim in Section 5. Copy it character for character, including the typographic apostrophe `’` and the em dash `—`. Do not rewrite, shorten, "improve", or re-punctuate it.
- If a string you need is not in this document, do not invent it. Insert `<!-- TODO: copy needed -->` and list it in your report.
- Items marked **PROPOSED** are not yet approved. Do not build them until a prompt states they are approved. As of Version 1.1 every item in this document is approved; the rule remains for future additions.

---

## 1. WHAT WE ARE BUILDING

A single static landing page that presents **Gia**, the AI guide of Global Dream, a subsection of Digital Banker inside the Glonari platform. Four screens, scrolled top to bottom:

1. Hero — scroll-scrubbed architectural video, short phrases in sequence.
2. What Gia does — the page's single dark accent screen, calm and readable.
3. Everything connects — Gia on a tablet at the centre, five life areas connecting to her.
4. Gia in your life — a pinned horizontal story over a scroll-scrubbed walking video, four content stops with side brochures, then the final CTA.

Plus a global site shell (header, footer) built last and only after its copy is approved.

Tone: clear, premium, calm, modern, minimal. Light theme with one dark accent screen. Elegant motion, never noisy. Gia is presented as the main guide throughout.

This page must not try to explain the entire Global Dream ecosystem. It helps the visitor understand who Gia is, why she matters, how she helps, and where to start.

Relationship to Global Reserve: same engineering approach, same type scale and spacing system, different palette (light Global Dream tokens). Code may be adapted from the Global Reserve repository, but this is a separate project; nothing here imports files from Global Reserve at runtime.

---

## 2. SUPPLIED ASSETS

Everything below is already prepared in the repository.

```
/CLAUDE.md
/GLOBAL-DREAM-BUILD-SPEC.md                This document
/GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md       Visual source of truth (includes Section 16 exceptions)
/media/gd-hero.mp4                         Screen 1 video, 1280x720, 24fps, 8.0s, all-keyframe, no audio, ~5.5MB
/media/gd-hero-poster.jpg                  Screen 1 first frame (reduced motion / fallback)
/media/gd-walk.mp4                         Screen 4 video, 1920x1080 (upscaled, framing unchanged), 24fps, 8.0s, all-keyframe, no audio, ~10.3MB
/media/gd-walk-poster.jpg                  Screen 4 last frame, 1920x1080 (reduced motion / fallback)
/media/gia-tablet.webp                     Screen 3 Gia video-call tablet, transparent background, 1279x1062
/media/gia-tablet.png                      Same, lossless master (not loaded by the page)
/media/logo/gd-lockup-light.webp           Official logo for light backgrounds (header, footer), 915x393, transparent (+ .png master)
/media/logo/gd-emblem-light.webp           Emblem only (globe in ring), 416x416, transparent (+ .png master)
/media/logo/gd-lockup-dark.webp            Glowing logo for dark backgrounds, 1481x722, transparent (+ .png master). Not used on the page by default; reserved for social previews or a later Screen 2 use
/media/logo/favicon-32.png, apple-touch-icon.png   Favicons made from the emblem
/favicon.ico                               16/32/48 favicon
/media/brochures/*.webp                    Eight brochure images (main + inline per brochure), extracted from the brochure PDF
/references/Global_Dream_Gia_Structure_EN.txt       Original content brief
/references/oceanx-horizontal-story-reference.mp4   Screen 4 motion reference (third-party site, reference only)
/references/oceanx-contact-sheet.jpg                1 frame per second of the reference
/references/oceanx-chapter-frame.jpg                One chapter at rest, full resolution
/references/gd-hero-contact-sheet.jpg               Screen 1 video overview
/references/gd-walk-contact-sheet.jpg               Screen 4 video overview
/references/gia-tablet-source.png                   Original tablet image with grey studio background
/references/screen-3-target.png                     Screen 3 approved visual target (icons, glowing lines, orbit)
/references/digital-banker-reference.png            Digital Banker dark visual reference (Screen 2 atmosphere)
/references/oceanx-brochure-panel.png                Screen 4 brochure panel reference (open chapter on the reference site)
/references/gia-brochure-source.pdf                 The Gia brochure — source of all brochure copy and images
```

Video preparation already done (for the record, if a new cut is supplied):

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -g 1 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart media/gd-hero.mp4
```

Do not copy text, logos, or UI from `references/oceanx-*`. It is used only for motion mechanics and composition rhythm.

---

## 3. TARGET FILE STRUCTURE

```
/index.html
/css/tokens.css          Tokens only: design-system Section 3 plus Section 16 dark accent tokens
/css/base.css            Reset, fonts, container, buttons, utilities, reveal classes
/css/screens.css         Screens 1, 2, 3
/css/gia-story.css       Screen 4 stage, story modules, final CTA, brochures
/css/site-shell.css      Header and footer (built last)
/js/hero-scrub.js        Screen 1 scroll-to-video binding and phrase timeline
/js/reveal.js            Shared IntersectionObserver reveal
/js/gia-conversation.js  Screen 2 conversation rail animation
/js/gia-connect.js       Screen 3 life-area connection animation
/js/gia-story.js         Screen 4 scrub, horizontal modules, progress, final CTA
/js/brochure.js          Screen 4 side brochure dialogs
/js/site-shell.js        Header behaviour (built last)
/favicon.ico
/media/                  Assets listed in Section 2 (logo in /media/logo/, brochure images in /media/brochures/)
/references/             Reference material, never loaded by the page
```

- One `<section>` per screen: `id="screen-1"` to `id="screen-4"`.
- `data-screen` slugs: `hero`, `conversation`, `connects`, `life`.
- The final CTA lives inside Screen 4 and has `id="screen-4-final"` for anchor links.
- Load order at the end of `<body>`: GSAP, then `hero-scrub.js`, `reveal.js`, `gia-conversation.js`, `gia-connect.js`, `gia-story.js`, `brochure.js`, `site-shell.js`. Each file initialises itself on `DOMContentLoaded` by finding its section.
- Fonts: one Google Fonts request: Playfair Display 500 and 700; IBM Plex Sans 400, 500, 600, 700; IBM Plex Mono 400, 500, 600; `display=swap`; preconnect to both Google hosts.
- `<title>`: `Gia — Global Dream`
- Favicons: see Section 5.5 (added in A1).

---

## 4. SHARED RULES

### 4.1 Tokens

Use the design system's `--gd-*` tokens (Section 3 of the design system) and the dark accent tokens in design-system Section 16, which are used only by Screen 2 and by the Screen 1 veil and text shadow (Section 5.1). No raw colour values in screen CSS except inside `tokens.css`.

### 4.2 Buttons

All CTAs on this page are `<a class="gd-button …" href="#">` (destinations TODO) except the Screen 4 brochure triggers, which are `<button type="button">`.

- `.gd-button--primary` on light: fill `--gd-gold-deep`, text `#fff`, 1px border `--gd-gold-deep`.
- `.gd-button--primary` on dark (Screen 2): fill `--gd-gold`, text `--gd-text-primary`.
- `.gd-button--secondary`: transparent, 1px `--gd-gold-line` border, text `--gd-text-primary`.
- Radius 8px, padding `16px 28px`, IBM Plex Sans 600, 15px, letter-spacing `0.01em`. Hover: 200ms, border or fill deepens slightly; no transform.
- Focus: `outline: 2px solid var(--gd-gold-deep); outline-offset: 3px` (on dark: `--gd-gold`).
- No icons inside buttons, except the small decorative dot on the Screen 4 module buttons (Section 5.4a.1). No pill buttons.

### 4.3 Terminology lock

Use exactly: `Gia` · `Global Dream` · `Digital Banker` · `Glonari` · `GIA™` (only in brochure role labels: `GIA™ COMPANION`, `GIA™ GUARDIAN`, `GIA™ COACH`, `GIA™ CONNECTOR`, `GIA™ BUSINESS`). Gia is referred to as "she". Never call Gia "the bot", "assistant", or "chatbot" in copy, `alt`, or `aria-label` text.

### 4.4 Pinned sections

Only two pinned (sticky-stage) sections exist on this page: Screen 1 and Screen 4. Everything else flows normally. Neither pin is applied under `prefers-reduced-motion: reduce`.

### 4.5 Reveal (Screens 2 and 3 text)

Shared `js/reveal.js`: elements with `[data-reveal]` animate once from `opacity: 0; translateY(24px)` to rest, 600ms, `cubic-bezier(.22,.61,.36,1)`, when 25% visible. `[data-reveal-delay="n"]` adds `n × 120ms`. Reduced motion: shown at rest immediately. If JS fails, content must be visible (apply the hidden starting state only after JS adds `.js` to `<html>`).

---

## 5. SCREEN-BY-SCREEN SPEC

Copy below is final. Reproduce it verbatim.

### 5.1 Screen 1 — Hero / scroll video

**Purpose.** Introduce Gia immediately. Emotional, premium first impression. Extremely short copy.

**Mechanics** (same technique as Global Reserve Screen 1, adapted into `js/hero-scrub.js`):

- Section `#screen-1`, class `gd-hero`. Runway wrapper height `400vh`. Inner stage `position: sticky; top: 0; height: 100vh; height: 100svh`, one grid cell holding the video layer, the veil, and the text layer.
- Video `media/gd-hero.mp4` fetched as a blob (`URL.createObjectURL`), `muted playsinline`, `object-fit: cover`, explicitly `width: 100%; height: 100%`. Poster `media/gd-hero-poster.jpg`.
- `targetTime = progress × duration`. Exponential smoothing: `smoothed += (target − smoothed) × (1 − 0.001^dt)`. Seek only when `!video.seeking` and the difference exceeds `1/24` s.
- Text is split into one `<span class="word">` per word and driven by one paused GSAP timeline via `.time(smoothed)`. Word tween: 0.7s, stagger 0.03s, in `y: 36 → 0` `power3.out`, out `y: 0 → −26` `power2.in`.
- Block 1 starts appearing on page load without scroll (elapsed-since-load nudge capped at the fade duration, as in Global Reserve).

**Legibility: dark veil, light text** (approved by the designer 2026-09-29; replaces the earlier ivory veil). A static dark veil built from `--gd-night` sits above the video and below the text: `linear-gradient(to bottom, rgba(21,24,28,.62) 0%, rgba(21,24,28,.56) 40%, rgba(21,24,28,.24) 55%, rgba(21,24,28,.16) 70%, rgba(21,24,28,.12) 100%)`. It does not animate. The veil must stay positioned above the media layer in the stacking order. Tuning limits: top alpha between `.45` and `.62`, bottom alpha at least `.10`, and the lower half of the frame stays visibly light. All Screen 1 text (`GIA`, the tagline, `Start with Gia.`, `Talk. Explore. Plan.`) is `--gd-surface` (`#FFFDF8`) with `text-shadow: 0 2px 24px rgba(21,24,28,.35)`, on Screen 1 text only. The `Meet Gia` button stays `.gd-button--primary`.

Contrast targets, measured on glyph pixels of the light text over the rendered frame with the veil (text shadow excluded), at 1920, 1440, 1024, 768 and 375, on frames where each block is fully visible: `GIA` and blocks 2 and 3 at least 3:1, the tagline at least 4.5:1, each on at least 99% of glyph pixels. If the tagline fails, raise the veil within the limits above; if that is still not enough, move the text group higher at 1100px and below. The values above passed at every width (worst case: tagline at 1920, 99.8% of glyph pixels at 4.5:1 or more), so the text position is unchanged.

**Copy and timing** (video time in seconds, 8.0s total):

| Block | Element | Copy | Style | In | Out |
|---|---|---|---|---:|---:|
| 1 | H1 | `GIA` | Playfair Display 500, `clamp(72px, 9vw, 168px)`, line-height 1, letter-spacing `0.06em`, `--gd-surface` | 0.0 | 2.03 |
| 1 | Tagline `<p>` | `Your AI for the life you want to build.` | Playfair Display 500, `clamp(22px, 2.2vw, 40px)`, line-height 1.3, `--gd-surface`, 16px below H1 | 0.0 | 2.03 |
| 2 | `<p>` | `Start with Gia.` | Playfair Display 500, `clamp(34px, 3.8vw, 72px)`, line-height 1.15, `--gd-surface` | 3.0 | 4.54 |
| 3 | `<p>` | `Talk. Explore. Plan.` | same as block 2 | 5.3 | — (holds) |

In is the time a block's entrance starts. Out is the time its exit starts. Each exit must finish by the next block's In time: with the word tween (0.7s, stagger 0.03s), block 1's 10 words exit over 0.97s (2.03 → 3.00) and block 2's 3 words over 0.76s (4.54 → 5.30).
| 3 | Button | `Meet Gia` | `.gd-button--primary`, 32px below block 3 text | 5.5 | — (holds) |

- Block 1 fully exits before block 2 enters; block 2 fully exits before block 3 enters. No overlap.
- Block 3 and its button stay visible through the end of the runway. The button is animated as one unit (opacity + `y`), not per word.
- The button has `pointer-events: none` and `tabindex="-1"` while its opacity is below 0.5, and becomes interactive above it. Toggle via a class, not per frame style writes.
- Screen reader text: the H1 contains `GIA`; add `aria-label` on nothing else. All three blocks remain in the DOM at all times.

**Position.** All blocks share one centred column: `left: 50%; transform: translateX(-50%); width: min(80%, 1100px); text-align: center`. Top of the text group at `16%` of the stage height, which keeps the text in the upper band where the dark veil is strongest. The contrast targets above pass at this position at every tested width, so no higher position is needed at 1100px and below. Below 600px wide: `width: 88%`, top `18%`. Visually verify at 1920, 1440, 1024, 768, 375.

**Reduced motion.** No runway, no pin. Stage becomes `min-height: 100svh`, shows `gd-hero-poster.jpg` as a static cover image with the same dark veil and light text, blocks 1 and 3 plus the button visible and stacked with a 16px gap between blocks (block 2 hidden, since block 3 repeats its intent), no word animation. The tight stack keeps `Talk. Explore. Plan.` in the upper band where the veil is darkest; it meets 3:1 on at least 99% of glyph pixels at 1920, 1440, 1024, 768 and 375 (measured 100% at every width).

**Missing video.** Show the poster as a static background; text timeline still runs on scroll.

---

### 5.2 Screen 2 — What Gia does (dark accent screen)

**Purpose.** Explain Gia calmly after the emotional hero. Gia is not just a chatbot; she is a guide for decisions and next steps. Slower pacing than Screen 1.

**Why dark here.** This is the page's single dark accent, approved by the designer. It marks the change of register from the warm cinematic hero to explanation, and it links the page visually to the dark Digital Banker world (`references/digital-banker-reference.png`). Screens 3 and 4 return to light. Use only the dark tokens from design-system Section 16.

**Layout.** `gd-section` padding, background `--gd-night`. Container 1200px. Editorial split `minmax(0, 1fr) minmax(0, 1fr)`, gap `--gd-grid-gap`, `align-items: center`.

- Left column: H2, body, closing lines, button.
- Right column: the conversation rail (the four action phrases).

| Element | Copy | Style |
|---|---|---|
| H2 | `One conversation can change what you see next.` | H2 standard, `--gd-night-text` |
| Body | `Gia helps you make sense of where you are, what you want, and what your next step could be.` | Lead, `--gd-night-text-2`, max-width 520px, 24px below H2 |
| Closing line 1 | `You don’t need to know where to start.` | Body, `--gd-night-text`, 48px below body |
| Closing line 2 | `You can start with Gia.` | Body, weight 600, `--gd-gold`, directly under line 1 |
| Button | `Talk to Gia` | `.gd-button--primary` dark variant, 32px below closing lines |
| Rail item 1 | `Ask a question.` | H3, `--gd-night-text` |
| Rail item 2 | `Explore an idea.` | H3 |
| Rail item 3 | `Compare possibilities.` | H3 |
| Rail item 4 | `Build a plan.` | H3 |

Markup: the rail is an `<ol class="gd-rail">` with four `<li>`. Each `<li>` holds a decorative node (`<span class="gd-rail__node" aria-hidden="true">`) and the phrase. Node contains a mono index `01`–`04` (IBM Plex Mono 500, 11px) — the index is decorative and `aria-hidden`.

**Rail geometry.** Vertical 1px line in `--gd-night-line` at the node centre. Nodes 32px circles, 1px `--gd-night-line` border, `--gd-night-surface` fill, index in `--gd-night-text-3`. Row gap 40px desktop / 28px mobile. Phrase starts 32px right of the node (20px mobile). An active node: `--gd-gold` fill, index `--gd-night`. The line has an overlay segment in `--gd-gold` whose `scaleY` grows from the top.

**Animation** (`js/gia-conversation.js`, `initGiaConversation(section)`):

1. Left column text reveals with the shared reveal (Section 4.5), delays 0/1/2/3.
2. When the rail is 35% visible, once: the gold line segment grows from node 1 to node 4 over 2.4s, `power1.inOut`. Each node activates as the line reaches it (fill transitions over 300ms) and its phrase fades in (`opacity 0 → 1`, `x: -12 → 0`, 600ms, design-system ease). Phrases start at `opacity: 0.0`, not hidden.
3. After completion, ambient loop: a small gold glow dot (6px, `box-shadow` none, just a filled dot with 40% opacity trail made by a second dot) travels down the rail from node 1 to node 4 over 2.8s, then waits 5s, then repeats. It never changes layout. Paused while the section is out of view (`IntersectionObserver`).

Reduced motion: rail complete (gold line full, all nodes active, all phrases visible), no ambient dot.

**Responsive.** At 768px and below: one column, left column first, rail after it with 48px gap. At 1100px–769px keep two columns only while each column is at least 360px; otherwise stack.

---

### 5.3 Screen 3 — Everything connects

**Purpose.** Show that Gia connects different parts of a person's life. Conceptual clarity, not product detail. Prepares the visitor for Screen 4.

**Asset.** `media/gia-tablet.webp`, 1279×1062, transparent background: Gia on a video call on a tablet. It is the centrepiece and Gia's only close-up on the page.

- `alt="Gia on a video call, speaking and gesturing as she explains"`, `width="1279" height="1062"`, `loading="lazy"`, `decoding="async"`.
- The screen area of the tablet inside the image is approximately `left 4.5%, top 5.2%, width 91.3%, height 89.5%`. Overlays placed "on the screen" use these percentages on a wrapper that matches the image box exactly.
- The image contains baked call controls, including a red end-call button. This is an approved asset exception (design-system Section 16.3). Never add other red to the page, and never place overlays over the bottom 16% of the screen area where the controls sit.
- Depth: `filter: drop-shadow(var(--gd-shadow-tablet))` on the image (`0 24px 48px rgba(57, 43, 24, 0.14)`). This is the screen's only drop shadow; the soft gold glows of the connection visuals (design-system Section 16.9) are the only other depth effects.

**Visual target.** `references/screen-3-target.png` (approved mockup, reworked in A4).

**Layout.** `gd-section gd-section--soft` (background `--gd-bg-soft`, the light alternate, which separates it from the ivory Screen 4 poster edge and the dark Screen 2).

1. Centred header, max-width 720px: H2.
2. The connection stage, 64–96px below the header, full container width: a 3-column grid `minmax(0, 1fr) minmax(0, clamp(320px, 42vw, 560px)) minmax(0, 1fr)`, column gap 48px, rows `1fr auto 1fr auto 3fr auto`. Centre column: the tablet, spanning rows 1–5. Areas 1 and 2 sit in rows 2 and 4 of the left column at its outer (left) edge; areas 3 and 4 mirror them at the outer (right) edge of the right column. The flexible rows put the icons of areas 1–4 near 17% and 53% of the tablet height, above the tablet attachment points, so every line is a visible S-curve. Area 5 sits in row 6, centred under the tablet, 32px below it.
3. Text block, centred as a block (max-width 560px), left-aligned text, 64px below the stage: body paragraph 1, body paragraph 2, key line, button.

| Element | Copy | Style |
|---|---|---|
| H2 | `Your life isn’t made of separate decisions.` | H2 large centred |
| Area 1 (left, upper) | `A home.` | H3, `--gd-text-primary` |
| Area 2 (left, lower) | `Money.` | H3 |
| Area 3 (right, upper) | `A move.` | H3 |
| Area 4 (right, lower) | `Business.` | H3 |
| Area 5 (below) | `What comes next.` | H3 |
| Body 1 | `Gia helps you see how those decisions connect — and what opportunities may be relevant to you.` | Body, `--gd-text-secondary` |
| Body 2 | `She brings your goals, progress and next steps into one clear picture.` | Body, 16px below body 1 |
| Key line | `One place to understand what’s possible.` | Large data phrase, `--gd-gold-deep`, 32px below body 2 |
| Button | `Explore with Gia` | `.gd-button--primary`, 32px below key line |

The five areas are an `<ul class="gd-areas">` for semantics even though CSS places them around the tablet: the list spans the whole stage and uses `grid-template-columns: subgrid; grid-template-rows: subgrid`, and each item is placed by `grid-area` name (never positioned absolutely).

**Areas 1–4.** Each item is a centred column: an icon circle above its H3 label, 16px gap. The icon circle (`.gd-areas__icon`, `aria-hidden`) is 64px, 1px `--gd-gold` border, a `radial-gradient(closest-side, var(--gd-surface), var(--gd-gold-soft))` fill and a soft gold glow, holding a 28px inline-SVG glyph filled `--gd-gold-deep`: a house (`A home.`), a stack of coins (`Money.`), a map pin (`A move.`), a briefcase (`Business.`). Each icon circle carries its area node: a 12px ringed dot (2px `--gd-gold` border, `--gd-surface` fill, soft gold glow), centred 14px outside the circle on the side facing the tablet, level with the icon centre.

**Area 5.** No icon. A larger 20px node in flow above the label: a 7px `--gd-gold` centre on `--gd-surface`, 2px `--gd-gold` ring, a 6px `--gd-gold-soft` halo ring and a soft gold glow.

**Orbit decoration.** A static dotted ellipse (`aria-hidden`) centred on the tablet, 136% × 118% of the tablet box, 1px dotted `--gd-gold-line`, with a 6px glowing `--gd-gold` dot at its top and seven small `--gd-gold` specks (3–4px, 30–45% opacity) placed along and around it. It sits outside the floating tablet group, so it never floats, and paints below the tablet and the lines. Hidden at 1100px and below.

**Connector lines.** One absolutely positioned decorative SVG (`aria-hidden="true"`, `pointer-events: none`) covers the stage, above the tablet and below the areas. `js/gia-connect.js` measures, from layout offsets (never transformed rects), each area node's centre and five attachment points on the tablet's outer frame edge (the frame fills the image box): left edge at 36% and 64% of the tablet height for areas 1 and 2, right edge at 36% and 64% for areas 3 and 4, bottom centre for area 5. It draws one cubic S-curve per area from the area node to its attachment point, with horizontal tangents at both ends (vertical for area 5), `--gd-gold`, 2px, round caps, with a soft gold glow (one `drop-shadow` on the SVG, which also glows the tablet nodes and the particle). Each line has a node at both ends: the area node at the area end (HTML, painted above the line) and a tablet node at the attachment point (SVG, 12px ringed dot matching the area node, centred on the frame edge, painted above every line), plus an invisible pulse ring behind the tablet node. Recompute on load, after the image and fonts load, and on resize (debounced, 150ms). Never recompute during an animation frame.

**Animation** (`initGiaConnect(section)`), triggered once when the stage is 30% visible:

| Time | Event |
|---:|---|
| 0.0s | Tablet: `opacity 0 → 1`, `y: 24 → 0`, 800ms, design-system ease |
| 0.3s | Soft halo behind the tablet fades in: an ellipse `radial-gradient(closest-side, var(--gd-gold-soft), transparent)` sized 120% × 110% of the tablet, `aria-hidden` |
| 0.6s | "Live" marker on the tablet screen, top-left inside the screen area (24px inset): a 12px mono label `GIA` next to an 8px `--gd-gold` dot, on a `rgba(30,35,40,.55)` rounded-4px chip, 26px tall. Fades in 300ms. |
| 0.9s–3.8s | Per area, in order 1, 2, 3, 4, 5, each starting 240ms after the previous (area `n` starts at `t = 0.9 + 0.24 × (n − 1)` s): at `t` the area appears, `opacity 0 → 1`, `x: ±16 → 0` toward the tablet (area 5: `y: 16 → 0`), 600ms, design-system ease; at `t + 0.45` its area node scales `0 → 1`, 250ms, `back.out(2)`; at `t + 0.6` its line draws from the area toward the tablet with `stroke-dashoffset`, 700ms, `power1.inOut`; at `t + 1.3`, when the line arrives, the tablet node pops in (`scale 0 → 1`, 300ms, `back.out(2.5)`) with one pulse ring (`scale 1 → 2.4`, `opacity 0.6 → 0`, 600ms) |
| 2.4s | Text block reveals (shared reveal, delays 0–3), while the last areas are still connecting |

Ambient (after the sequence, while visible, paused off-screen):

- The live dot pulses: `opacity 1 → 0.35 → 1`, 2.4s, infinite.
- The halo breathes: `scale 1 → 1.04 → 1`, 7s, infinite, `ease-in-out`.
- Every 4s one connector carries a 6px `--gd-gold` particle from its area to the tablet (1.4s, `ease-in-out`), cycling through areas 1→5, fading in and out at the ends of the path. Implemented with `getPointAtLength` on the existing path; transform and opacity only. (6px rather than 4px: a 4px particle barely shows on the 2px line.)
- Tablet floats `y: 0 → −4px → 0`, 8s, infinite. On every float update the tablet end of each line and its tablet node are redrawn from the cached geometry plus the float offset, so both ends stay attached. Lines never detach visibly.

Reduced motion: everything at rest and visible, lines fully drawn, all nodes visible, no pulse, no halo breathing, no particle, no float, live dot static.

**Responsive.**

- 1100px and below (stacked layout): the stage becomes two rows. Row 1: tablet centred, `width: min(100%, 520px)`. Row 2: the five areas as a 2-column list (column gap 48px, row gap 24px; area 5 spans both), under a 1px `--gd-line` rule with 24px above the first row. Each area is a row with its icon circle, reduced to 48px (22px glyph), left of the label; area 5 has its 20px node, centred in a 48px slot so its label lines up with the others. The SVG lines, tablet nodes, area nodes on the icon circles, particle and orbit are hidden. Areas animate in with `y: 16 → 0`.
- 480px and below: areas in one column.
- The text block remains centred as a block, max-width 560px.

---

### 5.4 Screen 4 — Gia in your life / horizontal scroll story

**Purpose.** Concrete examples of how Gia helps in real life, as one continuous walk. Four content stops, each opening a side brochure. Final CTA at the end of the same screen.

**Reference effect.** `references/oceanx-horizontal-story-reference.mp4` (study it frame by frame before building). What to reproduce:

1. A full-bleed background video pinned for the whole runway and scrubbed by vertical scroll — the subject stays roughly central and keeps moving while the visitor scrolls.
2. Content "chapters" on one continuous horizontal track (as on 2025.oceanx.org): the track glides right to left linearly with scroll, with no holds, so each chapter enters from beyond the right edge and exits beyond the left edge while the next one follows. Chapters may cross the subject while moving.
3. Chapters sit at different heights and zones in the frame.
4. Each chapter: small mono chapter label, eyebrow in accent colour, large headline, one short line, one button.
5. Quiet persistent chrome: a thin progress line along the top of the stage and a small chapter counter in a corner.

What not to reproduce: the dark ocean palette, white-on-dark text, pill buttons with coloured dots, audio toggle, share button, or any OceanX copy or branding.

**Footage.** `media/gd-walk.mp4`, 8.0s: Gia walks toward the camera across a marble plaza in front of classical architecture under a clear blue sky, framed roughly in the centre (her figure occupies approximately 45–68% of the frame width and 30–83% of its height). The background barely moves. There is no camera pull-back in the footage; the final "wider shot" is simulated with scale (see below).

**Safe zones** (percent of the stage width, after `object-fit: cover`): Gia’s band is `40%–70%`. Chapter cards cross it while moving on the track; the final CTA card, the only card that comes to rest, stays clear of it. Left content zone: container left edge to `38%`. Right content zone: `72%` to container right edge. Verify at 1920×1080, 1440×900, 1024×768 and on 16:10 and 4:3 ratios; if cover-cropping pushes Gia outside the safe band, adjust `object-position` (default `55% 50%`), not the zones.

**Section structure.**

- `#screen-4`, class `gd-story`, `data-screen="life"`. Runway wrapper height `650vh`.
- Sticky stage: `position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden` (overflow on the stage itself only).
- Layers inside the stage, bottom to top: video (`.gd-story__video`, blob-loaded, `muted playsinline`, poster `gd-walk-poster.jpg`, cover), module layer (modules and the final CTA card), chrome layer. There is no veil on Screen 4.
- The stage's inner content is offset by the fixed header height (72px desktop / 64px mobile) so nothing important sits under the header.

**Scroll model** (`js/gia-story.js`, `initGiaStory(section)`). One normalised progress `p` from 0 (stage pinned) to 1 (pin releases). Reuse the Screen 1 smoothing formula for `p` so the video and modules move together without jitter.

- Video: `currentTime = smoothedP × duration` over the whole runway, seek only when `!video.seeking`. Gia never stops walking.
- Video scale (simulated pull-back): `scale 1.04` from `p = 0` to `0.80` (a deliberately subtle design choice), then eases to `1.00` by `p = 0.98` (`power1.inOut`), `transform-origin: 55% 60%`. Transform only; it never affects layout.
- Track (approved 2026-09-30, replaces the earlier enter/hold/exit table): the four chapter cards sit on one horizontal track and move right to left linearly with `smoothedP`, with no holds, no easing and no opacity change. Each card's screen-space left edge is `x = W + i × S − v × p` (`W` stage width, `i` = 0–3, `v` the track speed); the card moves by `translateX(x − rest)` from its zone rest position, so it keeps its zone width and vertical anchor. Spacing `S = max(0.75 × W, widest card + 0.12 × W)` (the minimum keeps the full-width mobile cards from overlapping). At `p = 0` card 4.1 is just beyond the right edge; `v` is set so card 4.4's right edge leaves the screen at `p = 0.86`. Everything is a pure function of `p`, fully reversible.
- Final CTA: the next card on the same track at the same speed, `x = rest + v × max(0, 0.94 − p)`. It settles in the left zone at `p = 0.94` and holds to `p = 1` with no exit. At the same speed it enters from the right while card 4.4 is still crossing (about `p = 0.70`, roughly 0.58 × `W` behind it).
- Spacing and the two anchor values (`0.86`, `0.94`) may be tuned in the browser for feel; if tuned, update this section in the same task.

**Zone geometry** (approved 2026-09-30, resolves the conflict between the right zone and the card width). The zones are measured from the stage edge inset by the page padding (`--gd-page-pad`), not from the 1200px container. A card is `min(440px, 34%)` of the stage width and never wider than its zone: left cards `min(440px, 34%, 38% − pad)` starting at the inset left edge; right cards `min(440px, 34%, 28% − pad)` ending at the inset right edge. Below a 1400px stage width the right zone is narrower than 340px, so every module uses the left zone.

**Module positions.** Alternate zones: 4.1 left, 4.2 right, 4.3 left, 4.4 right (all left below 1400px, see above). Vertical anchor: module top at `46%` of the stage height (below the rooflines, over the plaza and building base). If a card would then run into the 96px reserved above the stage bottom for the chapter counter, it moves up just enough to clear it.

**Module component** (`<article class="gd-module">`):

- Surface: `rgba(255, 253, 248, 0.92)` (the `--gd-surface` colour at 92%), 1px `--gd-line`, radius 8px, padding 32px, width `min(440px, 34vw)` capped by its zone (see Zone geometry). No blur, no shadow. The solid surface guarantees contrast over the bright plaza.
- Chapter label: IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-text-secondary` (`--gd-text-tertiary` measured 3.8:1 on the card over the video), preceded by a 6px `--gd-gold` square. Format `CHAPTER 01` to `CHAPTER 04`.
- Eyebrow: eyebrow style, `--gd-gold-deep`, 12px below the label.
- H3: `clamp(24px, 2.4vw, 34px)`, 600, line-height 1.15, 12px below eyebrow.
- Text: small body, `--gd-text-secondary`, 12px below the H3.
- Button: `<button type="button" class="gd-button gd-button--secondary gd-module__cta" aria-haspopup="dialog" aria-controls="brochure-…">`, 24px below text. It opens the module's side brochure (Section 5.4a).

| Module | Eyebrow | H3 | Text | Button | Opens |
|---|---|---|---|---|---|
| 4.1 | `FIND A HOME` | `Find a home that fits the life you want.` | `Gia helps you explore housing options, compare possibilities, and understand what may fit your plans.` | `Explore Homes` | `#brochure-homes` |
| 4.2 | `UNDERSTAND YOUR FINANCES` | `See what’s possible before you decide what’s next.` | `Gia helps bring your financial picture, goals, and available options together so you can plan with more clarity.` | `Explore Your Options` | `#brochure-finances` |
| 4.3 | `PLAN A MOVE` | `Turn a move into a plan.` | `Gia can help organize the steps around moving, property decisions, and what comes next.` | `Explore Moving` | `#brochure-moving` |
| 4.4 | `BUILD WHAT COMES NEXT` | `Your next opportunity may start with one conversation.` | `Explore business, travel, education, and other possibilities as they become part of your journey.` | `Explore Possibilities` | `#brochure-possibilities` |

Headings on the page stay in order: H2 for the section (visually hidden, text `Gia in your life`), H3 per module, H2 for the final CTA. The visually hidden H2 uses the standard `.visually-hidden` utility.

Interactivity (approved 2026-09-30): a module's button is focusable and clickable only while the button itself is fully inside the stage (the viewport), at every width; otherwise `inert` is set on the module (toggle on threshold crossings, not every frame). Keyboard users tabbing into a module that is off-screen must never happen.

**Final CTA** (`<div id="screen-4-final" class="gd-story__final">`), left content zone, vertically centred in the stage, on a solid card identical to the module card (same surface, border, radius and padding), width `min(520px, zone width)`; on mobile full container width, docked like the modules. The static (reduced-motion) composition keeps it without a card, centred on `--gd-bg`:

| Element | Copy | Style |
|---|---|---|
| H2 | `Start with Gia.` | H2 large centred scale, left-aligned here, `--gd-text-primary` |
| Line 1 | `You don’t have to plan everything today.` | Lead, `--gd-text-secondary`, 24px below H2 |
| Line 2 | `Start with one question.` | Lead, `--gd-text-secondary` |
| Button | `Meet Gia` | `.gd-button--primary`, 48px below lines |
| Supporting line | `Talk. Explore. Plan what’s next.` | IBM Plex Mono 500, 12px, `0.06em`, sentence case (not uppercase), `--gd-text-secondary`, 16px below button |

No legibility veil: the card carries the contrast (approved 2026-09-30, replacing the earlier ivory veil, which failed AA over the video).

The final CTA follows the same `inert` rule as the modules (clickable while its `Meet Gia` button is fully inside the stage, which always includes `p ≥ 0.94`).

**Chrome.**

- Progress line: 2px tall, full stage width, top of the stage just below the header, track `--gd-line-soft`, fill `--gd-gold`, `scaleX = p`, `transform-origin: left`. `aria-hidden`.
- Chapter counter: bottom-left at the stage edge inset by the page padding, 32px from the stage bottom, IBM Plex Mono 500, 12px: `01 / 04` … `04 / 04`: the active chapter is the card whose centre is nearest 35% of the stage width; hidden once the final CTA card is nearer that point than any chapter card. `aria-hidden` (the modules themselves carry the meaning).
- Four small ticks under the counter (8px × 2px, gap 6px), the active one `--gd-gold`, others `--gd-line`. `aria-hidden`.

**Side brochures** are specified in full in Section 5.4a below. `js/brochure.js` exports `initBrochures(root)`; `js/gia-story.js` exposes nothing global — the two talk through a `CustomEvent` on the section (`gd:brochure-open` / `gd:brochure-close`) so the story can freeze and resume.

**Reduced motion, and short viewports** (`prefers-reduced-motion: reduce` or `max-height: 560px`): no runway, no pin, no scrub. Screen 4 becomes a normal section: `gd-walk-poster.jpg` as a full-bleed band (`aspect-ratio: 16/9`, max-height 80svh, `object-fit: cover`), then the four modules as a normal 2×2 grid (1 column below 768px) on `--gd-bg`, then the final CTA centred in a CTA composition (design system 7.3). Brochures work the same, without animation. Chrome hidden.

**Mobile (768px and below, normal motion).** Keep the pin and scrub. Modules and the final CTA dock to the bottom of the stage: full container width, `bottom: calc(24px + env(safe-area-inset-bottom))`, card padding 24px, H3 `clamp(22px, 6vw, 26px)`; the horizontal travel is the same. The final CTA card docks to the bottom like the modules. Video `object-position: 55% 40%` so Gia sits above the cards. Counter moves to the top-left under the progress line, on the small dark chip from design-system 16.2 (26px tall, `--gd-text-primary` at 55%, radius 4px, light `--gd-surface` text, count and ticks on one row).

**Missing video.** Poster as a static background, the card track still runs on scroll.

---

### 5.4a Screen 4 — Side brochures (OceanX-style reading panel)

**Reference.** `references/oceanx-brochure-panel.png` (screenshot of an open chapter panel on the reference site). What to reproduce: clicking a chapter's button opens a large panel that slides in from the right and covers almost the whole viewport, leaving a thin strip of the pinned story visible on the left. The panel is split in two: a tall media column on the left that stays in place, and a light reading column on the right that scrolls independently — tag chips, a very large title, a subtitle, body text, inline media, more body. A round close button sits at the top-right. What not to reproduce: OceanX copy, colours, map imagery, or video player.

**Content source.** `references/gia-brochure-source.pdf` (the Gia brochure). All brochure copy below is transcribed from it verbatim, with only these approved typographic normalisations: straight and modifier apostrophes become `’`; Gia's quoted lines are rendered inside `“` `”` added by markup (the copy strings below carry no quote marks); PDF extraction artefacts are corrected to the visible text (`Confidence`, `late-night`, `Human-Centered`); outcome lines are stored in sentence case and uppercased with CSS. No other wording changes. The PDF-to-brochure mapping below is approved.

#### 5.4a.1 Triggers (the buttons under the module text)

- Every module has one real `<button type="button" class="gd-button gd-button--secondary gd-module__cta" aria-haspopup="dialog" aria-controls="brochure-…">` directly under its short text (labels in the Section 5.4 module table). It opens that module's brochure.
- The button carries a trailing 6px `--gd-gold` dot (`::after`, decorative), echoing the reference's "learn more" control. This is the only button on the page with a decorative mark (design-system Section 16.6).
- Hit area at least 44px tall; `cursor: pointer`; hover: border `--gd-gold-deep` and the dot scales to 1.3 (200ms); focus ring per Section 4.2.
- Clickable while the button itself is fully inside the stage, at every width (Section 5.4 `inert` rule).
- On click, the story freezes: the smoothing loop keeps the current `p` and stops chasing scroll until the brochure closes. The page does not scroll or jump.

#### 5.4a.2 Panel structure

Four native `<dialog class="gd-brochure" id="brochure-homes|brochure-finances|brochure-moving|brochure-possibilities" aria-labelledby="…-title">`, opened with `showModal()`.

```
dialog.gd-brochure
  button.gd-brochure__close        (top-right, fixed to the panel)
  div.gd-brochure__media           (left column, does not scroll)
    img                            (main image, cover)
    p.gd-brochure__marker          (small marker chip, bottom-left)
  div.gd-brochure__body            (right column, scrolls; tabindex="-1")
    div.gd-brochure__tags          (two chips)
    h2.gd-brochure__title
    p.gd-brochure__subtitle
    section.gd-brochure__story  ×n (h3, paragraphs, optional list, optional quote card)
    figure.gd-brochure__figure     (inline image, after the first story section)
    p.gd-brochure__closing
    div.gd-brochure__actions
```

**Geometry (desktop, above 1100px).**

- Dialog: `position: fixed; inset: 0 0 0 auto; margin: 0; width: calc(100vw - 96px); max-width: none; height: 100svh; max-height: none; padding: 0; border: 0`. Display grid `minmax(0, 40fr) minmax(0, 60fr)`. The 96px strip on the left shows the dimmed pinned story behind the backdrop, as in the reference.
- Backdrop: `rgba(21, 24, 28, 0.55)`, no blur. Clicking the visible strip closes the panel.
- Media column: full panel height, `overflow: hidden`, image `object-fit: cover` with the per-brochure `object-position` below. Marker chip bottom-left, 32px inset: 10px outlined square (`1px solid --gd-gold`, 2px inner filled square) followed by the chapter eyebrow in IBM Plex Mono 500, 11px, `0.12em`, uppercase, `--gd-night-text` on a `rgba(30, 35, 40, 0.55)` chip, 28px tall (design-system 16.2).
- Body column: `--gd-surface-elevated` background, `overflow-y: auto; overscroll-behavior: contain`, padding `72px clamp(40px, 5vw, 88px) 96px`. All content inside a 640px max-width column aligned left.
- Close button: 44px circle, `--gd-text-primary` fill, white inline-SVG cross 14px, `position: absolute; top: 20px; right: 20px`, `aria-label="Close"`. Focus ring `--gd-gold`, offset 3px.

**Typography and rhythm inside the body column.**

| Element | Style | Spacing |
|---|---|---|
| Tag chip 1 | IBM Plex Mono 600, 11px, `0.08em`, uppercase; background `--gd-text-primary`, text `--gd-bg`; padding 6px 10px; radius 2px | first element |
| Tag chip 2 | same type; background `--gd-sky-soft`, text `--gd-sky-deep` | 6px after chip 1 |
| Title H2 | IBM Plex Sans 600, `clamp(40px, 4.6vw, 68px)`, line-height 1.04, `-0.03em`, `--gd-text-primary` | 20px after tags |
| Subtitle | IBM Plex Sans 500, `clamp(22px, 2vw, 28px)`, line-height 1.3, `--gd-text-primary` | 32px after title |
| Story H3 | H3 scale (design system 4.2) | 56px before, 16px after |
| Paragraph | Body scale, `--gd-text-secondary` | 16px between paragraphs |
| List | Small body, `--gd-text-primary`; 8px `--gd-gold` round bullet (companion list) or 12px gold check SVG (teacher list); row gap 10px | 24px after paragraph |
| Sub-heading H4 (finances only) | 18px, 600, `--gd-gold-deep` | 24px before, 8px after |
| Figure | `aspect-ratio: 16 / 10`, radius 6px, `object-fit: cover`, full column width | 48px before and after |
| Closing line | Lead scale, `--gd-text-tertiary` | 64px before, after a 1px `--gd-line` rule |
| Actions | `.gd-button--primary` `Talk to Gia` (approved label) + `.gd-button--secondary` `Back to the story` (closes the panel) | 32px after closing line |

**Gia quote card** (`<figure class="gd-quote">` with `<figcaption>` for the role and `<blockquote>` for the line):

- `--gd-bg` background, 1px `--gd-gold-line` border, radius 8px, padding 28px 32px, 24px after the story paragraph.
- Role label (`figcaption`, placed first visually): IBM Plex Mono 600, 11px, `0.1em`, uppercase, `--gd-text-primary`, e.g. `GIA™ COMPANION`.
- Quote: IBM Plex Sans 400, 18px, line-height 1.6, `--gd-text-primary`, wrapped in `“ ”`, 12px after label.
- Outcome line: 1px `--gd-line-soft` rule, then IBM Plex Mono 600, 12px, `0.08em`, uppercase via CSS, `--gd-gold-deep`, 16px padding-top.
- Optional note under the card (where listed): caption scale, `--gd-text-tertiary`, 12px after the card.

**Motion.**

- Open: panel `translateX(100%) → 0`, 560ms, `cubic-bezier(.22,.61,.36,1)`; backdrop fades in over 300ms; the main image scales `1.06 → 1` over 1200ms; then the body content reveals in order (tags, title, subtitle, first story), each `opacity 0 → 1`, `y 16 → 0`, 500ms, stagger 80ms, starting 240ms after the slide begins. Later sections reveal once as they scroll into the body column (`IntersectionObserver` with the body column as `root`, threshold 0.2).
- Close: panel slides out `0 → 100%`, 380ms, `power2.in`; backdrop fades out; then the dialog closes.
- Reduced motion: no slide, no scale, no staggered reveal — instant open and close with content fully visible.

**Behaviour.**

- On open: `html.is-brochure-open { overflow: hidden }` locks the page; the story's `p` is frozen (5.4a.1); the body column scrolls to top; focus moves to the body column's title (`tabindex="-1"`).
- Close on the close button, Escape, a click on the backdrop strip, or `Back to the story`. On close: restore the exact window scroll position, unfreeze the story, return focus to the triggering module button.
- Only one brochure can be open at a time.
- Deep links: `#brochure-homes`, `#brochure-finances`, `#brochure-moving`, `#brochure-possibilities` in the URL open that brochure on load after the story has initialised; opening from a button sets the hash with `history.replaceState` (no new history entry); closing clears it the same way. An unknown hash is ignored.

**Responsive.**

- 1100px and below: panel becomes full width (`width: 100vw`), single column. The media column becomes a top band inside the scrolling body (`height: 42svh`, cover), marker chip stays bottom-left of the band; the close button stays fixed at the top-right above the band with a 1px `rgba(247,243,235,.4)` ring for contrast.
- 768px and below: body padding 24px; title `clamp(32px, 8vw, 44px)`; figure keeps 16:10; the two action buttons stack full width.
- Panel entry on mobile: `translateY(24px) → 0` with fade instead of the side slide, 420ms.

#### 5.4a.3 Brochure content

Media files are in `media/brochures/` (extracted from the brochure PDF, resized, WebP). All images get meaningful `alt` text as listed, `width`/`height` attributes, and `loading="lazy"` (they load only when the dialog first opens; set `src` from `data-src` on first open).

---

**Brochure 1 — `brochure-homes`** (opened by `Explore Homes`)

- Main image: `media/brochures/b-homes-main.webp` (1535×1024), `object-position: 30% 50%`, alt `A woman relaxing on her sofa with coffee, talking with Gia on a tablet`.
- Marker chip: `FIND A HOME`
- Tag chips: `FIND A HOME` · `GIA™ COMPANION`
- Title H2: `Find a home that fits the life you want.`
- Subtitle: `Gia strengthens communities, connecting residents to local resources and fostering collaboration.`

Story 1 — H3 `Your Companion.`
- P: `Gia is present in the quiet, everyday moments that define a life well-lived. She is the partner in your morning coffee, the listener during your afternoon walks, and the presence in your evening reflections.`
- P: `She doesn’t demand attention; she rewards it, ensuring that even the simplest moments feel more connected and meaningful.`
- List (gold bullets): `Morning Reflections` · `Quiet Encouragement` · `Shared Memories`

Figure: `media/brochures/b-homes-inline.webp` (1176×1024), `object-position: 50% 55%`, alt `A family gathered around an outdoor dinner table at night, with a tablet showing a message from Gia`.

Story 2 — H3 `Families Stay Connected.`
- P: `Gia simplifies the complexity of modern family life, coordinating schedules, sharing memories, and ensuring that the people who matter most stay at the center of your world.`
- Quote card — role `GIA™ COMPANION`; quote `I’ve coordinated the family dinner for Saturday. Everyone is confirmed. Would you like me to share the photos from last year’s gathering to get everyone excited?`; outcome `Connection through coordination.`

Story 3 — H3 `Communities Grow Stronger.`
- P: `Gia introduces members to local organizations, events, and opportunities that match their interests and goals. She helps everyone find their place and their people.`
- Quote card — role `GIA™ CONNECTOR`; quote `Welcome New Members! Gia is happy to introduce you both to the local community garden project starting this Saturday.`; outcome `Brighter futures through connection.`

Closing line: `Through every stage, every dream, and every journey—Gia is there.`

---

**Brochure 2 — `brochure-finances`** (opened by `Explore Your Options`)

- Main image: `media/brochures/b-finances-main.webp` (1536×1024), `object-position: 22% 50%` (keeps the tablet in frame), alt `A woman holding a tablet showing Gia and a privacy screen that reads You’re in control`.
- Marker chip: `UNDERSTAND YOUR FINANCES`
- Tag chips: `UNDERSTAND YOUR FINANCES` · `GIA™ COACH`
- Title H2: `See what’s possible before you decide what’s next.`
- Subtitle: `Gia helps you become stronger physically, emotionally, financially, and professionally. She identifies patterns, suggests improvements, and celebrates your progress.`

Story 1 — H3 `Your Coach.`
- Quote card — role `GIA™ COACH`; quote `You’ve maintained your focus for three hours, David. Based on your goals, now is the perfect time for a 10-minute mental reset. Shall I pause your notifications?`; outcome `Strength through discipline.`

Figure: `media/brochures/b-finances-inline.webp` (1024×683), `object-position: 60% 50%`, alt `Two children walking hand in hand along a rocky shore at sunset`.

Story 2 — H3 `Built on Trust.`
- H4 `Privacy by Design` — P: `Gia operates with absolute respect for your privacy. Your data is your own, protected by world-class security and used only to serve you.`
- H4 `Unwavering Security` — P: `We utilize the most advanced encryption and security protocols to ensure that your relationship with Gia remains private and protected.`

Story 3 — H3 `Human-Centered by Design.`
- P: `At Glonari, we believe that technology is at its best when it disappears. Gia is designed to fade into the background of your life, surfacing only when she can make a moment more meaningful, a decision clearer, or a relationship stronger.`
- P: `We don’t build platforms; we build experiences. We don’t design dashboards; we design for better living.`

Closing line: `Gia is the heartbeat of every Glonari experience.`

Open item: the brief asks this brochure to touch on Digital Banker. The PDF has no Digital Banker copy; add `<!-- TODO: copy needed — optional Digital Banker paragraph and link -->` after Story 2.

---

**Brochure 3 — `brochure-moving`** (opened by `Explore Moving`)

- Main image: `media/brochures/b-moving-main.webp` (1040×1064), `object-position: 40% 50%`, alt `A woman with long hair walking down a sunlit city street`.
- Marker chip: `PLAN A MOVE`
- Tag chips: `PLAN A MOVE` · `GIA™ GUARDIAN`
- Title H2: `Turn a move into a plan.`
- Subtitle: `Life Brings Us New Beginnings.`

Story 1 — no H3 (the subtitle introduces it)
- P: `A young student leaves home for the first time. Everything is unfamiliar—the campus, the routines, the expectations. While parents worry from a distance, the student feels the weight of a fresh start.`
- Quote card — role `GIA™ COMPANION`; quote `Good morning, Alex. I’ve identified three student organizations that match your interest in architecture. Would you like to see their meeting times for this week?`; outcome `Confidence instead of isolation.`

Figure: `media/brochures/b-moving-inline.webp` (1536×1024), `object-position: 35% 40%`, alt `A young professional walking calmly through a parking structure at night, wearing an earbud`.

Story 2 — H3 `Your Guardian.`
- P: `Gia supports confidence across life’s most vulnerable moments. Whether it’s a late-night flight, caring for aging parents, or traveling alone, she is the quiet presence that ensures you are never truly isolated.`
- Quote card — role `GIA™ GUARDIAN`; quote `I’m right here with you, Elena. I’ve noted your location and have a direct line ready if you need it. You’re almost there.`; outcome `Protection through connection.`
- Note under card: `Gia knows your destination and is ready if something doesn’t feel right.`

Closing line: `Life is better when someone walks beside you.`

---

**Brochure 4 — `brochure-possibilities`** (opened by `Explore Possibilities`)

- Main image: `media/brochures/b-possibilities-main.webp` (1536×1024), `object-position: 32% 50%`, alt `A business owner smiling while taking notes during a video call with Gia`.
- Marker chip: `BUILD WHAT COMES NEXT`
- Tag chips: `BUILD WHAT COMES NEXT` · `GIA™ COACH`
- Title H2: `Your next opportunity may start with one conversation.`
- Subtitle: `One Relationship. A Lifetime of Possibilities.`

Story 1 — H3 `Dreams That Want to Grow.`
- P: `A business owner is building something meaningful. Days are full of decisions, risks, and uncertainty. The vision is clear, but the path is complex.`
- Quote card — role `GIA™ COACH`; quote `I’ve analyzed the latest market trends for your expansion. There’s a significant opportunity in the northeast sector. Would you like to review the data together?`; outcome `Complexity made manageable.`
- Note under card: `Gia helps organize information and surface patterns to support better decisions.`

Figure: `media/brochures/b-possibilities-inline.webp` (1536×1024), `object-position: 40% 45%`, alt `A café owner studying on a tablet while writing notes`.

Story 2 — H3 `Your Teacher.`
- P: `Gia supports learning across every life stage, encouraging curiosity and providing the resources needed to master new skills or understand complex ideas.`
- P: `She doesn’t just provide answers; she helps you ask better questions, reinforcing personal values and parental guidance.`
- List (gold checks): `Encourages lifelong curiosity` · `Reinforces personal and family values` · `Adapts to your unique learning style`

Story 3 — H3 `Businesses Become More Human.`
- P: `Gia helps businesses communicate more personally, moving beyond transactions to build real relationships. She surfaces the details that matter, allowing owners to focus on the people they serve.`
- Quote card — role `GIA™ BUSINESS`; quote `David, your long-time customer Sarah is coming in today. It’s her anniversary next week. Would you like me to prepare a small gift for her?`; outcome `Relationships instead of transactions.`

Story 4 — eyebrow `THE GLONARI EXPERIENCE COLLECTION` (eyebrow style, `--gd-gold-deep`), then a 2×2 grid (1 column below 600px) of four small cards (`--gd-bg`, 1px `--gd-line`, radius 8px, padding 24px), each an H4 in `--gd-gold-deep` plus small body:
- `Living` — `Gia coordinates your home, your health, and your daily experiences, creating more time for what matters.`
- `Business` — `Gia humanizes your business, simplifying complexity and helping you build real relationships with customers.`
- `Makers` — `Gia supports your journey as a Dream Maker, helping you create a legacy by helping others realize their dreams.`
- `Housing` — `Gia strengthens communities, connecting residents to local resources and fostering collaboration.`

Closing line: `Wherever life takes you, Gia is there.`


---

### 5.5 Global site shell — build last

A light version of the Global Reserve site shell. Visual rules in design-system Section 11.

- Fixed header, 72px desktop / 64px mobile, background `rgba(247, 243, 235, 0.96)`, bottom hairline `--gd-line-soft`, no blur. Overlays Screen 1 without shifting it. `scroll-padding-top` 80px / 72px.
- Brand (left): the official logo, `<a class="gd-header__brand" href="#screen-1" aria-label="Glonari Global Dream">` containing `<img src="media/logo/gd-lockup-light.webp" alt="" width="915" height="393">` (the link carries the accessible name, so the image is decorative inside it). Height 52px above 1100px, 44px at 1100px and below (width auto, never stretched). Below 360px wide, swap to the emblem only: `media/logo/gd-emblem-light.webp` (416×416), 40px square, via `<picture>` with a `(max-width: 359px)` source. No hover effect on the logo other than the focus ring. Never recolour it, add a glow or shadow, or place it on a coloured chip.
- Navigation: `Meet Gia` → `#screen-1`, `How she helps` → `#screen-2`, `Everything connects` → `#screen-3`, `In your life` → `#screen-4`. IBM Plex Sans 500, 15px, `--gd-text-primary`, hover/active `--gd-gold-deep`.
- Action (right): one primary header button `Talk to Gia` (reuses the approved Screen 2 label), destination TODO.
- Breakpoint 1100px: nav collapses into a CSS-line hamburger (`aria-label="Open menu"` / `"Close menu"`, `aria-expanded`, `aria-controls`) revealing a solid `--gd-bg` menu. Closes on link click, Escape (focus back to the hamburger), and outside click. No animation.
- Footer: `--gd-bg-soft`, top hairline `--gd-line-soft`, compact padding. Top row: the logo `media/logo/gd-lockup-light.webp`, `alt="Glonari Global Dream"`, width 360px desktop (never above 420px, never upscaled), `min(100%, 280px)` on mobile, height auto. Then the same nav links, then IBM Plex Mono legal and copyright lines: `<!-- TODO: copy needed — legal line -->` and `© 2026 Global Dream`.
- Favicons in `<head>`: `<link rel="icon" href="favicon.ico" sizes="any">`, `<link rel="icon" type="image/png" sizes="32x32" href="media/logo/favicon-32.png">`, `<link rel="apple-touch-icon" href="media/logo/apple-touch-icon.png">`. Added in task A1 (they belong to the document head, not the shell).

No registration or login dialogs on this page unless a later prompt adds them.

---

## 6. MEDIA CONTRACT

| Slot | Screen | File | Behaviour |
|---|---|---|---|
| Hero video | 1 | `media/gd-hero.mp4` (+ `gd-hero-poster.jpg`) | Blob-loaded, scroll-scrubbed across the 400vh runway |
| Gia tablet | 3 | `media/gia-tablet.webp` | Static image, animated only by transforms and overlays |
| Walk video | 4 | `media/gd-walk.mp4` (+ `gd-walk-poster.jpg`) | Blob-loaded, scroll-scrubbed across the 650vh runway |
| Logo | Shell | `media/logo/gd-lockup-light.webp`, `gd-emblem-light.webp` | Header and footer; never recoloured |
| Brochure images | 5.4a | `media/brochures/b-{homes,finances,moving,possibilities}-{main,inline}.webp` | Loaded on first open of each brochure (`data-src` → `src`); ~680KB total |

Placeholder for any missing still or slot: `--gd-bg-soft` fill, 1px dashed `--gd-line`, centred IBM Plex Mono caption `Media pending` plus the expected filename, same `aspect-ratio` as the real asset. The page must never break because an asset is absent.

Blob loading: start fetching the hero video immediately; start fetching the walk video when Screen 3 is within one viewport of entering (`IntersectionObserver` with `rootMargin: "100% 0px"`) so it does not compete with the hero. Never fetch the walk video under reduced motion or short viewports.

Weight budget: videos ~15.8MB (hero ~5.5MB, walk ~10.3MB), brochure images ~0.7MB (lazy, only on open), all other assets under 1MB, total under 17.5MB. No autoplaying video on this page; both videos are scrubbed only.

---

## 7. MOTION, ACCESSIBILITY, PERFORMANCE

1. Pinned sections: Screen 1 and Screen 4 only. No parallax, no scroll hijacking, no scroll snapping, no page-level horizontal scroll.
2. All scroll-driven motion is a pure function of progress and fully reversible on upward scroll.
3. One `requestAnimationFrame` loop per pinned screen, started when its section is within one viewport of the visible area and stopped when it is further away. Ambient loops on Screens 2 and 3 pause off-screen.
4. Animate `transform` and `opacity` only (plus `stroke-dashoffset` for Screen 3 lines and `scaleY`/`scaleX` for rails and progress). Never animate layout properties.
5. `prefers-reduced-motion: reduce`: complete, readable, static composition on every screen as specified per screen.
6. Semantics: one `<h1>` (Screen 1). `<h2>` per screen. `<h3>` for Screen 2 rail phrases, Screen 3 areas, and Screen 4 modules. Links that navigate are `<a>`; controls that open brochures are `<button>`.
7. Keyboard: visible focus rings, logical tab order, no positive `tabindex`, no focus on invisible content (`inert` rules above).
8. Contrast: all text meets WCAG AA, including text over video (checked on first, middle, and last frames).
9. Images: explicit `width`/`height`, `loading="lazy"` below the fold.
10. No console errors or warnings on load.

---

## 8. ACCEPTANCE CHECKLIST

- [ ] No Cyrillic in any project file: `LC_ALL=C.UTF-8 grep -rnP "[\x{0400}-\x{04FF}]" --include=*.{html,css,js,md} .`
- [ ] Four sections with the ids and `data-screen` values from Section 3; `#screen-4-final` exists.
- [ ] Every visible string matches Section 5 character for character; every missing string is a listed TODO.
- [ ] Screen 1 scrubs smoothly, text blocks never overlap, block 3 and `Meet Gia` hold to the end, the button is only interactive when visible.
- [ ] Screen 2 is the only dark section; its rail completes once and its ambient dot pauses off-screen.
- [ ] Screen 3 areas appear in order 1–5, lines stay attached to the tablet at every width above 1100px, and the stacked layout replaces lines below it.
- [ ] Screen 4 matches the reference mechanics: scrubbed walking video, chapters on one continuous track entering from the right and exiting to the left, progress line, counter, simulated pull-back, final CTA with no exit. Nothing ever covers Gia's safe band.
- [ ] Every module button under the text opens its brochure; the panel slides in from the right leaving a strip of the story visible, media column fixed, body column scrolling; copy matches 5.4a.3; story freezes while open; Escape/backdrop/close work; focus returns; scroll position is restored exactly.
- [ ] Reduced motion and `max-height: 560px` produce the static layouts specified.
- [ ] Layout correct at 1920, 1440, 1024, 768, 375; no horizontal page scroll.
- [ ] No framework, build step, or package manager files.

---

## APPENDIX A — PROMPTS FOR CLAUDE CODE (use in order, one per session)

**A1 — Scaffold**

> Read `CLAUDE.md`, `GLOBAL-DREAM-BUILD-SPEC.md`, and `GLOBAL-DREAM-LIGHT-DESIGN-SYSTEM.md`. Create the file structure from Section 3, put the design-system Section 3 tokens and Section 16 dark tokens in `css/tokens.css`, build `css/base.css` (reset, fonts, `.gd-container`, section classes, buttons from Section 4.2, `.visually-hidden`, reveal classes) and `js/reveal.js`. Add the favicon links from Section 5.5. Scaffold the four sections with correct ids and `data-screen` values, headings only, Screens 2–4 hidden. Do not build any screen yet.

**A2 — Screen 1**

> Build Screen 1 per Section 5.1 in `index.html`, `css/screens.css`, and `js/hero-scrub.js`, adapting the Global Reserve scroll-scrub technique described there. Verify legibility on first, middle, and last frames and report contrast results. Reduced motion per spec.

**A3 — Screen 2**

> Build Screen 2 per Section 5.2 (the only dark screen) in `index.html`, `css/screens.css`, and `js/gia-conversation.js`. Unhide it only after visual verification.

**A4 — Screen 3**

> Build Screen 3 per Section 5.3 in `index.html`, `css/screens.css`, and `js/gia-connect.js`, using `media/gia-tablet.webp`.

**A5 — Screen 4 stage and modules**

> First open `references/oceanx-horizontal-story-reference.mp4` and `references/oceanx-contact-sheet.jpg` and describe the mechanics you will reproduce. Then build Screen 4 per Section 5.4 in `index.html`, `css/gia-story.css`, and `js/gia-story.js`: pinned stage, scrubbed walk video, horizontal modules, chrome, simulated pull-back, final CTA. Brochure buttons render but do nothing yet.

**A6 — Screen 4 brochures**

> First open `references/oceanx-brochure-panel.png` and describe the panel layout you will reproduce. Then build the four brochure dialogs per Section 5.4a in `index.html`, `css/gia-story.css`, and `js/brochure.js`, with the copy from 5.4a.3 verbatim, and wire the module buttons from 5.4a.1. Verify: buttons are clickable while the button is fully on screen, the story freezes while a panel is open, focus handling, Escape/backdrop/close, and exact scroll-position restore.

**A7 — Site shell**

> Build the header and footer per Section 5.5 in `css/site-shell.css` and `js/site-shell.js`.

**A8 — Audit**

> Run the Section 8 checklist and report each item as pass or fail with file and line. Fix failures and re-run.

---

## APPENDIX B — OPEN ITEMS

Approved on 2026-09-28: every item previously marked PROPOSED (Screen 3 `GIA` live marker; Screen 4 `CHAPTER 01–04` labels and hidden H2 `Gia in your life`; brochure mapping, `Close`, `Back to the story`, deep links; all site-shell copy) and the official logo.

Still open (the build does not wait for them — each is a TODO in place):

1. Destinations for `Meet Gia`, `Talk to Gia`, `Explore with Gia`, and brochure CTAs.
2. Footer legal line.
3. Optional Digital Banker paragraph and link in the finances brochure.
4. A larger version of the New Beginnings student photo (the PDF copy is 400px, so it is not used). Usage rights for the brochure photography to be confirmed. Gia's face in the brochure photos differs from the Gia in the page videos and tablet image.
5. A vector (SVG) or higher-resolution version of the logo. The supplied PNG is 1024px wide: enough for the header and a 420px footer on 2x screens, not for larger uses.
6. Optional: a version of the tablet image without baked call controls.
7. Optional: a longer walk video (12–16s) with a real camera pull-back at the end.
