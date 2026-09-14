# Design System — V4

## Visual concept

**Neon Bento / Research Developer Dashboard**

The profile should look like a product dashboard, not a badge collection. The visual system is intentionally restrained: high contrast, dark navy surfaces, indigo-violet accents, cyan/green signals, and compact data cards.

## Color tokens

### Dark

| Token | Value |
|---|---|
| Background | `#070B14` |
| Panel | `#0D1422` |
| Secondary panel | `#111B2C` |
| Border | `#22304A` |
| Text | `#F8FAFC` |
| Muted | `#9BA8C0` |
| Indigo | `#6366F1` |
| Violet | `#8B5CF6` |
| Cyan | `#22D3EE` |
| Green | `#34D399` |

### Light

| Token | Value |
|---|---|
| Background | `#F8FAFC` |
| Panel | `#FFFFFF` |
| Secondary panel | `#F1F5F9` |
| Border | `#CBD5E1` |
| Text | `#0F172A` |
| Muted | `#64748B` |
| Indigo | `#4F46E5` |
| Violet | `#7C3AED` |

## Layout

The README hierarchy is:

1. Hero
2. About Me
3. GitHub Dashboard
4. Tech Stack & Interests
5. Featured Projects
6. Currently Exploring
7. Connect / Support
8. Footer

The dashboard follows a bento rhythm:

- overview + language signal side-by-side on desktop
- contribution calendar full width
- developer signal full width
- tech stack and projects as wide visual panels

## Typography

SVGs use a portable font stack instead of embedding font files:

```text
Inter, Segoe UI, Arial, sans-serif
```

Code / terminal labels use:

```text
ui-monospace, SFMono-Regular, Consolas, monospace
```

No custom font files are required.

## SVG rules

- Every visual is committed locally.
- Every major visual has a dark and light variant.
- Remote image URLs are forbidden by `scripts/validate.mjs`.
- SVGs use text and simple vectors only.
- Generated stats are written to `assets/generated/`.
- Static design elements are written to `assets/static/`.
