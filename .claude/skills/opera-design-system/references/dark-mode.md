# Opera Design System — Dark Mode Reference

Full dark-mode specification. The core rules and quick-reference are in `SKILL.md §10`. This file has everything needed for implementation, review, and debugging.

---

## How It Works

1. **Toggle**: `.dark` class on `<html>`. Driven by `localStorage` key `opera-theme` with values `system | light | dark`. When `system`, follows `prefers-color-scheme`.
2. **Token shape**: Raw scales (Grey, Primary, Red/Yellow/Green/Blue) are fixed in `:root`. Inside `.dark`, only semantic aliases are redefined — components reference aliases, never raw scales, so they flip for free.
3. **Tailwind**: `darkMode: "class"` in `tailwind.config.{ts,js}`. Use `dark:` variant only when semantic aliases aren't enough (e.g. swapping `<picture>` source, dark-only screenshot ring).
4. **SSR flash prevention**: an inline blocking `<script>` in `<head>` reads `localStorage.opera-theme`, resolves it against `matchMedia("(prefers-color-scheme: dark)")`, and adds `.dark` to `<html>` before first paint. Without it: a one-frame flash of the wrong theme on every navigation.

Reference implementation (HTML, React ThemeProvider, flash-prevention snippet) → `tokens.md §8`.

---

## Dark Surface Ramp

The only new raw hex values dark mode introduces. Don't invent additional dark greys — reuse the existing Grey scale for everything else.

| Surface | Hex | When |
|---------|-----|------|
| Dark App Background | `#1A1A24` | Page background — `<body>` / app shell |
| Dark Surface | `#22222E` | Cards, modals, dropdowns, popovers — first layer above page |
| Dark Surface Alt | `#2A2A36` | Zebra rows, secondary surface, sidebar, raised pills |
| Dark Sunken | `#16161F` | Inset / sunken area (inside a card, code block) |

Surface hierarchy: **page → surface → surface-alt → (loop back to surface)**. Never stack more than two levels of depth.

---

## Delta Cheat-Sheet (Light → Dark)

| Category | Light value | Dark value |
|----------|-------------|------------|
| Page background | `#F6F7FC` | `#1A1A24` |
| Card / modal | `#FFFFFF` | `#22222E` |
| Secondary surface | `#FAFAFD` | `#2A2A36` |
| Sunken | `#F9F9FA` (Grey 100) | `#16161F` |
| Primary text | `Grey 900` `#33333C` | `Grey 100` `#F9F9FA` |
| Default body | `Grey 800` `#4F4F58` | `Grey 300` `#E1E1E6` |
| Secondary | `Grey 700` `#62626E` | `Grey 500` `#B3B3BA` |
| Tertiary | `Grey 600` `#808087` | `Grey 600` `#808087` (unchanged) |
| Disabled text | `Grey 500` `#B3B3BA` | `Grey 700` `#62626E` |
| Default border | `Grey 300` `#E1E1E6` | `Grey 800` `#4F4F58` |
| Hairline border | `Grey 200` `#EFEFF2` | `Grey 900` `#33333C` |
| Scrim | `Grey Alpha 500` (56%) | `rgba(0,0,0,0.72)` |
| Hover veil | `Grey Alpha 50` | `White Alpha 50` |
| Press veil | `Grey Alpha 100` | `White Alpha 100` |
| Status badges | `bg 100 / fg 700 or 800 / border 300` | `bg rgba(500,0.15) / fg 300 / border rgba(500,0.32)` |
| Primary tint bg | `Primary 100` `#F0F0FF` | `rgba(108,105,255,0.16)` |
| Primary tint hover | `Primary 200` `#E4E4FF` | `rgba(108,105,255,0.24)` |
| Primary tint fg | `Primary 800` `#333194` | `Primary 300` `#D3D2FF` |
| Focus ring | `Primary 500` `#6C69FF` | unchanged |
| Primary CTA fill | `Primary 500` `#6C69FF` | unchanged |
| Brand wordmark | `symphony-wordmark-purple-*.png` | `symphony-wordmark-white-*.png` |
| Brand symbol | `symphony-symbol.svg` | `symphony-symbol-on-dark.svg` (TODO) |

---

## Brand Assets Under Dark

| Surface | Asset |
|---------|-------|
| Page / nav header (`.dark`) | `assets/wordmark/symphony-wordmark-white-200w.png` + `-400w.png` (srcset) |
| Mobile nav (collapsed, `.dark`) | `assets/symbol/symphony-symbol-on-dark.svg` (TODO; fallback: white wordmark) |
| Avatar / loading state (`.dark`) | `assets/symbol/symphony-symbol-on-dark.svg` (TODO) |
| Favicon (dark browser chrome) | `assets/favicon/favicon-dark.svg` via `<link rel="icon" media="(prefers-color-scheme: dark)" …>` (TODO) |
| Social `og:image` (dark UA hint) | `assets/social/og-image-dark-1200x630.png` (TODO — optional) |

Use `<picture>` (CSS `prefers-color-scheme`) for static/SSR HTML with no JS theme system. Use `useTheme().resolved` from the React `ThemeProvider` (`tokens.md §8`) when the app has an explicit user theme preference — `<picture>` only follows the OS setting, not `localStorage`.

---

## Images, Illustrations, and Screenshots

- **Photographs**: leave them unchanged. No filter, no overlay.
- **Decorative illustrations / spot art**: ship a dark variant (`illustration-name-dark.svg`) and swap via `<picture>` or React.
- **Screenshots of light UI shown on a dark page**: wrap in a 1px `border-default` ring (`Grey 800` `#4F4F58`) — prevents the bright-glow effect against the dark surface.
- **Inline SVG icons with `currentColor`**: nothing to do — they inherit from `text-*` aliases automatically.

---

## Accessibility (Contrast Ratios)

All ratios measured against `Dark Surface` (`#22222E`):

| Text role | Color | Ratio | WCAG |
|-----------|-------|-------|------|
| Primary text | `#F9F9FA` on `#22222E` | ~15.8:1 | AAA |
| Body text | `#E1E1E6` on `#22222E` | ~11.4:1 | AAA |
| Secondary text | `#B3B3BA` on `#22222E` | ~6.6:1 | AA |
| Status fg (info) | `#B1CEFF` on alpha info bg over `#22222E` | ~7.1:1 | AAA |

Never rely on color alone for status — always pair with an icon. Colorblind users on dark mode lose more cues than on light.

---

## Theme Toggle UX

Standard pattern: a 3-option segmented control labeled **System / Light / Dark**, persisted to `localStorage` as `opera-theme`. The "System" option follows `prefers-color-scheme` and updates live via `matchMedia(...).addEventListener("change", …)`.

Component recipe → `usage.md §Theme Toggle`. Full provider + flash-prevention → `tokens.md §8`.

---

## Common Mistakes (Reject in PR Review)

- Toggling dark mode by editing hex values inside components — flip `.dark` on `<html>`, never touch components.
- `filter: invert()` anywhere — destroys brand colors, photos, and screenshots.
- Using `Primary 100/200/300` as backgrounds on dark surfaces — they're near-white, invisible.
- Using `bg-blue-100` / `bg-green-100` etc. for status badges on dark — the `100` step washes out.
- Leaving the purple wordmark on a dark background — swap to white variant.
- Missing the SSR flash-prevention `<script>` in `<head>` — one-frame theme flip on every navigation.
- Hard-coding the scrim as `rgba(0,0,0,0.5)` — reference the `scrim` alias (`var(--color-scrim)`).
- Adding new dark grey values ("dark grey 850") — the four surfaces plus existing Grey scale cover every role.
- Using `dark:` Tailwind variant for things semantic aliases already handle — adds duplication and drift risk.
