# Design System — Token Exports

Copy-paste configuration for the most common stacks. Every value here matches `SKILL.md` exactly. Update both if anything ever changes.

---

## 1. CSS Custom Properties (`:root`)

Drop in `globals.css` / `styles/tokens.css` and import once at the app root.

```css
:root {
  /* ---------- Grey Solid ---------- */
  --color-grey-100: #F9F9FA;
  --color-grey-200: #EFEFF2;
  --color-grey-300: #E1E1E6;
  --color-grey-400: #CCCCD1;
  --color-grey-500: #B3B3BA;
  --color-grey-600: #808087;
  --color-grey-700: #62626E;
  --color-grey-800: #4F4F58;
  --color-grey-900: #33333C;
  --color-grey-black: #000000;

  /* ---------- Grey Alpha (#1A1A24 base) ---------- */
  --color-grey-alpha-50:  rgba(26, 26, 36, 0.04);
  --color-grey-alpha-100: rgba(26, 26, 36, 0.07);
  --color-grey-alpha-200: rgba(26, 26, 36, 0.22);
  --color-grey-alpha-300: rgba(26, 26, 36, 0.33);
  --color-grey-alpha-400: rgba(26, 26, 36, 0.44);
  --color-grey-alpha-500: rgba(26, 26, 36, 0.56);
  --color-grey-alpha-600: rgba(26, 26, 36, 0.78);
  --color-grey-alpha-700: rgba(26, 26, 36, 0.89);

  /* ---------- Primary (Brand Purple) ---------- */
  --color-primary-100: #F0F0FF;
  --color-primary-200: #E4E4FF;
  --color-primary-300: #D3D2FF;
  --color-primary-500: #6C69FF;
  --color-primary-700: #4C4AB3;
  --color-primary-800: #333194;

  /* ---------- Light Surfaces ---------- */
  --color-white: #FFFFFF;
  --color-light-grey: #FAFAFD;
  --color-app-background: #F6F7FC;

  /* ---------- Red (Error / Destructive) ---------- */
  --color-red-100: #FFF1F1;
  --color-red-200: #FFE3E3;
  --color-red-300: #FFD5D6;
  --color-red-500: #FE7475;
  --color-red-700: #DE5962;
  --color-red-800: #C74A52;

  /* ---------- Yellow (Warning) ---------- */
  --color-yellow-100: #FFF9EC;
  --color-yellow-300: #FFF0D1;
  --color-yellow-500: #FFBE3D;
  --color-yellow-700: #C88709;

  /* ---------- Green (Success) ---------- */
  --color-green-100: #ECF2ED;
  --color-green-300: #CEE9D2;
  --color-green-500: #5BB56A;
  --color-green-700: #407F4A;

  /* ---------- Blue (Info) ---------- */
  --color-blue-100: #E9F1FF;
  --color-blue-300: #B1CEFF;
  --color-blue-500: #4686F5;
  --color-blue-700: #154DAE;

  /* ---------- Dark Surfaces (used by .dark below) ---------- */
  --color-dark-app-background: #1A1A24;
  --color-dark-surface:        #22222E;
  --color-dark-surface-alt:    #2A2A36;
  --color-dark-sunken:         #16161F;

  /* ---------- White Alpha (overlays for dark surfaces) ---------- */
  --color-white-alpha-50:  rgba(255, 255, 255, 0.04);
  --color-white-alpha-100: rgba(255, 255, 255, 0.07);
  --color-white-alpha-200: rgba(255, 255, 255, 0.12);
  --color-white-alpha-300: rgba(255, 255, 255, 0.18);
  --color-white-alpha-400: rgba(255, 255, 255, 0.28);
  --color-white-alpha-500: rgba(255, 255, 255, 0.40);

  /* ---------- Semantic aliases (light defaults) ---------- */
  /* Surfaces */
  --color-bg-page:         var(--color-app-background);
  --color-bg-surface:      var(--color-white);
  --color-bg-surface-alt:  var(--color-light-grey);
  --color-bg-sunken:       var(--color-grey-100);
  --color-bg-hover:        var(--color-grey-alpha-50);
  --color-bg-press:        var(--color-grey-alpha-100);

  /* Text */
  --color-text-primary:    var(--color-grey-900);
  --color-text-body:       var(--color-grey-800);
  --color-text-secondary:  var(--color-grey-700);
  --color-text-tertiary:   var(--color-grey-600);
  --color-text-disabled:   var(--color-grey-500);
  --color-text-on-primary: var(--color-white);
  --color-text-on-scrim:   var(--color-white);
  --color-text-link:       var(--color-primary-500);
  --color-text-link-hover: var(--color-primary-700);

  /* Borders */
  --color-border-default:       var(--color-grey-300);
  --color-border-default-hover: var(--color-grey-400);
  --color-border-hairline:      var(--color-grey-200);
  --color-border-focus:         var(--color-primary-500);

  /* Actions */
  --color-bg-primary:          var(--color-primary-500);
  --color-bg-primary-hover:    var(--color-primary-700);
  --color-bg-primary-press:    var(--color-primary-800);
  --color-bg-primary-disabled: var(--color-primary-300);
  --color-bg-destructive:      var(--color-red-500);

  /* Primary tints (selected row, chip) */
  --color-bg-primary-tint:     var(--color-primary-100);
  --color-bg-primary-tint-hov: var(--color-primary-200);
  --color-text-primary-tint:   var(--color-primary-800);

  /* Status */
  --color-status-info-bg:      var(--color-blue-100);
  --color-status-info-fg:      var(--color-blue-700);
  --color-status-info-border:  var(--color-blue-300);
  --color-status-success-bg:     var(--color-green-100);
  --color-status-success-fg:     var(--color-green-700);
  --color-status-success-border: var(--color-green-300);
  --color-status-warning-bg:     var(--color-yellow-100);
  --color-status-warning-fg:     var(--color-yellow-700);
  --color-status-warning-border: var(--color-yellow-300);
  --color-status-error-bg:       var(--color-red-100);
  --color-status-error-fg:       var(--color-red-800);
  --color-status-error-border:   var(--color-red-300);

  /* Misc */
  --color-focus-ring: var(--color-primary-500);
  --color-scrim:      var(--color-grey-alpha-500);

  /* Card shadow (also flips under .dark) */
  --shadow-card:   0 1px 2px rgba(26, 26, 36, 0.04), 0 4px 12px rgba(26, 26, 36, 0.04);
  --shadow-modal:  0 20px 60px rgba(26, 26, 36, 0.22);

  /* ---------- Typography ---------- */
  --font-family-sans: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-h3: 24px;
  --font-size-h4: 20px;
  --font-size-h5: 18px;
  --font-size-h6: 16px;
  --font-size-body-l: 15px;
  --font-size-body-m: 14px;
  --font-size-body-s: 13px;
  --font-size-caption-m: 12px;
  --font-size-caption-s: 11px;

  --line-height-default: 1.5;
  --letter-spacing-default: 0;
}

/* ---------- Dark mode override ----------
 * Toggle by adding the `.dark` class to <html>.
 * Driven by the user's `opera-theme` preference (system | light | dark) —
 * see §8 for the theme provider + SSR flash-prevention snippet.
 *
 * Raw scales (grey, primary, red, …) are intentionally NOT redefined here.
 * Only semantic aliases swap. Components reference aliases, never raw scales,
 * so they flip for free.
 */
.dark {
  /* Surfaces */
  --color-bg-page:        var(--color-dark-app-background);
  --color-bg-surface:     var(--color-dark-surface);
  --color-bg-surface-alt: var(--color-dark-surface-alt);
  --color-bg-sunken:      var(--color-dark-sunken);
  --color-bg-hover:       var(--color-white-alpha-50);
  --color-bg-press:       var(--color-white-alpha-100);

  /* Text */
  --color-text-primary:    var(--color-grey-100);
  --color-text-body:       var(--color-grey-300);
  --color-text-secondary:  var(--color-grey-500);
  --color-text-tertiary:   var(--color-grey-600);
  --color-text-disabled:   var(--color-grey-700);
  --color-text-link-hover: var(--color-primary-300);
  /* --color-text-link, --color-text-on-primary, --color-text-on-scrim unchanged */

  /* Borders */
  --color-border-default:       var(--color-grey-800);
  --color-border-default-hover: var(--color-grey-700);
  --color-border-hairline:      var(--color-grey-900);
  /* --color-border-focus unchanged */

  /* Actions — Primary CTA fill/hover/press unchanged; disabled goes alpha */
  --color-bg-primary-disabled: rgba(108, 105, 255, 0.32);

  /* Primary tints — flip from solid 100/200 to alpha + Primary 300 fg */
  --color-bg-primary-tint:     rgba(108, 105, 255, 0.16);
  --color-bg-primary-tint-hov: rgba(108, 105, 255, 0.24);
  --color-text-primary-tint:   var(--color-primary-300);

  /* Status — derived: bg = rgba(<500>, 0.15), fg = <300>, border = rgba(<500>, 0.32) */
  --color-status-info-bg:      rgba(70, 134, 245, 0.15);
  --color-status-info-fg:      var(--color-blue-300);
  --color-status-info-border:  rgba(70, 134, 245, 0.32);

  --color-status-success-bg:     rgba(91, 181, 106, 0.15);
  --color-status-success-fg:     var(--color-green-300);
  --color-status-success-border: rgba(91, 181, 106, 0.32);

  --color-status-warning-bg:     rgba(255, 190, 61, 0.15);
  --color-status-warning-fg:     var(--color-yellow-300);
  --color-status-warning-border: rgba(255, 190, 61, 0.32);

  --color-status-error-bg:       rgba(254, 116, 117, 0.15);
  --color-status-error-fg:       var(--color-red-300);
  --color-status-error-border:   rgba(254, 116, 117, 0.32);

  /* Scrim — pure black at 72%, reads correctly over the dark surface */
  --color-scrim: rgba(0, 0, 0, 0.72);

  /* Shadows — much heavier on dark to read at all */
  --shadow-card:  0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 24px 64px rgba(0, 0, 0, 0.6);
}

/* When the user hasn't picked a preference and the OS is dark, mirror the .dark
 * override at the media-query level so SSR-rendered HTML still looks right even
 * before the flash-prevention script runs. The script will add/remove `.dark`
 * once it has read localStorage, but this prevents a white flash for the
 * "system + OS-dark" case. */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.dark) {
    /* Inherit the .dark block by repeating the same overrides. Keep these in sync. */
    --color-bg-page:        var(--color-dark-app-background);
    --color-bg-surface:     var(--color-dark-surface);
    --color-bg-surface-alt: var(--color-dark-surface-alt);
    --color-bg-sunken:      var(--color-dark-sunken);
    --color-bg-hover:       var(--color-white-alpha-50);
    --color-bg-press:       var(--color-white-alpha-100);
    --color-text-primary:    var(--color-grey-100);
    --color-text-body:       var(--color-grey-300);
    --color-text-secondary:  var(--color-grey-500);
    --color-text-disabled:   var(--color-grey-700);
    --color-text-link-hover: var(--color-primary-300);
    --color-border-default:       var(--color-grey-800);
    --color-border-default-hover: var(--color-grey-700);
    --color-border-hairline:      var(--color-grey-900);
    --color-bg-primary-disabled: rgba(108, 105, 255, 0.32);
    --color-bg-primary-tint:     rgba(108, 105, 255, 0.16);
    --color-bg-primary-tint-hov: rgba(108, 105, 255, 0.24);
    --color-text-primary-tint:   var(--color-primary-300);
    --color-status-info-bg:      rgba(70, 134, 245, 0.15);
    --color-status-info-fg:      var(--color-blue-300);
    --color-status-info-border:  rgba(70, 134, 245, 0.32);
    --color-status-success-bg:     rgba(91, 181, 106, 0.15);
    --color-status-success-fg:     var(--color-green-300);
    --color-status-success-border: rgba(91, 181, 106, 0.32);
    --color-status-warning-bg:     rgba(255, 190, 61, 0.15);
    --color-status-warning-fg:     var(--color-yellow-300);
    --color-status-warning-border: rgba(255, 190, 61, 0.32);
    --color-status-error-bg:       rgba(254, 116, 117, 0.15);
    --color-status-error-fg:       var(--color-red-300);
    --color-status-error-border:   rgba(254, 116, 117, 0.32);
    --color-scrim:  rgba(0, 0, 0, 0.72);
    --shadow-card:  0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4);
    --shadow-modal: 0 24px 64px rgba(0, 0, 0, 0.6);
  }
}
```

### Semantic utility classes (the preferred way to use the system)

Drop these alongside the `:root` block. Every component should consume **only** these utility classes (or their Tailwind / TS counterparts) — never raw scale tokens. That's what makes the `.dark` toggle work for free.

```css
/* Backgrounds */
.bg-page         { background-color: var(--color-bg-page); }
.bg-surface      { background-color: var(--color-bg-surface); }
.bg-surface-alt  { background-color: var(--color-bg-surface-alt); }
.bg-sunken       { background-color: var(--color-bg-sunken); }
.bg-primary      { background-color: var(--color-bg-primary); }
.bg-primary-tint { background-color: var(--color-bg-primary-tint); }
.bg-destructive  { background-color: var(--color-bg-destructive); }
.bg-scrim        { background-color: var(--color-scrim); }

/* Text */
.text-primary       { color: var(--color-text-primary); }
.text-body          { color: var(--color-text-body); }
.text-secondary     { color: var(--color-text-secondary); }
.text-tertiary      { color: var(--color-text-tertiary); }
.text-disabled      { color: var(--color-text-disabled); }
.text-on-primary    { color: var(--color-text-on-primary); }
.text-link          { color: var(--color-text-link); }
.text-link:hover    { color: var(--color-text-link-hover); }
.text-primary-tint  { color: var(--color-text-primary-tint); }

/* Borders */
.border-default  { border: 1px solid var(--color-border-default); }
.border-hairline { border: 1px solid var(--color-border-hairline); }

/* Status badges */
.status-info    { background-color: var(--color-status-info-bg);    color: var(--color-status-info-fg);    border: 1px solid var(--color-status-info-border); }
.status-success { background-color: var(--color-status-success-bg); color: var(--color-status-success-fg); border: 1px solid var(--color-status-success-border); }
.status-warning { background-color: var(--color-status-warning-bg); color: var(--color-status-warning-fg); border: 1px solid var(--color-status-warning-border); }
.status-error   { background-color: var(--color-status-error-bg);   color: var(--color-status-error-fg);   border: 1px solid var(--color-status-error-border); }

/* Focus ring */
.focus-ring:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Shadows */
.shadow-card  { box-shadow: var(--shadow-card); }
.shadow-modal { box-shadow: var(--shadow-modal); }
```

### Utility text classes (optional helper)

```css
.text-h1 { font: var(--font-weight-semibold) var(--font-size-h1)/var(--line-height-default) var(--font-family-sans); }
.text-h2 { font: var(--font-weight-semibold) var(--font-size-h2)/var(--line-height-default) var(--font-family-sans); }
.text-h3 { font: var(--font-weight-semibold) var(--font-size-h3)/var(--line-height-default) var(--font-family-sans); }
.text-h4 { font: var(--font-weight-semibold) var(--font-size-h4)/var(--line-height-default) var(--font-family-sans); }
.text-h5 { font: var(--font-weight-semibold) var(--font-size-h5)/var(--line-height-default) var(--font-family-sans); }
.text-h6 { font: var(--font-weight-semibold) var(--font-size-h6)/var(--line-height-default) var(--font-family-sans); }
.text-body-l { font: var(--font-weight-regular) var(--font-size-body-l)/var(--line-height-default) var(--font-family-sans); }
.text-body-m { font: var(--font-weight-regular) var(--font-size-body-m)/var(--line-height-default) var(--font-family-sans); }
.text-body-s { font: var(--font-weight-regular) var(--font-size-body-s)/var(--line-height-default) var(--font-family-sans); }
.text-body-s-upper {
  font: var(--font-weight-medium) var(--font-size-body-s)/var(--line-height-default) var(--font-family-sans);
  text-transform: uppercase;
}
.text-caption-m { font: var(--font-weight-regular) var(--font-size-caption-m)/var(--line-height-default) var(--font-family-sans); }
.text-caption-s { font: var(--font-weight-regular) var(--font-size-caption-s)/var(--line-height-default) var(--font-family-sans); }
```

---

## 2. Tailwind Config (v3 / v4 compatible)

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // <html class="dark"> activates dark mode
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ---------- Semantic aliases (consume these in components) ----------
        // Backed by CSS variables — automatically flip under .dark.
        bg: {
          page:        "var(--color-bg-page)",
          surface:     "var(--color-bg-surface)",
          surfaceAlt:  "var(--color-bg-surface-alt)",
          sunken:      "var(--color-bg-sunken)",
          hover:       "var(--color-bg-hover)",
          press:       "var(--color-bg-press)",
          primary:     "var(--color-bg-primary)",
          primaryHover: "var(--color-bg-primary-hover)",
          primaryPress: "var(--color-bg-primary-press)",
          primaryDisabled: "var(--color-bg-primary-disabled)",
          primaryTint:    "var(--color-bg-primary-tint)",
          primaryTintHov: "var(--color-bg-primary-tint-hov)",
          destructive: "var(--color-bg-destructive)",
          scrim:       "var(--color-scrim)",
        },
        fg: {
          primary:     "var(--color-text-primary)",
          body:        "var(--color-text-body)",
          secondary:   "var(--color-text-secondary)",
          tertiary:    "var(--color-text-tertiary)",
          disabled:    "var(--color-text-disabled)",
          onPrimary:   "var(--color-text-on-primary)",
          onScrim:     "var(--color-text-on-scrim)",
          link:        "var(--color-text-link)",
          linkHover:   "var(--color-text-link-hover)",
          primaryTint: "var(--color-text-primary-tint)",
        },
        stroke: {
          default:      "var(--color-border-default)",
          defaultHover: "var(--color-border-default-hover)",
          hairline:     "var(--color-border-hairline)",
          focus:        "var(--color-border-focus)",
        },
        status: {
          infoBg:        "var(--color-status-info-bg)",
          infoFg:        "var(--color-status-info-fg)",
          infoBorder:    "var(--color-status-info-border)",
          successBg:     "var(--color-status-success-bg)",
          successFg:     "var(--color-status-success-fg)",
          successBorder: "var(--color-status-success-border)",
          warningBg:     "var(--color-status-warning-bg)",
          warningFg:     "var(--color-status-warning-fg)",
          warningBorder: "var(--color-status-warning-border)",
          errorBg:       "var(--color-status-error-bg)",
          errorFg:       "var(--color-status-error-fg)",
          errorBorder:   "var(--color-status-error-border)",
        },

        // ---------- Raw scales (do NOT use directly in components) ----------
        grey: {
          100: "#F9F9FA",
          200: "#EFEFF2",
          300: "#E1E1E6",
          400: "#CCCCD1",
          500: "#B3B3BA",
          600: "#808087",
          700: "#62626E",
          800: "#4F4F58",
          900: "#33333C",
          black: "#000000",
        },
        greyAlpha: {
          50:  "rgba(26, 26, 36, 0.04)",
          100: "rgba(26, 26, 36, 0.07)",
          200: "rgba(26, 26, 36, 0.22)",
          300: "rgba(26, 26, 36, 0.33)",
          400: "rgba(26, 26, 36, 0.44)",
          500: "rgba(26, 26, 36, 0.56)",
          600: "rgba(26, 26, 36, 0.78)",
          700: "rgba(26, 26, 36, 0.89)",
        },
        primary: {
          100: "#F0F0FF",
          200: "#E4E4FF",
          300: "#D3D2FF",
          500: "#6C69FF",
          700: "#4C4AB3",
          800: "#333194",
          DEFAULT: "#6C69FF",
        },
        light: {
          white: "#FFFFFF",
          grey: "#FAFAFD",
          appBg: "#F6F7FC",
        },
        dark: {
          appBg:      "#1A1A24",
          surface:    "#22222E",
          surfaceAlt: "#2A2A36",
          sunken:     "#16161F",
        },
        whiteAlpha: {
          50:  "rgba(255,255,255,0.04)",
          100: "rgba(255,255,255,0.07)",
          200: "rgba(255,255,255,0.12)",
          300: "rgba(255,255,255,0.18)",
          400: "rgba(255,255,255,0.28)",
          500: "rgba(255,255,255,0.40)",
        },
        red: {
          100: "#FFF1F1",
          200: "#FFE3E3",
          300: "#FFD5D6",
          500: "#FE7475",
          700: "#DE5962",
          800: "#C74A52",
          DEFAULT: "#FE7475",
        },
        yellow: {
          100: "#FFF9EC",
          300: "#FFF0D1",
          500: "#FFBE3D",
          700: "#C88709",
          DEFAULT: "#FFBE3D",
        },
        green: {
          100: "#ECF2ED",
          300: "#CEE9D2",
          500: "#5BB56A",
          700: "#407F4A",
          DEFAULT: "#5BB56A",
        },
        blue: {
          100: "#E9F1FF",
          300: "#B1CEFF",
          500: "#4686F5",
          700: "#154DAE",
          DEFAULT: "#4686F5",
        },
      },
      fontFamily: {
        sans: [
          "Poppins",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight? }]
        h1:        ["32px", { lineHeight: "1.5", letterSpacing: "0" }],
        h2:        ["28px", { lineHeight: "1.5", letterSpacing: "0" }],
        h3:        ["24px", { lineHeight: "1.5", letterSpacing: "0" }],
        h4:        ["20px", { lineHeight: "1.5", letterSpacing: "0" }],
        h5:        ["18px", { lineHeight: "1.5", letterSpacing: "0" }],
        h6:        ["16px", { lineHeight: "1.5", letterSpacing: "0" }],
        "body-l":  ["15px", { lineHeight: "1.5", letterSpacing: "0" }],
        "body-m":  ["14px", { lineHeight: "1.5", letterSpacing: "0" }],
        "body-s":  ["13px", { lineHeight: "1.5", letterSpacing: "0" }],
        "caption-m": ["12px", { lineHeight: "1.5", letterSpacing: "0" }],
        "caption-s": ["11px", { lineHeight: "1.5", letterSpacing: "0" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
      boxShadow: {
        card:  "var(--shadow-card)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**Class examples**: `bg-bg-surface text-fg-primary border border-stroke-default` for a card, `bg-bg-primary text-fg-onPrimary` for a CTA, `bg-status-infoBg text-status-infoFg border border-status-infoBorder` for an info badge. All four flip correctly under `<html class="dark">`.

### Tailwind v4 `@theme` block (alternative)

```css
/* app/globals.css with Tailwind v4 */
@import "tailwindcss";

@theme {
  --font-sans: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --color-primary-500: #6C69FF;
  --color-primary-700: #4C4AB3;
  --color-primary-800: #333194;
  /* ...etc — mirror the :root block above ... */
}
```

---

## 3. TypeScript Constants (`tokens.ts`)

```ts
// design-system/tokens.ts

export const color = {
  grey: {
    100: "#F9F9FA",
    200: "#EFEFF2",
    300: "#E1E1E6",
    400: "#CCCCD1",
    500: "#B3B3BA",
    600: "#808087",
    700: "#62626E",
    800: "#4F4F58",
    900: "#33333C",
    black: "#000000",
  },
  greyAlpha: {
    50:  "rgba(26, 26, 36, 0.04)",
    100: "rgba(26, 26, 36, 0.07)",
    200: "rgba(26, 26, 36, 0.22)",
    300: "rgba(26, 26, 36, 0.33)",
    400: "rgba(26, 26, 36, 0.44)",
    500: "rgba(26, 26, 36, 0.56)",
    600: "rgba(26, 26, 36, 0.78)",
    700: "rgba(26, 26, 36, 0.89)",
  },
  primary: {
    100: "#F0F0FF",
    200: "#E4E4FF",
    300: "#D3D2FF",
    500: "#6C69FF",
    700: "#4C4AB3",
    800: "#333194",
  },
  light: {
    white:  "#FFFFFF",
    grey:   "#FAFAFD",
    appBg:  "#F6F7FC",
  },
  dark: {
    appBg:      "#1A1A24",
    surface:    "#22222E",
    surfaceAlt: "#2A2A36",
    sunken:     "#16161F",
  },
  whiteAlpha: {
    50:  "rgba(255,255,255,0.04)",
    100: "rgba(255,255,255,0.07)",
    200: "rgba(255,255,255,0.12)",
    300: "rgba(255,255,255,0.18)",
    400: "rgba(255,255,255,0.28)",
    500: "rgba(255,255,255,0.40)",
  },
  red:    { 100: "#FFF1F1", 200: "#FFE3E3", 300: "#FFD5D6", 500: "#FE7475", 700: "#DE5962", 800: "#C74A52" },
  yellow: { 100: "#FFF9EC", 300: "#FFF0D1", 500: "#FFBE3D", 700: "#C88709" },
  green:  { 100: "#ECF2ED", 300: "#CEE9D2", 500: "#5BB56A", 700: "#407F4A" },
  blue:   { 100: "#E9F1FF", 300: "#B1CEFF", 500: "#4686F5", 700: "#154DAE" },
} as const;

export const typography = {
  fontFamily:
    '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 } as const,
  size: {
    h1: 32, h2: 28, h3: 24, h4: 20, h5: 18, h6: 16,
    bodyL: 15, bodyM: 14, bodyS: 13,
    captionM: 12, captionS: 11,
  } as const,
  lineHeight: 1.5,
  letterSpacing: 0,
} as const;

export const lightSemantic = {
  bg: {
    page:        color.light.appBg,
    surface:     color.light.white,
    surfaceAlt:  color.light.grey,
    sunken:      color.grey[100],
    hover:       color.greyAlpha[50],
    press:       color.greyAlpha[100],
    primaryTint: color.primary[100],
    scrim:       color.greyAlpha[500],
  },
  text: {
    primary:     color.grey[900],
    body:        color.grey[800],
    secondary:   color.grey[700],
    tertiary:    color.grey[600],
    disabled:    color.grey[500],
    onPrimary:   color.light.white,
    onScrim:     color.light.white,
    link:        color.primary[500],
    linkHover:   color.primary[700],
    primaryTint: color.primary[800],
  },
  border: {
    default:      color.grey[300],
    defaultHover: color.grey[400],
    hairline:     color.grey[200],
    focus:        color.primary[500],
  },
  status: {
    info:    { bg: color.blue[100],   fg: color.blue[700],   border: color.blue[300]   },
    success: { bg: color.green[100],  fg: color.green[700],  border: color.green[300]  },
    warning: { bg: color.yellow[100], fg: color.yellow[700], border: color.yellow[300] },
    error:   { bg: color.red[100],    fg: color.red[800],    border: color.red[300]    },
  },
} as const;

export const darkSemantic = {
  bg: {
    page:        color.dark.appBg,
    surface:     color.dark.surface,
    surfaceAlt:  color.dark.surfaceAlt,
    sunken:      color.dark.sunken,
    hover:       color.whiteAlpha[50],
    press:       color.whiteAlpha[100],
    primaryTint: "rgba(108, 105, 255, 0.16)",
    scrim:       "rgba(0, 0, 0, 0.72)",
  },
  text: {
    primary:     color.grey[100],
    body:        color.grey[300],
    secondary:   color.grey[500],
    tertiary:    color.grey[600],
    disabled:    color.grey[700],
    onPrimary:   color.light.white,
    onScrim:     color.light.white,
    link:        color.primary[500],
    linkHover:   color.primary[300],
    primaryTint: color.primary[300],
  },
  border: {
    default:      color.grey[800],
    defaultHover: color.grey[700],
    hairline:     color.grey[900],
    focus:        color.primary[500],
  },
  status: {
    info:    { bg: "rgba(70, 134, 245, 0.15)",  fg: color.blue[300],   border: "rgba(70, 134, 245, 0.32)"  },
    success: { bg: "rgba(91, 181, 106, 0.15)",  fg: color.green[300],  border: "rgba(91, 181, 106, 0.32)"  },
    warning: { bg: "rgba(255, 190, 61, 0.15)",  fg: color.yellow[300], border: "rgba(255, 190, 61, 0.32)"  },
    error:   { bg: "rgba(254, 116, 117, 0.15)", fg: color.red[300],    border: "rgba(254, 116, 117, 0.32)" },
  },
} as const;

/**
 * Resolve the active semantic palette from a mode.
 *
 * @example
 *   const s = resolveTheme(useColorScheme()); // "light" | "dark"
 *   <View style={{ backgroundColor: s.bg.surface, color: s.text.primary }} />
 */
export type ThemeMode = "light" | "dark";
export type Semantic = typeof lightSemantic;

export function resolveTheme(mode: ThemeMode): Semantic {
  return mode === "dark" ? (darkSemantic as unknown as Semantic) : lightSemantic;
}

// Back-compat alias for code that referenced the original single export.
export const semantic = lightSemantic;
```

---

## 4. JSON Design Tokens (W3C-style — for Style Dictionary, Tokens Studio, etc.)

```json
{
  "color": {
    "grey": {
      "100": { "$value": "#F9F9FA", "$type": "color" },
      "200": { "$value": "#EFEFF2", "$type": "color" },
      "300": { "$value": "#E1E1E6", "$type": "color" },
      "400": { "$value": "#CCCCD1", "$type": "color" },
      "500": { "$value": "#B3B3BA", "$type": "color" },
      "600": { "$value": "#808087", "$type": "color" },
      "700": { "$value": "#62626E", "$type": "color" },
      "800": { "$value": "#4F4F58", "$type": "color" },
      "900": { "$value": "#33333C", "$type": "color" },
      "black": { "$value": "#000000", "$type": "color" }
    },
    "greyAlpha": {
      "50":  { "$value": "rgba(26,26,36,0.04)", "$type": "color" },
      "100": { "$value": "rgba(26,26,36,0.07)", "$type": "color" },
      "200": { "$value": "rgba(26,26,36,0.22)", "$type": "color" },
      "300": { "$value": "rgba(26,26,36,0.33)", "$type": "color" },
      "400": { "$value": "rgba(26,26,36,0.44)", "$type": "color" },
      "500": { "$value": "rgba(26,26,36,0.56)", "$type": "color" },
      "600": { "$value": "rgba(26,26,36,0.78)", "$type": "color" },
      "700": { "$value": "rgba(26,26,36,0.89)", "$type": "color" }
    },
    "primary": {
      "100": { "$value": "#F0F0FF", "$type": "color" },
      "200": { "$value": "#E4E4FF", "$type": "color" },
      "300": { "$value": "#D3D2FF", "$type": "color" },
      "500": { "$value": "#6C69FF", "$type": "color" },
      "700": { "$value": "#4C4AB3", "$type": "color" },
      "800": { "$value": "#333194", "$type": "color" }
    },
    "light": {
      "white":         { "$value": "#FFFFFF", "$type": "color" },
      "grey":          { "$value": "#FAFAFD", "$type": "color" },
      "appBackground": { "$value": "#F6F7FC", "$type": "color" }
    },
    "dark": {
      "appBackground": { "$value": "#1A1A24", "$type": "color" },
      "surface":       { "$value": "#22222E", "$type": "color" },
      "surfaceAlt":    { "$value": "#2A2A36", "$type": "color" },
      "sunken":        { "$value": "#16161F", "$type": "color" }
    },
    "whiteAlpha": {
      "50":  { "$value": "rgba(255,255,255,0.04)", "$type": "color" },
      "100": { "$value": "rgba(255,255,255,0.07)", "$type": "color" },
      "200": { "$value": "rgba(255,255,255,0.12)", "$type": "color" },
      "300": { "$value": "rgba(255,255,255,0.18)", "$type": "color" },
      "400": { "$value": "rgba(255,255,255,0.28)", "$type": "color" },
      "500": { "$value": "rgba(255,255,255,0.40)", "$type": "color" }
    },
    "red": {
      "100": { "$value": "#FFF1F1", "$type": "color" },
      "200": { "$value": "#FFE3E3", "$type": "color" },
      "300": { "$value": "#FFD5D6", "$type": "color" },
      "500": { "$value": "#FE7475", "$type": "color" },
      "700": { "$value": "#DE5962", "$type": "color" },
      "800": { "$value": "#C74A52", "$type": "color" }
    },
    "yellow": {
      "100": { "$value": "#FFF9EC", "$type": "color" },
      "300": { "$value": "#FFF0D1", "$type": "color" },
      "500": { "$value": "#FFBE3D", "$type": "color" },
      "700": { "$value": "#C88709", "$type": "color" }
    },
    "green": {
      "100": { "$value": "#ECF2ED", "$type": "color" },
      "300": { "$value": "#CEE9D2", "$type": "color" },
      "500": { "$value": "#5BB56A", "$type": "color" },
      "700": { "$value": "#407F4A", "$type": "color" }
    },
    "blue": {
      "100": { "$value": "#E9F1FF", "$type": "color" },
      "300": { "$value": "#B1CEFF", "$type": "color" },
      "500": { "$value": "#4686F5", "$type": "color" },
      "700": { "$value": "#154DAE", "$type": "color" }
    }
  },
  "typography": {
    "fontFamily": { "$value": "Poppins", "$type": "fontFamily" },
    "weight": {
      "regular":  { "$value": 400, "$type": "fontWeight" },
      "medium":   { "$value": 500, "$type": "fontWeight" },
      "semibold": { "$value": 600, "$type": "fontWeight" },
      "bold":     { "$value": 700, "$type": "fontWeight" }
    },
    "size": {
      "h1":        { "$value": "32px", "$type": "dimension" },
      "h2":        { "$value": "28px", "$type": "dimension" },
      "h3":        { "$value": "24px", "$type": "dimension" },
      "h4":        { "$value": "20px", "$type": "dimension" },
      "h5":        { "$value": "18px", "$type": "dimension" },
      "h6":        { "$value": "16px", "$type": "dimension" },
      "bodyL":     { "$value": "15px", "$type": "dimension" },
      "bodyM":     { "$value": "14px", "$type": "dimension" },
      "bodyS":     { "$value": "13px", "$type": "dimension" },
      "captionM":  { "$value": "12px", "$type": "dimension" },
      "captionS":  { "$value": "11px", "$type": "dimension" }
    },
    "lineHeight":    { "$value": 1.5, "$type": "number" },
    "letterSpacing": { "$value": "0",  "$type": "dimension" }
  },
  "semantic": {
    "$comment": "Each leaf has a light $value and a dark variant under $extensions.mode.dark — Style Dictionary / Tokens Studio can fan these out.",
    "bg": {
      "page":        { "$value": "{color.light.appBackground}", "$type": "color", "$extensions": { "mode": { "dark": "{color.dark.appBackground}" } } },
      "surface":     { "$value": "{color.light.white}",          "$type": "color", "$extensions": { "mode": { "dark": "{color.dark.surface}" } } },
      "surfaceAlt":  { "$value": "{color.light.grey}",           "$type": "color", "$extensions": { "mode": { "dark": "{color.dark.surfaceAlt}" } } },
      "sunken":      { "$value": "{color.grey.100}",             "$type": "color", "$extensions": { "mode": { "dark": "{color.dark.sunken}" } } },
      "primaryTint": { "$value": "{color.primary.100}",          "$type": "color", "$extensions": { "mode": { "dark": "rgba(108,105,255,0.16)" } } },
      "scrim":       { "$value": "{color.greyAlpha.500}",        "$type": "color", "$extensions": { "mode": { "dark": "rgba(0,0,0,0.72)" } } }
    },
    "text": {
      "primary":     { "$value": "{color.grey.900}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.100}" } } },
      "body":        { "$value": "{color.grey.800}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.300}" } } },
      "secondary":   { "$value": "{color.grey.700}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.500}" } } },
      "tertiary":    { "$value": "{color.grey.600}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.600}" } } },
      "disabled":    { "$value": "{color.grey.500}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.700}" } } },
      "onPrimary":   { "$value": "{color.light.white}", "$type": "color" },
      "link":        { "$value": "{color.primary.500}", "$type": "color" },
      "linkHover":   { "$value": "{color.primary.700}", "$type": "color", "$extensions": { "mode": { "dark": "{color.primary.300}" } } },
      "primaryTint": { "$value": "{color.primary.800}", "$type": "color", "$extensions": { "mode": { "dark": "{color.primary.300}" } } }
    },
    "border": {
      "default":  { "$value": "{color.grey.300}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.800}" } } },
      "hairline": { "$value": "{color.grey.200}", "$type": "color", "$extensions": { "mode": { "dark": "{color.grey.900}" } } },
      "focus":    { "$value": "{color.primary.500}", "$type": "color" }
    },
    "status": {
      "info":    {
        "bg":     { "$value": "{color.blue.100}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(70,134,245,0.15)" } } },
        "fg":     { "$value": "{color.blue.700}", "$type": "color", "$extensions": { "mode": { "dark": "{color.blue.300}" } } },
        "border": { "$value": "{color.blue.300}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(70,134,245,0.32)" } } }
      },
      "success": {
        "bg":     { "$value": "{color.green.100}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(91,181,106,0.15)" } } },
        "fg":     { "$value": "{color.green.700}", "$type": "color", "$extensions": { "mode": { "dark": "{color.green.300}" } } },
        "border": { "$value": "{color.green.300}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(91,181,106,0.32)" } } }
      },
      "warning": {
        "bg":     { "$value": "{color.yellow.100}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(255,190,61,0.15)" } } },
        "fg":     { "$value": "{color.yellow.700}", "$type": "color", "$extensions": { "mode": { "dark": "{color.yellow.300}" } } },
        "border": { "$value": "{color.yellow.300}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(255,190,61,0.32)" } } }
      },
      "error": {
        "bg":     { "$value": "{color.red.100}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(254,116,117,0.15)" } } },
        "fg":     { "$value": "{color.red.800}", "$type": "color", "$extensions": { "mode": { "dark": "{color.red.300}" } } },
        "border": { "$value": "{color.red.300}", "$type": "color", "$extensions": { "mode": { "dark": "rgba(254,116,117,0.32)" } } }
      }
    }
  }
}
```

---

## 5. React Native (`theme.ts`)

```ts
// design-system/theme.ts
import { Platform } from "react-native";

export const theme = {
  color: {
    grey: {
      100: "#F9F9FA", 200: "#EFEFF2", 300: "#E1E1E6", 400: "#CCCCD1",
      500: "#B3B3BA", 600: "#808087", 700: "#62626E", 800: "#4F4F58",
      900: "#33333C", black: "#000000",
    },
    greyAlpha: {
      50: "rgba(26,26,36,0.04)", 100: "rgba(26,26,36,0.07)",
      200: "rgba(26,26,36,0.22)", 300: "rgba(26,26,36,0.33)",
      400: "rgba(26,26,36,0.44)", 500: "rgba(26,26,36,0.56)",
      600: "rgba(26,26,36,0.78)", 700: "rgba(26,26,36,0.89)",
    },
    primary: { 100: "#F0F0FF", 200: "#E4E4FF", 300: "#D3D2FF", 500: "#6C69FF", 700: "#4C4AB3", 800: "#333194" },
    light:   { white: "#FFFFFF", grey: "#FAFAFD", appBg: "#F6F7FC" },
    dark:    { appBg: "#1A1A24", surface: "#22222E", surfaceAlt: "#2A2A36", sunken: "#16161F" },
    whiteAlpha: {
      50: "rgba(255,255,255,0.04)", 100: "rgba(255,255,255,0.07)",
      200: "rgba(255,255,255,0.12)", 300: "rgba(255,255,255,0.18)",
      400: "rgba(255,255,255,0.28)", 500: "rgba(255,255,255,0.40)",
    },
    red:     { 100: "#FFF1F1", 200: "#FFE3E3", 300: "#FFD5D6", 500: "#FE7475", 700: "#DE5962", 800: "#C74A52" },
    yellow:  { 100: "#FFF9EC", 300: "#FFF0D1", 500: "#FFBE3D", 700: "#C88709" },
    green:   { 100: "#ECF2ED", 300: "#CEE9D2", 500: "#5BB56A", 700: "#407F4A" },
    blue:    { 100: "#E9F1FF", 300: "#B1CEFF", 500: "#4686F5", 700: "#154DAE" },
  },
  // Use `expo-font` or `expo-google-fonts/poppins` to load the four weights.
  font: {
    family: {
      regular:  "Poppins_400Regular",
      medium:   "Poppins_500Medium",
      semibold: "Poppins_600SemiBold",
      bold:     "Poppins_700Bold",
    },
    size: {
      h1: 32, h2: 28, h3: 24, h4: 20, h5: 18, h6: 16,
      bodyL: 15, bodyM: 14, bodyS: 13,
      captionM: 12, captionS: 11,
    },
  },
} as const;

// React Native uses a multiplier OR an absolute px for lineHeight.
// Multiply the size by 1.5 at the component level: `lineHeight: size * 1.5`.
```

Install Poppins in an Expo app:

```bash
npx expo install expo-font @expo-google-fonts/poppins
```

```tsx
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
```

### Dark mode in React Native

React Native has no `.dark` class. Use `Appearance`, an override store, and a `useThemeColors()` hook that returns the active semantic palette:

```ts
// design-system/useTheme.ts
import { useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveTheme, type ThemeMode } from "./tokens";

const KEY = "opera-theme";
type Pref = "system" | "light" | "dark";

export function useTheme() {
  const [pref, setPref] = useState<Pref>("system");
  const [system, setSystem] = useState<ThemeMode>(
    (Appearance.getColorScheme() ?? "light") as ThemeMode,
  );

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setPref(v as Pref));
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystem((colorScheme ?? "light") as ThemeMode),
    );
    return () => sub.remove();
  }, []);

  const mode: ThemeMode = pref === "system" ? system : pref;
  const palette = resolveTheme(mode);

  const change = (next: Pref) => {
    setPref(next);
    AsyncStorage.setItem(KEY, next);
  };

  return { mode, pref, setPref: change, ...palette };
}
```

Then in a component:

```tsx
const t = useTheme();
<View style={{ backgroundColor: t.bg.surface }}>
  <Text style={{ color: t.text.primary, fontFamily: theme.font.family.semibold }}>
    Hello
  </Text>
</View>
```

For status-bar tint, add `expo-system-ui` and call `setBackgroundColorAsync(t.bg.page)` whenever `mode` changes.

---

## 6. Brand Assets

Brand assets live in `assets/` next to this file. The canonical convention is to copy them into your project's static directory (e.g. Next.js `public/`, Vite `public/`, Expo `assets/`) under a `opera/` subfolder and reference them as `/assets/opera/...`.

See `assets/README.md` for the full inventory and the TODO list (standalone symbol + favicon set).

### 6.1 Install the assets into a Next.js / Vite project

```bash
# Run from your project root.
mkdir -p public/assets/opera
cp -R ~/.cursor/skills/opera-design-system/assets/* public/assets/opera/
```

### 6.2 HTML — nav header + favicons

```html
<!-- Place inside <head> -->
<link rel="icon" href="/assets/opera/favicon/favicon.ico" sizes="any">
<link rel="icon" href="/assets/opera/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/opera/favicon/apple-touch-icon-180.png">
<link rel="manifest" href="/assets/opera/favicon/site.webmanifest">
<meta name="theme-color" content="#6C69FF">

<!-- Nav header — light surface -->
<a href="/" class="brand" aria-label="Symphony home">
  <img
    src="/assets/opera/wordmark/symphony-wordmark-purple-200w.png"
    srcset="/assets/opera/wordmark/symphony-wordmark-purple-200w.png 1x,
            /assets/opera/wordmark/symphony-wordmark-purple-400w.png 2x"
    alt="Symphony"
    height="40"
    width="180"
  >
</a>

<!-- Nav header — adapts to light/dark color scheme -->
<picture>
  <source
    srcset="/assets/opera/wordmark/symphony-wordmark-white-200w.png 1x,
            /assets/opera/wordmark/symphony-wordmark-white-400w.png 2x"
    media="(prefers-color-scheme: dark)">
  <img
    src="/assets/opera/wordmark/symphony-wordmark-purple-200w.png"
    srcset="/assets/opera/wordmark/symphony-wordmark-purple-400w.png 2x"
    alt="Symphony"
    height="40"
  >
</picture>
```

### 6.3 React / Next.js (`<Image>`)

```tsx
// components/brand/Wordmark.tsx
import Image from "next/image";

import wordmarkPurple from "/public/assets/opera/wordmark/symphony-wordmark-purple-400w.png";
import wordmarkWhite  from "/public/assets/opera/wordmark/symphony-wordmark-white-400w.png";

type Tone = "purple" | "white" | "black";

interface Props {
  tone?: Tone;
  /** Rendered height in px. Width is preserved via aspect ratio. */
  height?: number;
}

const SRC: Record<Tone, typeof wordmarkPurple> = {
  purple: wordmarkPurple,
  white:  wordmarkWhite,
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  black:  require("/public/assets/opera/wordmark/symphony-wordmark-black-400w.png"),
};

export function Wordmark({ tone = "purple", height = 40 }: Props) {
  return (
    <Image
      src={SRC[tone]}
      alt="Symphony"
      height={height}
      // Aspect ratio of the source is ~4.48:1.
      width={Math.round(height * 4.48)}
      priority
    />
  );
}
```

```tsx
// app/layout.tsx — metadata + favicons
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Symphony", template: "%s · Symphony" },
  themeColor: "#6C69FF",
  icons: {
    icon: [
      { url: "/assets/opera/favicon/favicon.ico", sizes: "any" },
      { url: "/assets/opera/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/assets/opera/favicon/apple-touch-icon-180.png",
  },
  manifest: "/assets/opera/favicon/site.webmanifest",
  openGraph: {
    images: ["/assets/opera/social/og-image-1200x630.png"],
  },
};
```

### 6.4 SwiftUI — bundle and render

Add the PNGs to an Xcode asset catalog as image sets (one set per tone, with `1x`/`2x`/`3x` slots) named `SymphonyWordmarkPurple`, `SymphonyWordmarkWhite`, `SymphonyWordmarkBlack`. Then:

```swift
import SwiftUI

enum SymphonyWordmark: String {
    case purple = "SymphonyWordmarkPurple"
    case white  = "SymphonyWordmarkWhite"
    case black  = "SymphonyWordmarkBlack"
}

struct WordmarkView: View {
    var tone: SymphonyWordmark = .purple
    var height: CGFloat = 40

    var body: some View {
        Image(tone.rawValue)
            .resizable()
            .scaledToFit()
            .frame(height: height)
            .accessibilityLabel("Symphony")
    }
}
```

For the app icon, add the symbol PNG sizes (16/32/64/128/512 — see `assets/symbol/` TODO) to the `AppIcon` set in `Assets.xcassets`.

### 6.5 React Native (Expo)

```tsx
// components/brand/Wordmark.tsx
import { Image, type ImageProps } from "react-native";

const SOURCES = {
  purple: require("../../assets/opera/wordmark/symphony-wordmark-purple-400w.png"),
  white:  require("../../assets/opera/wordmark/symphony-wordmark-white-400w.png"),
  black:  require("../../assets/opera/wordmark/symphony-wordmark-black-400w.png"),
} as const;

interface Props extends Omit<ImageProps, "source"> {
  tone?: keyof typeof SOURCES;
  height?: number;
}

export function Wordmark({ tone = "purple", height = 40, style, ...rest }: Props) {
  return (
    <Image
      source={SOURCES[tone]}
      style={[{ height, width: height * 4.48, resizeMode: "contain" }, style]}
      accessibilityLabel="Symphony"
      {...rest}
    />
  );
}
```

### 6.6 `site.webmanifest` template

Drop this in `assets/favicon/site.webmanifest` once the favicon PNGs are generated. (Currently TODO — see `assets/README.md`.)

```json
{
  "name": "Symphony",
  "short_name": "Symphony",
  "icons": [
    { "src": "/assets/opera/favicon/favicon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/assets/opera/favicon/favicon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#6C69FF",
  "background_color": "#F6F7FC",
  "display": "standalone"
}
```

---

## 7. SwiftUI (`DesignSystem.swift`)

```swift
import SwiftUI

enum DSColor {
    // Grey Solid
    static let grey100 = Color(hex: "#F9F9FA")
    static let grey200 = Color(hex: "#EFEFF2")
    static let grey300 = Color(hex: "#E1E1E6")
    static let grey400 = Color(hex: "#CCCCD1")
    static let grey500 = Color(hex: "#B3B3BA")
    static let grey600 = Color(hex: "#808087")
    static let grey700 = Color(hex: "#62626E")
    static let grey800 = Color(hex: "#4F4F58")
    static let grey900 = Color(hex: "#33333C")
    static let greyBlack = Color.black

    // Grey Alpha (#1A1A24 base)
    static let greyAlpha50  = Color(hex: "#1A1A24").opacity(0.04)
    static let greyAlpha100 = Color(hex: "#1A1A24").opacity(0.07)
    static let greyAlpha200 = Color(hex: "#1A1A24").opacity(0.22)
    static let greyAlpha300 = Color(hex: "#1A1A24").opacity(0.33)
    static let greyAlpha400 = Color(hex: "#1A1A24").opacity(0.44)
    static let greyAlpha500 = Color(hex: "#1A1A24").opacity(0.56)
    static let greyAlpha600 = Color(hex: "#1A1A24").opacity(0.78)
    static let greyAlpha700 = Color(hex: "#1A1A24").opacity(0.89)

    // Primary
    static let primary100 = Color(hex: "#F0F0FF")
    static let primary200 = Color(hex: "#E4E4FF")
    static let primary300 = Color(hex: "#D3D2FF")
    static let primary500 = Color(hex: "#6C69FF")
    static let primary700 = Color(hex: "#4C4AB3")
    static let primary800 = Color(hex: "#333194")

    // Light
    static let white     = Color.white
    static let lightGrey = Color(hex: "#FAFAFD")
    static let appBg     = Color(hex: "#F6F7FC")

    // Dark surfaces
    static let darkAppBg      = Color(hex: "#1A1A24")
    static let darkSurface    = Color(hex: "#22222E")
    static let darkSurfaceAlt = Color(hex: "#2A2A36")
    static let darkSunken     = Color(hex: "#16161F")

    // Semantic
    static let red500    = Color(hex: "#FE7475")
    static let yellow500 = Color(hex: "#FFBE3D")
    static let green500  = Color(hex: "#5BB56A")
    static let blue500   = Color(hex: "#4686F5")
}

/// Semantic palette resolved against the current `ColorScheme`.
/// Reference these in views — never the raw `DSColor.*` values directly.
struct DSSemantic {
    let scheme: ColorScheme

    var bgPage:       Color { scheme == .dark ? DSColor.darkAppBg      : DSColor.appBg }
    var bgSurface:    Color { scheme == .dark ? DSColor.darkSurface    : DSColor.white }
    var bgSurfaceAlt: Color { scheme == .dark ? DSColor.darkSurfaceAlt : DSColor.lightGrey }
    var bgSunken:     Color { scheme == .dark ? DSColor.darkSunken     : DSColor.grey100 }

    var textPrimary:   Color { scheme == .dark ? DSColor.grey100 : DSColor.grey900 }
    var textBody:      Color { scheme == .dark ? DSColor.grey300 : DSColor.grey800 }
    var textSecondary: Color { scheme == .dark ? DSColor.grey500 : DSColor.grey700 }
    var textDisabled:  Color { scheme == .dark ? DSColor.grey700 : DSColor.grey500 }
    var textLink:      Color { DSColor.primary500 }

    var borderDefault:  Color { scheme == .dark ? DSColor.grey800 : DSColor.grey300 }
    var borderHairline: Color { scheme == .dark ? DSColor.grey900 : DSColor.grey200 }

    var scrim: Color {
        scheme == .dark
            ? Color.black.opacity(0.72)
            : Color(hex: "#1A1A24").opacity(0.56)
    }
}

extension EnvironmentValues {
    /// Usage: `@Environment(\.dsSemantic) private var ds`
    var dsSemantic: DSSemantic { DSSemantic(scheme: colorScheme) }
}

// In a view:
// struct Card: View {
//     @Environment(\.dsSemantic) private var ds
//     var body: some View {
//         VStack { /* … */ }
//             .background(ds.bgSurface)
//             .foregroundStyle(ds.textPrimary)
//     }
// }
//
// To force a mode app-wide, wrap your root in `.preferredColorScheme(.dark)`.
// To follow system, omit the modifier.

enum DSFont {
    static func regular(_ size: CGFloat)  -> Font { .custom("Poppins-Regular",   size: size) }
    static func medium(_ size: CGFloat)   -> Font { .custom("Poppins-Medium",    size: size) }
    static func semibold(_ size: CGFloat) -> Font { .custom("Poppins-SemiBold",  size: size) }
    static func bold(_ size: CGFloat)     -> Font { .custom("Poppins-Bold",      size: size) }

    static let h1       = semibold(32)
    static let h2       = semibold(28)
    static let h3       = semibold(24)
    static let h4       = semibold(20)
    static let h5       = semibold(18)
    static let h6       = semibold(16)
    static let bodyL    = regular(15)
    static let bodyM    = regular(14)
    static let bodyS    = regular(13)
    static let captionM = regular(12)
    static let captionS = regular(11)
}

// Helper for #RRGGBB hex strings.
extension Color {
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var rgb: UInt64 = 0
        Scanner(string: s).scanHexInt64(&rgb)
        self = Color(
            red:   Double((rgb >> 16) & 0xFF) / 255,
            green: Double((rgb >>  8) & 0xFF) / 255,
            blue:  Double( rgb        & 0xFF) / 255
        )
    }
}
```

---

## 8. Theme Provider + Flash Prevention

The web theme toggle has three moving parts: (1) a blocking `<script>` in `<head>` that sets the right class on first paint, (2) a `ThemeProvider` context exposing `mode`, `resolvedMode`, and `setMode`, and (3) a `<ThemeToggle />` component (System / Light / Dark) the user clicks. All three are ~50 lines of code total.

### 8.1 Flash-prevention `<script>` (blocking — must be in `<head>`)

Place this **inline in `<head>`** before any CSS link tag. It runs synchronously, so no first-paint flash.

```html
<script>
  // Opera theme bootstrap — keep inline and blocking.
  (function () {
    try {
      var pref = localStorage.getItem("opera-theme") || "system";
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var resolved =
        pref === "dark" || (pref === "system" && systemDark) ? "dark" : "light";
      var html = document.documentElement;
      html.classList.toggle("dark", resolved === "dark");
      html.classList.toggle("light", resolved === "light");
      html.style.colorScheme = resolved; // tells the UA to render form controls / scrollbars in the right scheme
    } catch (_) {
      /* localStorage blocked — fall back to OS preference via CSS media query */
    }
  })();
</script>
```

Next.js App Router users: drop this in `app/layout.tsx` inside `<head>` using `<Script id="opera-theme" strategy="beforeInteractive">`, or render it as a literal `<script dangerouslySetInnerHTML={{__html: ...}} />`.

### 8.2 React Theme Provider

```tsx
// design-system/theme-provider.tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Pref = "system" | "light" | "dark";
type Resolved = "light" | "dark";

interface ThemeContextValue {
  pref: Pref;
  resolved: Resolved;
  setPref: (next: Pref) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "opera-theme";

function resolve(pref: Pref): Resolved {
  if (pref === "light" || pref === "dark") return pref;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(resolved: Resolved) {
  const html = document.documentElement;
  html.classList.toggle("dark", resolved === "dark");
  html.classList.toggle("light", resolved === "light");
  html.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initial value matches the bootstrap script, so no extra render is wasted.
  const [pref, setPrefState] = useState<Pref>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as Pref) || "system";
  });
  const [resolved, setResolved] = useState<Resolved>(() => resolve(pref));

  // Track OS changes whenever the user picks "system".
  useEffect(() => {
    if (pref !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = resolve("system");
      setResolved(next);
      apply(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((next: Pref) => {
    localStorage.setItem(STORAGE_KEY, next);
    setPrefState(next);
    const r = resolve(next);
    setResolved(r);
    apply(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
```

### 8.3 `<ThemeToggle />` segmented control

```tsx
// design-system/theme-toggle.tsx
"use client";

import { useTheme } from "./theme-provider";

const OPTIONS = [
  { value: "system", label: "System" },
  { value: "light",  label: "Light"  },
  { value: "dark",   label: "Dark"   },
] as const;

export function ThemeToggle() {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-1 p-1 rounded-full bg-bg-surfaceAlt border border-stroke-hairline"
    >
      {OPTIONS.map((opt) => {
        const selected = pref === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPref(opt.value)}
            className={[
              "h-8 px-3 rounded-full text-body-s font-medium transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus",
              selected
                ? "bg-bg-primaryTint text-fg-primaryTint"
                : "text-fg-secondary hover:bg-bg-hover",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

### 8.4 Wire it up (Next.js App Router example)

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/design-system/theme-provider";
import "./globals.css";

const FLASH_PREVENTION = `(function(){try{var p=localStorage.getItem("opera-theme")||"system";var d=matchMedia("(prefers-color-scheme: dark)").matches;var r=p==="dark"||(p==="system"&&d)?"dark":"light";var h=document.documentElement;h.classList.toggle("dark",r==="dark");h.classList.toggle("light",r==="light");h.style.colorScheme=r;}catch(_){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FLASH_PREVENTION }} />
      </head>
      <body className="bg-bg-page text-fg-body font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

That's the whole dark-mode wiring. Every component built against the semantic aliases (`bg-bg-*`, `text-fg-*`, `border-stroke-*`, `status-*`) automatically flips when `setPref("dark")` runs.
