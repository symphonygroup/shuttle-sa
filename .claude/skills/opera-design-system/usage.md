# Design System — Component Recipes

Concrete, copy-paste-ready snippets for the most common UI primitives, every value bound to a token from `SKILL.md`. Use these as the **starting point** for any UI work in a project that has installed this design system — adapt structure, never substitute brand values.

> **All recipes use semantic-alias Tailwind classes** (`bg-bg-surface`, `text-fg-primary`, `border-stroke-default`, `bg-status-infoBg`, …). These are defined in [`tokens.md`](tokens.md#2-tailwind-config-v3--v4-compatible) §2 and resolve to CSS variables that flip automatically under the `.dark` class on `<html>`. **Never** drop back to raw scale classes (`bg-white`, `text-grey-900`, `border-grey-300`) in components — those don't flip.

---

## Button

### React + Tailwind

```tsx
// components/ui/button.tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center font-sans font-semibold leading-[1.5] " +
  "rounded-lg transition-colors duration-150 ease-out " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus " +
  "disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  sm: "h-9  px-3 text-body-s",   // 13px
  md: "h-10 px-4 text-body-m",   // 14px
  lg: "h-12 px-5 text-body-l",   // 15px
};

// All variants flip automatically under .dark — only `bg-primaryTint` and the
// ghost hover state change look between modes; the brand fill stays purple.
const variants: Record<Variant, string> = {
  primary:
    "bg-bg-primary text-fg-onPrimary hover:bg-bg-primaryHover active:bg-bg-primaryPress disabled:bg-bg-primaryDisabled",
  secondary:
    "bg-bg-surface text-fg-link border border-stroke-focus hover:bg-bg-primaryTint active:bg-bg-primaryTintHover disabled:text-fg-disabled disabled:border-stroke-default",
  ghost:
    "bg-transparent text-fg-body hover:bg-bg-hover active:bg-bg-press disabled:text-fg-disabled",
  destructive:
    "bg-bg-destructive text-fg-onPrimary hover:bg-red-700 active:bg-red-800 disabled:bg-red-300 dark:disabled:bg-red-800/40",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    />
  ),
);
Button.displayName = "Button";
```

### React Native

```tsx
// components/Button.tsx
import { Pressable, Text, StyleSheet, type PressableProps } from "react-native";
import { theme } from "@/design-system/theme";
import { useTheme } from "@/design-system/useTheme";

type Variant = "primary" | "secondary" | "destructive";

interface Props extends PressableProps {
  title: string;
  variant?: Variant;
}

// Resolves dark/light at render time via the useTheme() hook from tokens.md §5.
export function Button({ title, variant = "primary", disabled, ...rest }: Props) {
  const t = useTheme();
  const fill =
    variant === "primary"     ? theme.color.primary[500]
    : variant === "destructive" ? theme.color.red[500]
    : t.bg.surface;
  const border = variant === "secondary" ? theme.color.primary[500] : "transparent";
  const labelColor =
    variant === "secondary" ? t.text.link : theme.color.light.white;

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: fill, borderWidth: variant === "secondary" ? 1 : 0, borderColor: border },
        pressed && pressedStyles[variant],
        disabled && disabledStyles[variant],
      ]}
      {...rest}
    >
      <Text style={[styles.label, { color: labelColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.font.family.semibold,
    fontSize: theme.font.size.bodyM,
    lineHeight: theme.font.size.bodyM * 1.5,
  },
});

const pressedStyles = {
  primary:     { backgroundColor: theme.color.primary[800] },
  secondary:   { backgroundColor: "rgba(108,105,255,0.16)" },
  destructive: { backgroundColor: theme.color.red[800] },
} as const;

const disabledStyles = {
  primary:     { backgroundColor: theme.color.primary[300], opacity: 0.6 },
  secondary:   { borderColor: theme.color.primary[300], opacity: 0.6 },
  destructive: { backgroundColor: theme.color.red[300], opacity: 0.6 },
} as const;
```

---

## Input

```tsx
// components/ui/input.tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const inputId = id ?? `in-${label.replace(/\s+/g, "-").toLowerCase()}`;
    return (
      <div className="flex flex-col gap-1.5 font-sans">
        <label htmlFor={inputId} className="text-body-s font-medium text-fg-body">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "h-11 px-3 text-body-m font-regular text-fg-primary bg-bg-surface",
            "border border-stroke-default rounded-md placeholder:text-fg-tertiary",
            "hover:border-stroke-defaultHover",
            "focus:border-stroke-focus focus:outline-none focus:ring-2 focus:ring-stroke-focus/30",
            "disabled:bg-bg-sunken disabled:text-fg-disabled disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={`${inputId}-err`} role="alert" className="text-caption-m text-status-errorFg">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-caption-m text-fg-secondary">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
```

---

## Card

```tsx
// components/ui/card.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-bg-surface rounded-xl border border-stroke-hairline shadow-card",
        "p-6 font-sans",
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-h4 font-semibold text-fg-primary mb-2">{children}</h3>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <p className="text-body-m font-regular text-fg-secondary">{children}</p>;
}
```

`shadow-card` resolves to the CSS variable `--shadow-card`, which uses Grey Alpha on light and pure-black-at-40% on dark — heavier on dark surfaces so the elevation reads at all.

---

## Badge / Status Pill

```tsx
// components/ui/badge.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Status = "info" | "success" | "warning" | "error" | "neutral";

// Every status flips correctly under .dark thanks to the alias layer in tokens.md.
const styles: Record<Status, string> = {
  neutral: "bg-bg-surfaceAlt text-fg-body border border-stroke-hairline",
  info:    "bg-status-infoBg    text-status-infoFg    border border-status-infoBorder",
  success: "bg-status-successBg text-status-successFg border border-status-successBorder",
  warning: "bg-status-warningBg text-status-warningFg border border-status-warningBorder",
  error:   "bg-status-errorBg   text-status-errorFg   border border-status-errorBorder",
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  status?: Status;
}

export function Badge({ status = "neutral", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full",
        "font-sans text-body-s font-medium leading-[1.5]",
        styles[status],
        className,
      )}
      {...rest}
    />
  );
}
```

---

## Modal / Dialog

Scrim is the `scrim` alias — `Grey Alpha 500` on light, `rgba(0,0,0,0.72)` on dark. Never raw black. Modal shadow is `shadow-modal`, which is heavier on dark for separation.

```tsx
// components/ui/dialog.tsx (simplified shell — wire to Radix or Headless UI in real code)
export function DialogShell({
  open, onClose, children, title,
}: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-scrim"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-surface rounded-2xl max-w-md w-[calc(100%-32px)] p-6 font-sans shadow-modal"
      >
        <h2 id="dlg-title" className="text-h4 font-semibold text-fg-primary">
          {title}
        </h2>
        <div className="mt-3 text-body-m text-fg-secondary">{children}</div>
      </div>
    </div>
  );
}
```

---

## Section eyebrow (Body S Uppercase)

```tsx
<p className="font-sans text-body-s font-medium text-fg-link uppercase tracking-normal">
  What we do
</p>
<h2 className="font-sans text-h2 font-semibold text-fg-primary">
  Designed for clarity
</h2>
```

---

## Form example — putting it together

```tsx
<form className="bg-bg-surface rounded-xl p-6 max-w-md w-full font-sans border border-stroke-hairline shadow-card">
  <h2 className="text-h3 font-semibold text-fg-primary mb-1">Create your account</h2>
  <p className="text-body-m text-fg-secondary mb-6">
    Use your work email to get started.
  </p>

  <div className="flex flex-col gap-4">
    <Input label="Full name" placeholder="Jane Cooper" />
    <Input label="Work email" type="email" placeholder="jane@example.com" />
    <Input
      label="Password"
      type="password"
      hint="Must be at least 8 characters."
    />
  </div>

  <Button className="w-full mt-6">Create account</Button>

  <p className="text-caption-m text-fg-tertiary mt-4 text-center">
    By continuing you agree to our <a className="text-fg-link hover:text-fg-linkHover">Terms</a>.
  </p>
</form>
```

---

## Theme Toggle

A 3-option segmented control (System / Light / Dark). Persists to `localStorage` as `opera-theme`. Pairs with the `ThemeProvider` + flash-prevention `<script>` from [`tokens.md`](tokens.md#8-theme-provider--flash-prevention) §8.

```tsx
// components/ui/theme-toggle.tsx — full source is in tokens.md §8.3
"use client";
import { useTheme } from "@/design-system/theme-provider";

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

Drop it in your top nav next to the user avatar. That's the entire theme-toggle UX.

---

## Image and illustration handling under dark mode

Different image types call for different strategies:

```tsx
// 1. Brand wordmark — swap the source per scheme.
//    Either a <picture> (CSS-only) or React (theme-aware).

// CSS-only (works without JS, picks via prefers-color-scheme):
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="/assets/opera/wordmark/symphony-wordmark-white-200w.png 1x,
            /assets/opera/wordmark/symphony-wordmark-white-400w.png 2x"
  />
  <img
    src="/assets/opera/wordmark/symphony-wordmark-purple-200w.png"
    srcset="/assets/opera/wordmark/symphony-wordmark-purple-400w.png 2x"
    alt="Symphony"
    height="40"
  />
</picture>

// React (matches the user's opera-theme preference, not OS):
import { useTheme } from "@/design-system/theme-provider";
function Wordmark() {
  const { resolved } = useTheme();
  const src = resolved === "dark"
    ? "/assets/opera/wordmark/symphony-wordmark-white-400w.png"
    : "/assets/opera/wordmark/symphony-wordmark-purple-400w.png";
  return <img src={src} alt="Symphony" height={40} />;
}

// 2. Decorative illustrations — ship a dark variant.
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/illustrations/empty-state-dark.svg" />
  <img src="/illustrations/empty-state.svg" alt="" />
</picture>

// 3. Inline SVG icons — use currentColor + parent text class. No swap needed.
<svg className="w-5 h-5 text-fg-secondary" viewBox="0 0 24 24" fill="currentColor">
  <path d="..." />
</svg>

// 4. Photographs — leave them, no overlay or filter.
<img src="/team.jpg" alt="The team" className="rounded-lg" />

// 5. Screenshots of light UI shown inside a dark page — wrap in a border ring
//    to avoid the bright glow effect against the dark surface.
<img
  src="/screenshots/dashboard.png"
  alt="Dashboard screenshot"
  className="rounded-lg border border-stroke-default"
/>
```

---

## Don't do this

```tsx
// ❌ Wrong — raw hex, wrong font, wrong weight, wrong line-height
<button style={{
  backgroundColor: "#7B68EE",
  color: "white",
  fontFamily: "Inter, sans-serif",
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1.2,
}}>
  Submit
</button>

// ✅ Right — tokens, Poppins, weight 600, lh 1.5
<Button variant="primary" size="md">Submit</Button>

// ❌ Wrong — raw scale classes break dark mode (white stays white under .dark)
<div className="bg-white text-grey-900 border-grey-200">…</div>

// ✅ Right — semantic aliases flip with .dark for free
<div className="bg-bg-surface text-fg-primary border-stroke-hairline">…</div>

// ❌ Wrong — implementing dark mode by inverting everything
<html style={{ filter: "invert(1) hue-rotate(180deg)" }}>…</html>

// ✅ Right — toggle .dark on <html> and let the aliases swap
document.documentElement.classList.toggle("dark");

// ❌ Wrong — hard-coding the scrim
<div style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>…</div>

// ✅ Right — reference the scrim alias
<div className="bg-bg-scrim">…</div>

// ❌ Wrong — Primary 100 background is near-white, invisible on dark
<div className="bg-primary-100 text-primary-800">Selected</div>

// ✅ Right — alias resolves to alpha on dark
<div className="bg-bg-primaryTint text-fg-primaryTint">Selected</div>
```
