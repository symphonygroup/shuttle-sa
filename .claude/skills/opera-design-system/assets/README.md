# Brand Assets

Symphony brand assets bundled with the Opera design system. Copy these into your project's `public/` (or equivalent) folder and reference them via the snippets in [`../tokens.md`](../tokens.md).

The canonical brand color is **Primary 500 — `#6C69FF`**.

---

## Available now

### `wordmark/`

The Symphony wordmark — "symphony" in the custom striped letterform. Use this in nav headers, marketing pages, email signatures, decks, and footers.

| File | Use |
|------|-----|
| `symphony-wordmark-purple.png` | **Canonical full-res source** (4001 × 893). Always derive from this. |
| `symphony-wordmark-purple-200w.png` | 1× header / inline use (≤ ~45px tall). |
| `symphony-wordmark-purple-400w.png` | 2× retina header (paired with `-200w` via `srcset`). |
| `symphony-wordmark-black.png` | Mono variant for print, single-color contexts, or watermarks on photography. |
| `symphony-wordmark-black-200w.png` / `-400w.png` | Sized black variants. |
| `symphony-wordmark-white.png` | Knockout variant for dark surfaces (e.g. `#1A1A24`, hero CTAs). |
| `symphony-wordmark-white-200w.png` / `-400w.png` | Sized white variants. |

**Aspect ratio**: ~4.48 : 1. Always preserve aspect when resizing. Never stretch, skew, or recolor.

---

## TODO — drop these in when you have them

The skill is wired to expect the following files. Until they exist, the corresponding HTML/React snippets in `tokens.md` reference them as placeholders. Components that use a missing asset will simply render nothing (no broken-image icons) thanks to a tiny inline `onerror` guard — but the goal is to have these completed before the skill is considered fully shipped.

### `symbol/` — the standalone "S" mark

The Symphony brand mark (the stylized "S") used wherever the full wordmark won't fit: favicons, app icons, avatars, loading states, mobile nav, tight badges. The `-on-dark` variant is **required** for dark-mode parity (see `SKILL.md` §10) — until it ships, dark-mode collapsed nav slots fall back to the white wordmark.

| File | Status |
|------|--------|
| `symphony-symbol.svg` | **TODO — primary brand color (#6C69FF) on transparent** |
| `symphony-symbol-on-dark.svg` | **TODO — white knockout, required for dark mode** (`.dark` collapsed nav, avatars, loading states on `#22222E`) |
| `symphony-symbol-mono.svg` | TODO — `currentColor` fill so it inherits text color (lets dark mode "just work" inline via `text-fg-*` classes) |
| `symphony-symbol-16.png` | TODO — for ≤16px raster fallback |
| `symphony-symbol-32.png` | TODO |
| `symphony-symbol-64.png` | TODO |
| `symphony-symbol-128.png` | TODO |
| `symphony-symbol-512.png` | TODO — for app icons / og:image masks |

### `favicon/` — browser & device icons

| File | Status |
|------|--------|
| `favicon.ico` | TODO — multi-resolution 16/32/48 |
| `favicon.svg` | TODO — modern browsers, scales perfectly (light browser chrome) |
| `favicon-dark.svg` | TODO — **dark-browser-chrome favicon**; wired via `<link rel="icon" media="(prefers-color-scheme: dark)" type="image/svg+xml" href="…">`. Without this, the purple favicon disappears into dark browser tabs in Chrome / Safari. |
| `favicon-16.png` | TODO |
| `favicon-32.png` | TODO |
| `favicon-192.png` | TODO — Android home screen |
| `apple-touch-icon-180.png` | TODO — iOS home screen |
| `site.webmanifest` | TODO — PWA manifest pointing at the icons above |

Once the symbol SVG exists, all favicon sizes can be derived from it (e.g. via `npx pwa-asset-generator symphony-symbol.svg ./favicon/`).

### `social/` — share previews

| File | Status |
|------|--------|
| `og-image-1200x630.png` | TODO — symbol + wordmark + tagline on `#1A1A24` background |
| `og-image-dark-1200x630.png` | TODO (optional) — only useful for platforms that ship dark-mode UA hints in social previews. Most won't read this, so it's nice-to-have, not blocking. |

---

## SVG vs PNG

PNG is the current source-of-truth because that's what we have. For long-term quality:

1. **Get vector SVGs from design** for both the wordmark and the symbol — they should be exports from the original Illustrator / Figma file, not auto-traced from these PNGs.
2. Once SVGs are in place, demote the PNGs to fallbacks: keep the `200w` / `400w` sizes for legacy email clients (Outlook, some webmail) that ignore SVG, and delete the 4001px source PNGs (the SVG replaces them).

When that swap happens, also update the file reference table in `SKILL.md` §9.6 and the snippets in `tokens.md`.

---

## Quick rules (the long version is in `SKILL.md` §9)

- **Color** — always brand purple (`#6C69FF`), black, or white. Never re-tint.
- **Stripes** — never recolor the diagonal stripe pattern; it's part of the mark.
- **Clearspace** — minimum margin around the wordmark = the height of the lowercase "y" descender. Don't crowd it.
- **Min size** — wordmark ≥ 80px wide on screen (stripes become illegible below that). Symbol ≥ 16px.
- **Backgrounds** — purple wordmark on light surfaces (`#FFFFFF`, `#F6F7FC`, `#FAFAFD`). White wordmark on dark surfaces (`#1A1A24`, `#22222E`, `#2A2A36`, Primary 700/800, photography with a scrim). Never the purple wordmark on a purple background.
- **Dark mode** — under `<html class="dark">`, every wordmark **must** swap to the white variant. Use a `<picture>` element with `(prefers-color-scheme: dark)` for CSS-only swaps, or read `useTheme().resolved` from the React provider in `tokens.md` §8 for theme-preference-aware swaps.
- **No effects** — no drop shadows, no glows, no bevels, no animations on the mark itself.
