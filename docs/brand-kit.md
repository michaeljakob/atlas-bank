# Atlas Branding Kit

The official Atlas brand palette. This is the single source of truth.

- **Tokens (code):** `apps/web/src/lib/brand.ts`
- **Tailwind:** `apps/web/tailwind.config.ts` (`atlas.*` colors)
- **CSS variables:** `apps/web/src/app/globals.css` (`--atlas-*`)
- **Visual reference:** run the web app and open [`/brand`](http://localhost:3000/brand)

When changing a brand color, update `brand.ts` and keep the Tailwind config and CSS
variables in sync.

## Core palette

| Name        | Hex       | RGB             | Pantone            | Usage                                            |
| ----------- | --------- | --------------- | ------------------ | ------------------------------------------------ |
| Robin Neon  | `#CCFF00` | 204, 255, 0     | PMS 380 C          | Primary brand. CTAs, highlights, key accents.    |
| Robin Black | `#1C180D` | 28, 24, 13      | PMS Black 2 C      | Primary text and dark surfaces (nav, footers).   |
| UI Green    | `#5AC53A` | 90, 197, 58     | —                  | Positive states, success, charts, money-in.      |
| Heather #1  | `#8A8783` | 138, 135, 131   | PMS Warm Gray 8 C  | Icons, captions, muted UI.                        |
| Heather #2  | `#B4B1AB` | 180, 177, 171   | PMS Warm Gray 4 C  | Borders, dividers, disabled states.               |
| Heather #3  | `#D4D0C9` | 212, 208, 201   | PMS Warm Gray 1 C/U | Subtle backgrounds, surfaces, fills.             |

## Tailwind usage

```html
<!-- Brand -->
<div class="bg-atlas-neon text-atlas-black">Neon</div>
<div class="bg-atlas-black text-white">Robin Black</div>

<!-- Accent (Robin Neon) scale: 50,100,200,400,500,600,700 -->
<button class="bg-atlas-accent text-atlas-black">CTA</button>

<!-- UI Green scale: 50–800 -->
<span class="text-atlas-green-700">+€3,200</span>

<!-- Heather warm-grays: 50–700 -->
<p class="text-atlas-text-secondary">Muted copy</p>
<div class="border border-atlas-border">Card</div>
```

## Semantic roles

| Role                | Value                       | Token                       |
| ------------------- | --------------------------- | --------------------------- |
| Background          | `#FFFFFF`                   | `bg-atlas-bg`               |
| Background (subtle) | `#F5F3F0` (Heather 50)      | `bg-atlas-bg-subtle`        |
| Text (primary)      | `#1C180D` (Robin Black)     | `text-atlas-text-primary`   |
| Text (secondary)    | `#6F6C68` (Heather 500)     | `text-atlas-text-secondary` |
| Border              | `#E4E1DB`                   | `border-atlas-border`       |
| Accent              | `#CCFF00` (Robin Neon)      | `bg-atlas-accent`           |
| Success / positive  | `#5AC53A` (UI Green)        | `text-atlas-green-*`        |
| Dark surface        | `#1C180D` (Robin Black)     | `bg-atlas-dark-surface`     |

## Principles

- **Neon is a spotlight, not a wash.** Use Robin Neon for the single most
  important action on a screen, not large fills.
- **Warm neutrals only.** Use the Heather grays — avoid cool/blue grays.
- **Green means money & success.** Reserve UI Green for positive financial
  states and charts.
- **Text on Neon is always Robin Black** (never white) for contrast.
