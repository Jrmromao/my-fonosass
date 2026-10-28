# Almanaque da Fala — Design System

## CRITICAL: Read this before writing ANY UI code.

---

## Colors

The brand color is **coral** (warm salmon-red), implemented as a full ramp in
`app/globals.css` (`--coral-50` … `--coral-900`) and exposed in Tailwind as
`coral-50` … `coral-900`. The neutral family is a single navy-tinted ramp
(`neutral-50` … `neutral-900`). **Never hardcode a hex** (e.g. `bg-[#f97066]`) and
**never mix `gray-*` and `slate-*`** — always use the `coral-*` / `neutral-*` tokens.

| Token | Value | Usage |
|-------|-------|-------|
| Primary (brand) | `coral-500` | Buttons, links, active states, accents |
| Primary hover | `coral-600` | Button / link hover |
| Primary tint | `coral-50` / `coral-500/10` | Icon chips, subtle highlights |
| Text | `neutral-900` | Headings, primary text |
| Text secondary | `neutral-500` | Descriptions, metadata |
| Text muted | `neutral-400` | Timestamps, hints |
| Background | `white` | Page background |
| Background alt | `neutral-50` | Alternating sections |
| Border | `neutral-100` / `neutral-200` | Section dividers, card borders |
| Dark section bg | `neutral-900` | Hero-contrast bands, dashboard sidebar |
| Brand gradient | `bg-brand-gradient` | Hero band ONLY (controlled, Stripe-style) |

### Forbidden colors
- ❌ NO hardcoded hex values in classes (`bg-[#...]`) — use `coral-*` / `neutral-*`
- ❌ NO mixing `gray-*` and `slate-*` — the neutral family is `neutral-*`
- ❌ NO pink, fuchsia, cyan, yellow, indigo, purple as UI colors
- ❌ NO multi-color gradients on text
- ❌ NO `bg-gradient-to-*` on backgrounds (exception: `bg-brand-gradient` in the hero only)
- ✅ Balloons are the ONLY place where multiple bright colors appear
- ✅ Semantic status colors allowed: green (success), red/`destructive` (error), amber (warning)

---

## Typography

Type scale is defined in `tailwind.config.js` (sizes carry tuned line-height and
negative letter-spacing on larger sizes). Use the standard Tailwind size classes.

| Element | Classes |
|---------|---------|
| Page title (h1) | `text-3xl md:text-4xl font-bold text-neutral-900 font-display` |
| Hero title | `text-4xl md:text-5xl font-bold text-neutral-900 font-display` |
| Section title (h2) | `text-2xl font-bold text-neutral-900 font-display` |
| Card title (h3) | `text-base font-semibold text-neutral-900` |
| Eyebrow / label | `text-xs text-coral-600 font-medium uppercase tracking-wide` |
| Body text | `text-sm text-neutral-600` or `text-base text-neutral-600` |
| Small/meta | `text-xs text-neutral-400` |
| Dashboard page title | `text-xl font-semibold text-neutral-900 font-display` |

### Font families
- `font-display` = Nunito (headings only)
- `font-sans` = Inter (body, UI)

---

## Buttons

| Type | Classes |
|------|---------|
| Primary | `bg-coral-500 text-white text-sm font-medium hover:bg-coral-600` + radius |
| Secondary | `border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50` + radius |
| Ghost | `text-sm font-medium text-neutral-600 hover:text-neutral-900` |
| Danger | `text-sm text-destructive hover:bg-destructive/10` |

### Button rules
- Landing page: `rounded-md` (Linear/Stripe-style), dashboard: `rounded-lg`
- Always add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2`
- Never use `shadow-lg` or `shadow-xl` on buttons
- Never use gradient backgrounds on buttons (gradient is hero-band only)

---

## Layout

### Landing page
- Max width: `max-w-5xl` or `max-w-6xl`
- Section padding: `py-16`
- Section dividers: `border-t border-neutral-100`
- Background alternation: white → neutral-50 → white (dark bands use `neutral-900`)

### Dashboard
- Sidebar: fixed, `w-56` expanded / `w-16` collapsed, `bg-neutral-900`
- Page header: white bg, `border-b border-neutral-100`, `px-8 py-6`
- Content area: `p-8`, `bg-neutral-50`
- Cards: `bg-white border border-neutral-200 rounded-xl`

---

## Components

### Cards
```
bg-white border border-neutral-200 rounded-xl p-6
```
- NO `shadow-xl`, only `shadow-sm` if needed on hover
- NO gradient backgrounds inside cards

### Tabs (dashboard)
```
TabsList: inline-flex bg-white border border-neutral-200 p-1 rounded-lg shadow-sm
TabsTrigger: px-4 py-2 text-sm rounded-md data-[state=active]:bg-coral-50 data-[state=active]:text-coral-700
```

### Badges/Tags
```
px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs
```
- NO colored badges unless semantic (green=success, red=error, amber=warning)

### Form inputs
- Use existing shadcn/ui components
- Add `bg-white border-neutral-200` when on neutral backgrounds

---

## Anti-patterns (NEVER do these)

1. ❌ Gradient text (`bg-clip-text text-transparent bg-gradient-to-r`)
2. ❌ Floating decorative shapes (circles, squares, blobs)
3. ❌ `blur-3xl` decorative elements
4. ❌ Pink-to-yellow gradients
5. ❌ Avatar circles with gradient backgrounds
6. ❌ Oversized hero sections (keep h1 at `text-3xl md:text-4xl` max)
7. ❌ "Junte-se a milhares" or fake social proof
8. ❌ Generic AI copy ("transforme", "revolucione", "potencialize")
9. ❌ More than 2 font weights visible at once in a section
10. ❌ Shadows larger than `shadow-sm`

---

## Voice & Copy

- Language: Brazilian Portuguese (pt-BR)
- Tone: Professional but warm. Direct. No fluff.
- Target: Speech therapists (fonoaudiólogos) who work with kids
- Never mention AI to end users
- Never use fake testimonials or inflated numbers
- CTAs should be specific: "Baixar atividade", "Criar conta", not "Saiba mais"

---

## File naming
- Components: PascalCase (`ActivityReviewPanel.tsx`)
- Pages: lowercase with hyphens (Next.js convention)
- Utilities: camelCase (`generateContent.ts`)
