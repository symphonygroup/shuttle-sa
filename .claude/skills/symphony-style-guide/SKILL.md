---
name: opera-design-system
description: Symphony's internal design system — canonical color palette, Poppins typography scale, design tokens, brand assets (logo, wordmark, symbol, favicon), and full dark-mode parity for every internal Symphony project. Provides the full grey solid scale, grey alpha (#1A1A24) transparency scale, primary purple (#6C69FF), light surfaces (white, light grey, app background), dark surfaces (#1A1A24 / #22222E / #2A2A36 / #16161F), white-alpha overlay scale, and semantic Red/Yellow/Green/Blue scales; the 12-level Poppins typography system (Heading 1–6, Body L/M/S, Body S Uppercase, Caption M/S) across Regular/Medium/Semibold/Bold (400/500/600/700) at line-height 1.5; the Symphony wordmark in purple/black/white at multiple sizes; and a complete dark-mode system toggled via the .dark class on <html> with semantic-alias overrides for surfaces, text, borders, status, scrim, primary tints, and brand assets. Use whenever building, styling, reviewing, or refactoring any UI in a Symphony project — web, mobile, dashboards, marketing pages, decks, mockups, prototypes — or when choosing colors, fonts, weights, font sizes, setting up Tailwind config, CSS variables, JS/TS design tokens, building a dark mode theme or theme toggle, respecting prefers-color-scheme, embedding the Symphony logo/wordmark/symbol, configuring favicons, or when the user mentions Symphony, the design system, brand colors, brand assets, brand mark, logo, wordmark, symbol, app icon, favicon, lockup, Poppins, dark mode, light mode, theme toggle, color scheme, or product UI tokens.
---

# Opera — Symphony Design System

The single source of truth for Symphony product UI — colors, typography, design tokens, **and brand assets**. Use these exact tokens and exact assets — do not paraphrase, approximate, substitute hex values, font weights, sizes, or recolor the logo.

This skill is the complete kit for any internal Symphony project. It defines both the **system** (palette, ramp, rules) and the **identity** (logo, wordmark, symbol, favicon).

## When to Apply

**Must use** whenever the task involves UI in a project that has installed this design system:
- Building or styling any component, page, or screen
- Choosing a color, font weight, font size, or spacing for any UI
- Setting up Tailwind, CSS variables, theme files, or design token exports
- Building a dark-mode theme, a theme toggle, or any UI that must respect `prefers-color-scheme`
- Reviewing UI code for brand consistency
- Producing decks, mockups, prototypes, or marketing material

**Skip** for pure backend, DevOps, or non-visual scripting work.

**Hard rules** (never violate):
- Font family is **Poppins** for every text style. No substitutes.
- Color values are **exact hex / rgba**. Never round, never invent shades.
- Body line-height is **1.5**, letter-spacing **0** for every type ramp step.
- Primary brand color is **#6C69FF** (Purple 500). It is the only primary CTA color.
- **Dark mode is opt-in via a `.dark` class on `<html>`** — never via hex swaps inside components, and never via `filter: invert()`.
- Components must reference **semantic aliases** (`bg-surface`, `text-primary`, `border-default`, …), never raw scale tokens (`bg-white`, `text-grey-900`) — that's what makes the `.dark` toggle flip them for free.
- The four **Dark Surfaces** (`#1A1A24` / `#22222E` / `#2A2A36` / `#16161F`) plus the **White Alpha** scale are the only new hex values dark mode introduces — invent no others.

---

## 1. Typography — Poppins

**Font family**: `Poppins` (Google Fonts). Fallback stack: `"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

**Weights used** (load only these to keep payload small):
| Token | Weight |
|-------|--------|
| Regular | 400 |
| Medium | 500 |
| Semibold | 600 |
| Bold | 700 |

**Web setup** — add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
```

Or via CSS:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
```

### Type scale

All steps: `line-height: 1.5`, `letter-spacing: 0`. Pick the weight that fits hierarchy (Regular for narrative, Medium for labels, Semibold for emphasis, Bold for strong headings/CTAs).

| Style | Size | Line height | Letter spacing | Common use |
|-------|-----:|------------:|---------------:|------------|
| Heading 1 | 32px | 1.5 | 0 | Page hero, primary screen title |
| Heading 2 | 28px | 1.5 | 0 | Section title |
| Heading 3 | 24px | 1.5 | 0 | Sub-section, card title large |
| Heading 4 | 20px | 1.5 | 0 | Card title, dialog title |
| Heading 5 | 18px | 1.5 | 0 | Group title, list heading |
| Heading 6 | 16px | 1.5 | 0 | Inline heading, label heading |
| Body L | 15px | 1.5 | 0 | Lead body, comfortable reading |
| Body M | 14px | 1.5 | 0 | **Default body text** |
| Body S | 13px | 1.5 | 0 | Supporting copy, table cells |
| Body S Uppercase | 13px | 1.5 | 0 | Section eyebrows, tags — `text-transform: uppercase` |
| Caption M | 12px | 1.5 | 0 | Helper text, metadata |
| Caption S | 11px | 1.5 | 0 | Smallest legal/footnote text only |

**Defaults**:
- Default app font size: **14px (Body M, Regular)**.
- Default heading weight: **Semibold (600)** unless the design specifies otherwise.
- Body S Uppercase always uses `text-transform: uppercase`; no manual capitalization.

---

## 2. Color Tokens

### 2.1 Grey Solid

Use for surfaces, borders, dividers, and disabled foreground.

| Token | Hex |
|-------|-----|
| Grey 100 | `#F9F9FA` |
| Grey 200 | `#EFEFF2` |
| Grey 300 | `#E1E1E6` |
| Grey 400 | `#CCCCD1` |
| Grey 500 | `#B3B3BA` |
| Grey 600 | `#808087` |
| Grey 700 | `#62626E` |
| Grey 800 | `#4F4F58` |
| Grey 900 | `#33333C` |
| Grey Black | `#000000` |

### 2.2 Grey Alpha (transparent overlays on `#1A1A24`)

Use for overlays, scrims, hover/press veils, subtle dividers over imagery.

| Token | Value |
|-------|-------|
| Grey Alpha 50 | `rgba(26, 26, 36, 0.04)` |
| Grey Alpha 100 | `rgba(26, 26, 36, 0.07)` |
| Grey Alpha 200 | `rgba(26, 26, 36, 0.22)` |
| Grey Alpha 300 | `rgba(26, 26, 36, 0.33)` |
| Grey Alpha 400 | `rgba(26, 26, 36, 0.44)` |
| Grey Alpha 500 | `rgba(26, 26, 36, 0.56)` |
| Grey Alpha 600 | `rgba(26, 26, 36, 0.78)` |
| Grey Alpha 700 | `rgba(26, 26, 36, 0.89)` |

### 2.3 Primary (Brand Purple)

| Token | Hex | Role |
|-------|-----|------|
| Primary 100 | `#F0F0FF` | Subtle tint background |
| Primary 200 | `#E4E4FF` | Hover background for tinted surfaces |
| Primary 300 | `#D3D2FF` | Pressed background / disabled-on-tint |
| **Primary 500** | **`#6C69FF`** | **Primary brand, default CTA fill, links, focus ring** |
| Primary 700 | `#4C4AB3` | Hover state of Primary 500 |
| Primary 800 | `#333194` | Pressed state of Primary 500 / strong emphasis |

### 2.4 Light Surfaces

| Token | Hex | Role |
|-------|-----|------|
| White | `#FFFFFF` | Cards, modals, top surface |
| Light Grey | `#FAFAFD` | Secondary surface, alternating rows |
| App Background | `#F6F7FC` | Page background |

### 2.5 Semantic — Red (Error / Destructive)

| Token | Hex |
|-------|-----|
| Red 100 | `#FFF1F1` |
| Red 200 | `#FFE3E3` |
| Red 300 | `#FFD5D6` |
| **Red 500** | **`#FE7475`** |
| Red 700 | `#DE5962` |
| Red 800 | `#C74A52` |

### 2.6 Semantic — Yellow (Warning)

| Token | Hex |
|-------|-----|
| Yellow 100 | `#FFF9EC` |
| Yellow 300 | `#FFF0D1` |
| **Yellow 500** | **`#FFBE3D`** |
| Yellow 700 | `#C88709` |

### 2.7 Semantic — Green (Success)

| Token | Hex |
|-------|-----|
| Green 100 | `#ECF2ED` |
| Green 300 | `#CEE9D2` |
| **Green 500** | **`#5BB56A`** |
| Green 700 | `#407F4A` |

### 2.8 Semantic — Blue (Info / Link-secondary)

| Token | Hex |
|-------|-----|
| Blue 100 | `#E9F1FF` |
| Blue 300 | `#B1CEFF` |
| **Blue 500** | **`#4686F5`** |
| Blue 700 | `#154DAE` |

### 2.9 Dark Surfaces

The four dark surface values. These are the **only** new raw values dark mode introduces — everything else in dark mode reuses the existing scales (grey, primary, semantic) and is swapped via semantic aliases (see §10).

| Token | Hex | Role |
|-------|-----|------|
| **Dark App Background** | **`#1A1A24`** | Page background under `.dark` — the canonical brand dark (same hue used as the base of Grey Alpha §2.2) |
| Dark Surface | `#22222E` | Cards, modals, top surface under `.dark` |
| Dark Surface Alt | `#2A2A36` | Secondary surface, zebra rows, inset under `.dark` |
| Dark Sunken | `#16161F` | Sunken / pressed inset under `.dark` |

### 2.10 White Alpha (transparent overlays on dark surfaces)

Mirror of Grey Alpha (§2.2), but white-on-dark instead of dark-on-light. Use for hover/press veils, subtle dividers, and overlays **on top of dark surfaces**. Under `.dark`, prefer these over Grey Alpha for veils.

| Token | Value |
|-------|-------|
| White Alpha 50  | `rgba(255, 255, 255, 0.04)` |
| White Alpha 100 | `rgba(255, 255, 255, 0.07)` |
| White Alpha 200 | `rgba(255, 255, 255, 0.12)` |
| White Alpha 300 | `rgba(255, 255, 255, 0.18)` |
| White Alpha 400 | `rgba(255, 255, 255, 0.28)` |
| White Alpha 500 | `rgba(255, 255, 255, 0.40)` |

---

## 3. Semantic Usage — Pick the Right Token

Match intent to token. **Never use raw hex in components**; reference these roles. The **Dark** column shows what each alias resolves to under the `.dark` class — components themselves only ever name the role.

### Surfaces & layout

| Role | Light | Dark | Alias |
|------|-------|------|-------|
| Page background | `App Background` `#F6F7FC` | `Dark App Background` `#1A1A24` | `bg-page` |
| Card / modal surface | `White` `#FFFFFF` | `Dark Surface` `#22222E` | `bg-surface` |
| Secondary surface, zebra rows | `Light Grey` `#FAFAFD` | `Dark Surface Alt` `#2A2A36` | `bg-surface-alt` |
| Subtle inset / sunken area | `Grey 100` `#F9F9FA` | `Dark Sunken` `#16161F` | `bg-sunken` |
| Divider, hairline border | `Grey 200` `#EFEFF2` | `Grey 900` `#33333C` | `border-hairline` |
| Default border | `Grey 300` `#E1E1E6` | `Grey 800` `#4F4F58` | `border-default` |
| Input border (default) | `Grey 300` `#E1E1E6` | `Grey 800` `#4F4F58` | `border-default` |
| Input border (hover) | `Grey 400` `#CCCCD1` | `Grey 700` `#62626E` | `border-default-hover` |
| Input border (focus) | `Primary 500` `#6C69FF` | `Primary 500` `#6C69FF` | `border-focus` |
| Modal scrim | `Grey Alpha 500` (56% on `#1A1A24`) | `rgba(0, 0, 0, 0.72)` | `scrim` |
| Hover veil on surface | `Grey Alpha 50` | `White Alpha 50` | `bg-hover` |
| Press veil on surface | `Grey Alpha 100` | `White Alpha 100` | `bg-press` |

### Text

| Role | Light | Dark | Alias |
|------|-------|------|-------|
| Primary text | `Grey 900` `#33333C` | `Grey 100` `#F9F9FA` | `text-primary` |
| Default body | `Grey 800` `#4F4F58` | `Grey 300` `#E1E1E6` | `text-body` |
| Secondary / supporting | `Grey 700` `#62626E` | `Grey 500` `#B3B3BA` | `text-secondary` |
| Tertiary / placeholder | `Grey 600` `#808087` | `Grey 600` `#808087` (unchanged) | `text-tertiary` |
| Disabled | `Grey 500` `#B3B3BA` | `Grey 700` `#62626E` | `text-disabled` |
| Link / brand | `Primary 500` `#6C69FF` | `Primary 500` `#6C69FF` (unchanged) | `text-link` |
| Link (hover) | `Primary 700` `#4C4AB3` | `Primary 300` `#D3D2FF` | `text-link-hover` |
| Text on Primary 500 fill | `White` `#FFFFFF` | `White` `#FFFFFF` (unchanged) | `text-on-primary` |
| Text on dark scrim/overlay | `White` `#FFFFFF` | `White` `#FFFFFF` (unchanged) | `text-on-scrim` |

### Actions / states

| Role | Light | Dark | Alias |
|------|-------|------|-------|
| Primary CTA (fill) | `Primary 500` `#6C69FF` | `Primary 500` `#6C69FF` | `bg-primary` |
| Primary CTA hover | `Primary 700` `#4C4AB3` | `Primary 700` `#4C4AB3` | `bg-primary-hover` |
| Primary CTA pressed | `Primary 800` `#333194` | `Primary 800` `#333194` | `bg-primary-press` |
| Primary CTA disabled | `Primary 300` `#D3D2FF` | `rgba(108,105,255,0.32)` | `bg-primary-disabled` |
| Secondary CTA (outline) | border `Primary 500`, text `Primary 500`, bg `White` | border `Primary 500`, text `Primary 300`, bg `Dark Surface` | composite |
| Tertiary / ghost button | text `Grey 800`, bg transparent, hover bg `Grey 200` | text `Grey 300`, bg transparent, hover bg `White Alpha 100` | composite |
| Destructive CTA | bg `Red 500` `#FE7475`, hover `Red 700`, pressed `Red 800` | bg `Red 500`, hover `Red 700`, pressed `Red 800` (unchanged) | `bg-destructive` |
| Focus ring | 2px `Primary 500` `#6C69FF`, 2px offset | 2px `Primary 500` `#6C69FF`, 2px offset (unchanged) | `focus-ring` |
| Selected row / chip bg | `Primary 100` `#F0F0FF` | `rgba(108,105,255,0.16)` | `bg-primary-tint` |
| Selected row / chip fg | `Primary 800` `#333194` | `Primary 300` `#D3D2FF` | `text-primary-tint` |

### Status (badges, alerts, toasts)

Dark-mode pattern is **derived**, not hand-tuned: background = `rgba(<500>, 0.15)`, foreground = the `300` step, border = `rgba(<500>, 0.32)`. This keeps status colors readable on dark surfaces without inventing new hex.

| Status | Light bg | Light fg | Light border | Dark bg | Dark fg | Dark border |
|--------|----------|----------|--------------|---------|---------|-------------|
| Info | `Blue 100` `#E9F1FF` | `Blue 700` `#154DAE` | `Blue 300` `#B1CEFF` | `rgba(70,134,245,0.15)` | `Blue 300` `#B1CEFF` | `rgba(70,134,245,0.32)` |
| Success | `Green 100` `#ECF2ED` | `Green 700` `#407F4A` | `Green 300` `#CEE9D2` | `rgba(91,181,106,0.15)` | `Green 300` `#CEE9D2` | `rgba(91,181,106,0.32)` |
| Warning | `Yellow 100` `#FFF9EC` | `Yellow 700` `#C88709` | `Yellow 300` `#FFF0D1` | `rgba(255,190,61,0.15)` | `Yellow 300` `#FFF0D1` | `rgba(255,190,61,0.32)` |
| Error | `Red 100` `#FFF1F1` | `Red 800` `#C74A52` | `Red 300` `#FFD5D6` | `rgba(254,116,117,0.15)` | `Red 300` `#FFD5D6` | `rgba(254,116,117,0.32)` |

Solid status fills (e.g. dot indicators, progress) use the 500 step in both modes: `Blue 500`, `Green 500`, `Yellow 500`, `Red 500`.

---

## 4. Tailwind, CSS Variables, and JS/TS Exports

Ready-to-paste configuration for the most common stacks lives in [tokens.md](tokens.md). It contains:
- `tailwind.config.{js,ts}` theme extension
- `:root` CSS custom-properties block
- TypeScript `tokens.ts` constants
- JSON design tokens (W3C-style) for tooling
- SwiftUI / React Native color & font helpers

**Always import or reference these tokens** rather than hardcoding hex in components.

---

## 5. Component Recipes (Quick)

For full component examples (Button, Input, Card, Badge, Modal) with the tokens applied, see [usage.md](usage.md).

### Primary Button — minimum requirement

```css
.btn-primary {
  background-color: #6C69FF;           /* Primary 500 */
  color: #FFFFFF;
  font-family: "Poppins", sans-serif;
  font-size: 14px;                      /* Body M */
  font-weight: 600;                     /* Semibold */
  line-height: 1.5;
  letter-spacing: 0;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 150ms ease-out;
}
.btn-primary:hover    { background-color: #4C4AB3; } /* Primary 700 */
.btn-primary:active   { background-color: #333194; } /* Primary 800 */
.btn-primary:disabled { background-color: #D3D2FF; cursor: not-allowed; } /* Primary 300 */
.btn-primary:focus-visible {
  outline: 2px solid #6C69FF;
  outline-offset: 2px;
}
```

### Body text default

```css
body {
  font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;          /* Body M */
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
  color: #4F4F58;            /* Grey 800 */
  background-color: #F6F7FC; /* App Background */
}
```

---

## 6. Quality Checklist (Pre-Delivery)

Before considering any UI done, confirm:

- [ ] All text uses **Poppins**; no Inter, system, or other substitute slipped in.
- [ ] Only weights 400 / 500 / 600 / 700 are used.
- [ ] Every font size matches an entry in the type scale exactly (32/28/24/20/18/16/15/14/13/12/11).
- [ ] All text has `line-height: 1.5` and `letter-spacing: 0`.
- [ ] No raw hex in component code — every color references a token from §2.
- [ ] Primary CTA fill is `#6C69FF`; hover `#4C4AB3`; pressed `#333194`; disabled `#D3D2FF`.
- [ ] Page background is `#F6F7FC`, cards are `#FFFFFF`.
- [ ] Primary text contrast is ≥ 4.5:1 (use `Grey 900` `#33333C` on white, not lighter greys for primary body).
- [ ] Status colors follow the table in §3 (bg 100, fg 700/800, border 300).
- [ ] Focus state visible on all interactive elements (`2px #6C69FF` outline).
- [ ] Body S Uppercase actually has `text-transform: uppercase` applied.
- [ ] Modal scrim uses `Grey Alpha 500` (56%) on light / `rgba(0,0,0,0.72)` on dark — referenced via the `scrim` alias, not a hardcoded black.
- [ ] Brand wordmark is sourced from `assets/wordmark/` — never inlined as SVG copy, screenshotted from a deck, or auto-traced.
- [ ] Wordmark color matches its surface: purple on light, white on dark, black for mono/print only.
- [ ] Wordmark renders at ≥ 80 px wide; below that the **symbol** is used instead.
- [ ] Wordmark uses `srcset` with the `200w` (1×) and `400w` (2×) variants for crisp rendering on retina.
- [ ] Wordmark aspect ratio preserved (no stretch / skew). Never crops the stripe pattern.
- [ ] Favicon, `apple-touch-icon`, and `site.webmanifest` are all wired in `<head>` (once `assets/favicon/` is populated).
- [ ] Clearspace around the mark ≥ the height of the lowercase "y" descender — no UI inside that margin.

**Dark-mode-specific checks** (in addition to all of the above):

- [ ] No raw `bg-white`, `text-grey-900`, `border-grey-200`, etc. in components — only semantic aliases (`bg-surface`, `text-primary`, `border-default`, …).
- [ ] Tailwind config has `darkMode: "class"`; the `.dark` override block is present in the global stylesheet.
- [ ] Every screen has been viewed with `.dark` toggled — no hardcoded light hex left anywhere.
- [ ] Status badges on dark use the alpha-derived pattern (`rgba(<500>, 0.15)` bg, `<300>` fg), not the `100` step.
- [ ] Selected row / chip on dark uses `rgba(108,105,255,0.16)` bg with `Primary 300` fg, never `Primary 100`.
- [ ] Wordmark swaps to the white variant under `.dark` (via `<picture>` or React).
- [ ] A theme toggle exists (System / Light / Dark) and persists to `localStorage` as `opera-theme`.
- [ ] SSR flash-prevention `<script>` is in `<head>` — no visible one-frame theme flip on first load.
- [ ] Screenshots of light UI shown on dark pages have a 1px `border-default` ring (no bright glow).
- [ ] Status always pairs an icon with the color — never color-only.

---

## 7. Anti-Patterns (Reject These)

- ❌ Inter, Roboto, system-ui, or any font besides Poppins.
- ❌ Font weights other than 400/500/600/700 (no 300, 800, 900).
- ❌ Font sizes outside the scale (no 17px, 22px, 36px, etc.).
- ❌ Hardcoded hex inside components (e.g. `color: #6C69FF` in a JSX file instead of `text-primary-500` / `var(--color-primary-500)`).
- ❌ Pure black (`#000`) for text — use `Grey 900` `#33333C`.
- ❌ Pure black scrims — use the Grey Alpha scale.
- ❌ Using a Green or Blue as a primary CTA — primary is always `#6C69FF`.
- ❌ `font-weight: bold` written as keyword inconsistent with the token (`bold` ≠ `700` in all renderers — always use the numeric value).
- ❌ Inventing intermediate shades ("Primary 400", "Grey 350") — only the published steps exist.
- ❌ Recoloring the Symphony wordmark or symbol to any color outside the three bundled variants (purple / black / white).
- ❌ Placing the purple wordmark on a purple background — it vanishes against itself.
- ❌ Drop shadows, glows, outlines, bevels, or animations on the wordmark or symbol.
- ❌ Removing or recoloring the diagonal stripe pattern in the wordmark — the pattern **is** the wordmark.
- ❌ Stretching or skewing the wordmark to fit a layout — change the layout, never the mark.
- ❌ Rendering the wordmark below 80 px wide — fall back to the symbol.
- ❌ Embedding a screenshot of the logo from a deck or a website — always reference files from `assets/`.
- ❌ Implementing dark mode via `filter: invert()` on the root element — destroys brand colors, photographs, and screenshots.
- ❌ Toggling dark mode by swapping hex values inside components instead of flipping the `.dark` class on `<html>`.
- ❌ Using `Primary 100`, `Primary 200`, or `Primary 300` as backgrounds in dark mode — they're near-white and disappear into the surface.
- ❌ Using the light-mode status pattern (`bg-blue-100 text-blue-700`) on dark surfaces — the `100` step washes out.
- ❌ Leaving the purple wordmark on a dark background under `.dark` — must swap to the white variant.
- ❌ Hard-coding a scrim as `rgba(0,0,0,0.5)` in a component instead of referencing the `scrim` alias.
- ❌ Shipping dark mode without an SSR flash-prevention `<script>` — produces a one-frame theme flip on every navigation.
- ❌ Adding a new "dark grey 850" or "dark grey 750" raw value — the four dark surfaces (`#1A1A24` / `#22222E` / `#2A2A36` / `#16161F`) plus the existing grey scale cover every dark-mode role.

---

## 8. Files in This Skill

- `SKILL.md` — this file; tokens, rules, brand reference, and dark-mode spec (§10).
- `tokens.md` — copy-paste exports for Tailwind (with `darkMode: "class"`), CSS variables (with `.dark` override), TypeScript, JSON, SwiftUI, React Native, plus brand-asset embedding snippets and the theme provider / flash-prevention snippet (§8).
- `usage.md` — component recipes (Button, Input, Badge, Card, Modal, Form, Theme Toggle, image handling) using semantic aliases so they flip with `.dark` automatically.
- `design-system.html` — single-file live showcase of every token, type style, and component recipe, with a working System / Light / Dark toggle. Open it in a browser to verify changes visually.
- `assets/` — Symphony brand assets. See `assets/README.md` for the full inventory.
  - `assets/wordmark/` — `symphony-wordmark-{purple,black,white}.png` at full-res + `200w` / `400w` (1×/2×). White variant is the dark-mode default.
  - `assets/symbol/` — standalone "S" mark (SVG + PNG sizes). _TODO — including the dark-mode `-on-dark` variant._
  - `assets/favicon/` — `favicon.ico`, `favicon.svg`, `favicon-dark.svg`, `apple-touch-icon-180.png`, `site.webmanifest`. _TODO._
  - `assets/social/` — `og-image-1200x630.png` + optional dark variant. _TODO._

---

## 9. Brand

The Symphony identity. Every internal project should ship with the wordmark, symbol, and a favicon set wired up — these assets are bundled directly with the skill so there is one source of truth.

### 9.1 Brand color

Symphony's single brand color is **Primary 500 — `#6C69FF`**. Never invent a secondary brand color. The Primary 100/200/300/700/800 steps from §2.3 are tints and shades of the same hue and may be used for hover/pressed/tinted-surface states — they are not "alternate brand colors".

### 9.2 Wordmark

The "symphony" striped letterform. Use this in nav headers, marketing hero areas, decks, email signatures, and footers.

| Token | File | Use |
|-------|------|-----|
| Wordmark / Purple | `assets/wordmark/symphony-wordmark-purple.png` | Default — on light surfaces (`White`, `Light Grey`, `App Background`). |
| Wordmark / Black | `assets/wordmark/symphony-wordmark-black.png` | Mono — print, single-color contexts, photography watermarks. |
| Wordmark / White | `assets/wordmark/symphony-wordmark-white.png` | Knockout — on dark surfaces (`#1A1A24`, Primary 700/800, scrimmed imagery). |

Each color ships in three sizes: full-resolution (4001 px wide, the canonical source), `200w` (1×, ~45 px tall), and `400w` (2× retina pair).

**Aspect ratio**: ~4.48 : 1. Always preserve when resizing — never stretch or skew.
**Minimum size**: 80 px wide. Below that, the diagonal stripes alias and become illegible — fall back to the **symbol** instead.

### 9.3 Symbol

The standalone "S" mark — used wherever the full wordmark won't fit: favicons, app icons, avatars, loading states, mobile nav collapsed states, and tight badges.

| Token | File | Use |
|-------|------|-----|
| Symbol / Brand | `assets/symbol/symphony-symbol.svg` | Default — Primary 500 fill. |
| Symbol / On-dark | `assets/symbol/symphony-symbol-on-dark.svg` | White knockout for dark surfaces. |
| Symbol / Mono | `assets/symbol/symphony-symbol-mono.svg` | `currentColor` fill — inherits text color, useful inline. |
| Symbol / PNG | `assets/symbol/symphony-symbol-{16,32,64,128,512}.png` | Raster fallbacks (favicons, legacy email). |

**Minimum size**: 16 px. **Recommended in nav headers**: 28 px paired with the wordmark.

> **TODO**: the symbol SVG and PNG sizes are not yet bundled. Until they ship, use the wordmark wherever possible, or substitute a temporary placeholder. Track in `assets/README.md`.

### 9.4 Clearspace & lockup

- **Clearspace** around the wordmark: minimum margin equal to the height of the lowercase "y" descender. No UI element — button, text, icon, border — may sit inside that margin.
- **Symbol + wordmark lockup**: horizontal, symbol on the left, gap = the height of the symbol × 0.5. Vertical-align the symbol's center to the visual midline of the wordmark.
- **Symbol alone** is allowed when the wordmark would render below its 80 px minimum, or in deliberately icon-only contexts (favicon, app icon, avatar).

### 9.5 File reference table — which asset for which surface

| Surface | File |
|---------|------|
| Web nav header (light bg) | `assets/wordmark/symphony-wordmark-purple-200w.png` + `-400w.png` (srcset) |
| Web nav header (dark bg / dark mode) | `assets/wordmark/symphony-wordmark-white-200w.png` + `-400w.png` |
| Mobile nav (collapsed) | `assets/symbol/symphony-symbol.svg` (≥ 28 px) |
| Browser favicon | `assets/favicon/favicon.ico` + `favicon.svg` |
| iOS Apple Touch Icon | `assets/favicon/apple-touch-icon-180.png` |
| Android home screen | `assets/favicon/favicon-192.png` (declared in `site.webmanifest`) |
| Loading state / avatar fallback | `assets/symbol/symphony-symbol.svg` |
| Social `og:image` | `assets/social/og-image-1200x630.png` |
| Marketing email header | `assets/wordmark/symphony-wordmark-purple.png` (2× density) |
| Slide deck title / footer | `assets/wordmark/symphony-wordmark-{purple,white}.png` |
| Print / single-color | `assets/wordmark/symphony-wordmark-black.png` |

### 9.6 Embedding — HTML, React, SwiftUI

Full copy-paste snippets live in [`tokens.md`](tokens.md#6-brand-assets) §6. Quick reference:

```html
<!-- Nav header (responsive light/dark) -->
<a href="/" class="brand">
  <picture>
    <source srcset="/assets/opera/wordmark/symphony-wordmark-white-200w.png 1x,
                    /assets/opera/wordmark/symphony-wordmark-white-400w.png 2x"
            media="(prefers-color-scheme: dark)">
    <img src="/assets/opera/wordmark/symphony-wordmark-purple-200w.png"
         srcset="/assets/opera/wordmark/symphony-wordmark-purple-400w.png 2x"
         alt="Symphony" height="40">
  </picture>
</a>

<!-- Favicons -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<link rel="manifest" href="/site.webmanifest">
```

### 9.7 Do / Don't

✅ **Do**
- Use the exact PNG/SVG files in `assets/` — never re-export or trace.
- Pair purple wordmark with light surfaces, white wordmark with dark surfaces.
- Preserve aspect ratio when resizing (constrain by either width or height, not both).
- Use the **symbol** when the wordmark drops below 80 px wide.
- Keep clearspace clear.

❌ **Don't**
- Recolor the wordmark or symbol to any non-bundled color (no red, no gradient, no team-color variant).
- Place the purple wordmark on a purple background — it vanishes.
- Stretch, skew, rotate, or distort the mark.
- Add drop shadows, glows, outlines, bevels, or animations to the mark itself.
- Recolor or remove the diagonal stripe pattern in the wordmark — it is the wordmark.
- Crop the wordmark to "save space" — use the symbol instead.
- Render the wordmark below its 80 px minimum width.
- Use a screenshot of the logo from a deck as a source file — always pull from `assets/`.

---

## 10. Dark Mode

Opera ships with full dark-mode parity. The system is built so that **components never know which mode is active** — they reference semantic aliases (§3), and a single `.dark` class on `<html>` swaps every alias to its dark value. The raw color scales (Grey, Primary, Red/Yellow/Green/Blue) are **identical** in both modes; only the aliases change.

### 10.1 How it works

1. **Toggle**: `.dark` class on the `<html>` element. Driven by a `system | light | dark` user preference persisted to `localStorage` under the key `opera-theme`. When the preference is `system`, the resolved mode follows `prefers-color-scheme`.
2. **Token shape**: raw scales are fixed. Inside `:root`, semantic aliases (`--color-bg-page`, `--color-text-primary`, …) point at light values. Inside `.dark`, the same aliases are redefined to point at dark values.
3. **Tailwind**: `darkMode: "class"` in `tailwind.config.{ts,js}`. Use the `dark:` variant only for cases the semantic aliases can't express on their own (e.g. swapping a `<picture>` source, swapping an SVG illustration, applying a dark-only border ring to a screenshot).
4. **SSR flash prevention**: a tiny blocking `<script>` in `<head>` reads `localStorage.opera-theme`, resolves it against `matchMedia("(prefers-color-scheme: dark)")`, and adds `dark` to `<html>` **before first paint**. Without this you'll get a one-frame flash of the wrong theme on every navigation.

Reference implementation (HTML, React Theme Provider, SwiftUI environment) lives in [`tokens.md`](tokens.md#8-theme-provider--flash-prevention) §8.

### 10.2 Dark surface ramp (new raw values)

The only new raw values dark mode introduces are the four surfaces in §2.9 plus the White Alpha scale in §2.10. Don't invent additional dark greys — if a role isn't covered, reuse the existing Grey scale.

| Surface | Hex | When |
|---------|-----|------|
| Dark App Background | `#1A1A24` | Page background — `<body>` / app shell. |
| Dark Surface | `#22222E` | Cards, modals, dropdowns, popovers — first layer above page. |
| Dark Surface Alt | `#2A2A36` | Zebra rows, secondary surface, sidebar bg, raised pills. |
| Dark Sunken | `#16161F` | Inset / sunken area (e.g. inside a card, sunken code block). |

The surface hierarchy is **page → surface → surface-alt → on top of surface-alt, go back to surface**. Don't stack more than two levels of depth.

### 10.3 What changes vs. light mode (delta cheat-sheet)

- **Surfaces**: `#FFFFFF` → `#22222E`; `#F6F7FC` → `#1A1A24`; `#FAFAFD` → `#2A2A36`.
- **Text**: scale inverts — `Grey 900` ↔ `Grey 100`, `Grey 800` ↔ `Grey 300`, `Grey 700` ↔ `Grey 500`.
- **Borders**: `Grey 300` → `Grey 800`; `Grey 200` → `Grey 900`.
- **Status badges**: `100/700/300` light pattern becomes alpha-derived dark pattern (`rgba(<500>, 0.15) / <300> / rgba(<500>, 0.32)`) — see §3.
- **Primary tints**: `Primary 100/200/300` (near-white) become `rgba(108,105,255, 0.16 / 0.24 / 0.32)`.
- **Scrim**: `Grey Alpha 500` → `rgba(0, 0, 0, 0.72)`.
- **Veils**: Grey Alpha → White Alpha.
- **Brand wordmark**: `symphony-wordmark-purple-*.png` → `symphony-wordmark-white-*.png`.
- **Brand symbol**: `symphony-symbol.svg` → `symphony-symbol-on-dark.svg` (TODO — until shipped, fall back to the white wordmark).
- **Focus ring & Primary 500 CTA fill**: unchanged in both modes.

### 10.4 Brand assets under dark

| Surface | Asset |
|---------|-------|
| Page / nav header (`.dark`) | `assets/wordmark/symphony-wordmark-white-200w.png` + `-400w.png` (srcset) |
| Mobile nav (collapsed, `.dark`) | `assets/symbol/symphony-symbol-on-dark.svg` (TODO; fallback: white wordmark) |
| Avatar / loading state (`.dark`) | `assets/symbol/symphony-symbol-on-dark.svg` (TODO) |
| Favicon (dark browser chrome) | `assets/favicon/favicon-dark.svg` via `<link rel="icon" media="(prefers-color-scheme: dark)" …>` (TODO) |
| Social `og:image` (dark mode UA hint) | optional `assets/social/og-image-dark-1200x630.png` (TODO) |

Use a `<picture>` element (CSS toggling via `prefers-color-scheme`) **or** swap the `src` in your React `<Wordmark>` component based on the active theme. Either works — pick one and stick to it across the app.

### 10.5 Images, illustrations, and screenshots

- **Photographs**: leave them. No filter, no overlay.
- **Decorative illustrations / spot art**: ship a dark variant (`illustration-name-dark.svg`) and swap via `<picture>` or React.
- **Screenshots of light-mode UI shown inside a dark page**: wrap in a 1px `border-default` ring (`Grey 800` `#4F4F58`) to avoid the bright glow effect against the dark surface.
- **Inline SVG icons using `currentColor`**: nothing to do — they inherit from `text-*` aliases automatically.

### 10.6 Accessibility

- Primary text on `Dark Surface` (`#F9F9FA` on `#22222E`) is ~15.8:1 — passes WCAG AAA.
- Body text (`#E1E1E6` on `#22222E`) is ~11.4:1 — passes AAA.
- Secondary text (`#B3B3BA` on `#22222E`) is ~6.6:1 — passes AA.
- Status fg (`#B1CEFF` on the alpha info bg over `#22222E`) is ~7.1:1 — passes AAA.
- **Never** rely on color alone for status (info/success/warning/error). Always pair with an icon — colorblind users on dark mode lose more cues than on light.

### 10.7 Theme toggle UX

Standard pattern: a 3-option segmented control labeled **System / Light / Dark**, persisted to `localStorage` as `opera-theme`. The "System" option follows `prefers-color-scheme` and updates live when the OS preference changes (`matchMedia(...).addEventListener("change", …)`). The component recipe is in [`usage.md`](usage.md#theme-toggle).

### 10.8 Common mistakes (reject in PR review)

- Toggling dark mode by editing hex values inside components rather than flipping `.dark`.
- `filter: invert()` anywhere — destroys brand colors, photos, and screenshots.
- Using `Primary 100/200/300` as backgrounds on dark surfaces (they're near-white).
- Using `bg-blue-100` / `bg-green-100` etc. for status badges on dark (almost-white wash).
- Leaving the purple wordmark on a dark background.
- Missing the SSR flash-prevention `<script>` — produces a visible one-frame theme flip on first load.
- Hard-coding the scrim as `rgba(0,0,0,0.5)` in components instead of using the `scrim` alias.
