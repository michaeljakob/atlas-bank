# Auriga Branding Kit

The official Auriga brand palette. This is the single source of truth.

- **Tokens (code):** `apps/web/src/lib/brand.ts`
- **Tailwind:** `apps/web/tailwind.config.ts` (`auriga.*` colors)
- **CSS variables:** `apps/web/src/app/globals.css` (`--auriga-*`)
- **Visual reference:** run the web app and open [`/brand`](http://localhost:3000/brand)

When changing a brand color, update `brand.ts` and keep the Tailwind config and CSS
variables in sync.

## Core palette

| Name        | Hex       | RGB             | Pantone            | Usage                                            |
| ----------- | --------- | --------------- | ------------------ | ------------------------------------------------ |
| Auriga Neon  | `#CCFF00` | 204, 255, 0     | PMS 380 C          | Primary brand. CTAs, highlights, key accents.    |
| Auriga Black | `#1C180D` | 28, 24, 13      | PMS Black 2 C      | Primary text and dark surfaces (nav, footers).   |
| UI Green    | `#5AC53A` | 90, 197, 58     | —                  | Positive states, success, charts, money-in.      |
| Heather #1  | `#8A8783` | 138, 135, 131   | PMS Warm Gray 8 C  | Icons, captions, muted UI.                        |
| Heather #2  | `#B4B1AB` | 180, 177, 171   | PMS Warm Gray 4 C  | Borders, dividers, disabled states.               |
| Heather #3  | `#D4D0C9` | 212, 208, 201   | PMS Warm Gray 1 C/U | Subtle backgrounds, surfaces, fills.             |

## Tailwind usage

```html
<!-- Brand -->
<div class="bg-auriga-neon text-auriga-black">Neon</div>
<div class="bg-auriga-black text-white">Auriga Black</div>

<!-- Accent (Auriga Neon) scale: 50,100,200,400,500,600,700 -->
<button class="bg-auriga-accent text-auriga-black">CTA</button>

<!-- UI Green scale: 50–800 -->
<span class="text-auriga-green-700">+€3,200</span>

<!-- Heather warm-grays: 50–700 -->
<p class="text-auriga-text-secondary">Muted copy</p>
<div class="border border-auriga-border">Card</div>
```

## Semantic roles

| Role                | Value                       | Token                       |
| ------------------- | --------------------------- | --------------------------- |
| Background          | `#FFFFFF`                   | `bg-auriga-bg`               |
| Background (subtle) | `#F5F3F0` (Heather 50)      | `bg-auriga-bg-subtle`        |
| Text (primary)      | `#1C180D` (Auriga Black)     | `text-auriga-text-primary`   |
| Text (secondary)    | `#6F6C68` (Heather 500)     | `text-auriga-text-secondary` |
| Border              | `#E4E1DB`                   | `border-auriga-border`       |
| Accent              | `#CCFF00` (Auriga Neon)      | `bg-auriga-accent`           |
| Success / positive  | `#5AC53A` (UI Green)        | `text-auriga-green-*`        |
| Dark surface        | `#1C180D` (Auriga Black)     | `bg-auriga-dark-surface`     |

## Principles

- **Neon is a spotlight, not a wash.** Use Auriga Neon for the single most
  important action on a screen, not large fills.
- **Warm neutrals only.** Use the Heather grays — avoid cool/blue grays.
- **Green means money & success.** Reserve UI Green for positive financial
  states and charts.
- **Text on Neon is always Auriga Black** (never white) for contrast.
