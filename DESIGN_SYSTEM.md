# Almanaque da Fala — Design System

## CRITICAL: Read this before writing ANY UI code.

This file is the single source of truth for UI decisions. `.kiro/design-system.md`
and the brand section of `.kiro/rules.md` point here. If they ever disagree, this
file wins; update it instead of working around it.

---

## Philosophy

Professional warmth. Like a well-designed pediatric clinic: clean, trustworthy,
not cold. The activities are colorful and playful; the platform around them is
restrained so the material stands out.

### Differentiation from FonoClub (direct competitor)

| FonoClub | Almanaque da Fala |
|----------|-------------------|
| "Ecossistema": clinic management, prontuário, AI assistant | Only activities: good, organized by phoneme, ready to print |
| Several plans, add-ons, AI credits | One plan, no credits, no add-ons |
| Deep purple brand (#523A8C) | Light lavender background, navy text, coral accent |
| Flat phoneme filter | Clinical taxonomy (voiceless/voiced pairs, R variants) |
| Markets AI openly | Never mentions AI; materials "criados por fonoaudióloga" |

---

## Colors

The brand accent is **coral** (warm salmon-red), implemented as a full ramp in
`app/globals.css` (`--coral-50` … `--coral-900`) and exposed in Tailwind as
`coral-50` … `coral-900`. The neutral family is a single navy-tinted ramp
(`neutral-50` … `neutral-900`). **Never hardcode a hex** (e.g. `bg-[#f97066]`) and
**never use `gray-*` or `slate-*`**: always use the `coral-*` / `neutral-*` tokens.

| Token | Value | Usage |
|-------|-------|-------|
| Accent (fills behind white text) | `coral-700`, hover `coral-800` | Primary CTA, "Grátis" badge |
| Accent (text on light backgrounds) | `coral-800` | Inline highlights such as the free phoneme |
| Accent tint | `coral-50` / `coral-100` | Highlighted tile backgrounds |
| Text | `neutral-900` | Primary text (app, dashboard) |
| Heading ink (landing) | `violet-950` | Landing page text and headings, from the logo's dark purple |
| Text secondary | `neutral-600` | Body, descriptions, metadata |
| Text disabled | `neutral-400` | Disabled/unavailable items only ("Em breve") |
| Dark button | `neutral-900`, hover `neutral-800` | Secondary primary action (navbar "Assinar", plan CTA) |
| Background (app, dashboard) | `white` | Page background |
| Background alt (app, dashboard) | `neutral-50` | Alternating sections |
| Background (landing page) | `violet-100` | Landing page body and navbar |
| Background alt (landing page) | `violet-50` | Alternating landing sections |
| Landing section divider | `border-violet-200` | Top border of alternating landing sections |
| Border | `neutral-100` / `neutral-200` | Card borders, dividers |
| Dark section bg | `neutral-900` | Dashboard sidebar |

### Why coral-700 and not coral-500 for fills
White text on `coral-500` is 2.8:1 and fails WCAG AA (4.5:1). `coral-700` is
4.9:1. Use `coral-500` only for non-text decoration (rings, borders, dots).

### Text contrast (WCAG AA, mandatory)
- Normal text needs **4.5:1**, large text (24px+, or 18.66px+ bold) and icons **3:1**.
- Use **two greys** for text: `neutral-900` and `neutral-600`. `neutral-400` is
  allowed only for disabled items; never for readable copy.
- Decorative text inside `aria-hidden` elements (e.g. the watermark on hero sheets)
  is exempt.

### Lavender scope
`violet-*` is allowed **only as a landing-page background** (`violet-100`, `violet-50`,
`border-violet-200`) and `violet-950` as the landing page ink. Do not use violet
for buttons, links, badges or dashboard UI. Use the navbar `tone="lavender"` prop on
pages with the lavender background so the header matches.

### Forbidden colors
- ❌ NO hardcoded hex values in classes (`bg-[#...]`): use tokens
- ❌ NO `gray-*` or `slate-*`: the neutral family is `neutral-*`
- ❌ NO pink, fuchsia, cyan, yellow or indigo as UI colors; violet and sky only as described in their scope sections
- ❌ NO multi-color gradients on text
- ❌ NO `bg-gradient-to-*` on backgrounds (exception: `bg-brand-gradient` in the hero only)
- ✅ Activity sheets and balloons are the ONLY places where multiple bright colors appear
- ✅ Semantic status colors allowed: green (success), red/`destructive` (error), amber (warning)

---

## Typography

Type scale is defined in `tailwind.config.js` (sizes carry tuned line-height and
negative letter-spacing on larger sizes). Use the standard Tailwind size classes.

| Element | Classes |
|---------|---------|
| Landing hero title | `font-display text-[2.1rem] md:text-[3.25rem] font-bold leading-[1.08]` (3 lines desktop, 4 mobile) |
| Page title (h1) | `text-3xl md:text-4xl font-bold text-neutral-900 font-display` |
| Section title (h2) | `text-2xl` to `text-3xl font-bold text-neutral-900 font-display` |
| Card title (h3) | `text-base font-semibold text-neutral-900` |
| Quote / pull text | `font-display text-2xl md:text-[1.7rem] font-semibold leading-snug` |
| Eyebrow / label | `text-sm font-medium text-neutral-600` |
| Body text | `text-sm` or `text-base text-neutral-600` |
| Small/meta | `text-xs text-neutral-600` |
| Dashboard page title | `text-xl font-semibold text-neutral-900 font-display` |
| Phoneme notation | `font-mono` (e.g. `/s/`), lowercase between slashes |

### Rules
- Hero headline: weight **700**, no `tracking-tight`. Nunito is rounded; tight
  tracking at 800 makes letters collide.
- Keep the hero headline to **3 lines on desktop**. Adjust size or column width,
  not letter-spacing.
- Quotes in someone's voice use typographic quotes (`&ldquo;` / `&rdquo;`) inside
  `<blockquote>` with a `<figcaption>` attribution.

### Font families
- `font-display` = Nunito (headings only)
- `font-sans` = Inter (body, UI)
- `font-mono` = phoneme notation only (/P/, /R/…); never for credentials or numbers

---

## Buttons

| Type | Classes |
|------|---------|
| Primary (accent) | `bg-coral-700 text-white text-sm font-semibold hover:bg-coral-800` + radius |
| Primary (dark) | `bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800` + radius |
| Secondary | `border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50` + radius |
| Text link CTA | `text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4` |
| Ghost | `text-sm font-medium text-neutral-600 hover:text-neutral-900` |
| Danger | `text-sm text-destructive hover:bg-destructive/10` |

### Button rules
- **One accent (coral) action per visible screen.** Other actions use the dark or
  secondary style.
- Landing page: `rounded-md` (Linear/Stripe-style), dashboard: `rounded-lg`
- Always add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2`
- Never use `shadow-lg` or `shadow-xl` on buttons
- Never use gradient backgrounds on buttons

---

## Layout

### Landing page
- Max width: `max-w-6xl` (content), `max-w-3xl` / `max-w-4xl` (quote, FAQ, pricing)
- Section padding: `py-20`
- Background alternation: `violet-100` → `violet-50` (with `border-t border-violet-200`) → `violet-100`
- Server component by default; client components only for interactive parts (modal)
- No scroll animations (framer-motion) on the landing page

### Dashboard
- Sidebar: fixed, `w-56` expanded / `w-16` collapsed, `bg-neutral-900`
- Page header: white bg, `border-b border-neutral-100`, `px-8 py-6`
- Content area: `p-8`, `bg-neutral-50`
- Cards: `bg-white border border-neutral-200 rounded-xl`

### Spacing
- Card gap: `gap-4`
- Element spacing within cards: `space-y-4`

---

## Components

### Cards
```
bg-white border border-neutral-200 rounded-xl p-6
```
- Cards are always white, also on lavender backgrounds
- NO `shadow-xl`, only `shadow-sm` if needed on hover
- NO gradient backgrounds inside cards

### Paper sheets (landing hero only)
Activity sheets in the hero imitate printed paper on a table: white, `rounded-sm`,
slight rotation, and a soft layered shadow
(`shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.18)]`).
This is the **only** exception to the `shadow-sm` rule. Prefer real activity images
over drawn placeholders.

### Phoneme library (landing)
- Taxonomy lives in `lib/phonemes.ts` (`PHONEME_GROUPS`, `LANGUAGE_TOPICS`), defined with Eliane Mota. Rendered by `components/landing/PhonemeLibrary.tsx`.
- Groups, in order: **Pares surdo e sonoro** (p/b, t/d, f/v, k/g, ch/j, s/z, shown as joined pairs), **Nasais, laterais e vibrantes** (m, n, l, lh, R forte, r fraco — the R is split per Eliane, codes `R_FORTE` / `R_FRACO`; legacy `R` activities show as an extra "/r/ forte e fraco" tile until reclassified), **Arquifonema e encontro consonantal** (r and l), and **Linguagem** (cores, animais, alimentos, números), which is a separate topic counted by activity type, not phoneme.
- Group heading: `font-display text-lg font-bold` with a one-line `text-sm text-neutral-600` description.
- Always show every entry; phonemes in the DB but not in the taxonomy are appended to the second group so nothing published is hidden.
- Each entry is a **word card** (`components/landing/PhonemeLibrary.tsx`, `ExampleWord.tsx`): phoneme small at the top (`font-mono text-base`) with the count or "Em breve" on the right, and an example word below (`font-display text-2xl font-bold`) with the target sound underlined (`decoration-[3px]`). Example words live in `lib/phonemes.ts` as `'[p]ato'`, to be confirmed by Eliane.
- Cards are separate (`rounded-lg`, `gap-2`; pairs `gap-1.5`).
- Available card (Eliane's choice): `bg-sky-100` with `border-2 border-sky-300`, coral underline (`decoration-coral-500`), hover `bg-neutral-900` with white text. **Sky is allowed only for library cards**; never for text, buttons or badges.
- Unavailable card: `bg-white` with `border-neutral-200`, label, word and "Em breve" in `text-neutral-400`, grey underline, not clickable. So blue means "ready to download".
- Free phoneme (`FREE_PHONEME` in `lib/pricing.ts`): `bg-coral-50`, `ring-2 ring-inset ring-coral-500`, "Grátis" badge (`bg-coral-700 text-white`), opens the preview modal. Only promoted when it has published activities.
- Headline quotes counts only above `MIN_ACTIVITIES_TO_SHOW_COUNT`; below that it talks about the catalog in general

### Tabs (dashboard)
```
TabsList: inline-flex bg-white border border-neutral-200 p-1 rounded-lg shadow-sm
TabsTrigger: px-4 py-2 text-sm rounded-md data-[state=active]:bg-coral-50 data-[state=active]:text-coral-800
```

### Tables (Vercel-style)
```
No card wrapper. Just rows with border-b border-neutral-100.
Header: text-xs uppercase tracking-wider text-neutral-600
Rows: hover:bg-neutral-50 cursor-pointer
```

### Badges/Tags
```
px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs
Phoneme badge: font-mono text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded
```
- NO colored badges unless semantic (green=success, red=error, amber=warning) or the "Grátis" badge

### Form inputs
- Use existing shadcn/ui components
- `h-9 border-neutral-200 rounded-md text-sm`, focus `ring-2 ring-coral-500/20 border-coral-500`
- Add `bg-white` when on neutral or lavender backgrounds

### Founder / author block
- Circular photo `h-24 w-24 rounded-full object-cover`, real photo only
- Name `font-semibold`, then role and CRFa on one line in `text-sm text-neutral-600`
- Placeholder (until a photo exists): dashed circle labelled "Foto"

---

## Anti-patterns (NEVER do these)

1. ❌ Gradient text (`bg-clip-text text-transparent bg-gradient-to-r`)
2. ❌ Floating decorative shapes (circles, squares, blobs)
3. ❌ `blur-3xl` decorative elements
4. ❌ Pink-to-yellow gradients
5. ❌ Avatar circles with gradient backgrounds or initials standing in for a real person
6. ❌ Oversized hero sections (landing hero follows the size above; other pages `text-3xl md:text-4xl` max)
7. ❌ "Junte-se a milhares" or fake social proof
8. ❌ Generic AI copy ("transforme", "revolucione", "potencialize", "otimize")
9. ❌ More than 2 font weights visible at once in a section
10. ❌ Shadows larger than `shadow-sm` (exception: hero paper sheets)
11. ❌ Stats strips with hardcoded numbers, icon-in-a-square feature cards, small eyebrow label above every section
12. ❌ Placeholder content shown to users as if it were real (use "Em breve" instead)

---

## Voice & Copy

- Language: Brazilian Portuguese (pt-BR)
- Tone: Professional but warm. Direct. No fluff.
- Target: Speech therapists (fonoaudiólogos) who work with kids
- Never mention AI to end users
- Never use fake testimonials or inflated numbers; quotes must be the person's own words
- CTAs should be specific: "Ver planos", "Criar conta e baixar grátis", not "Saiba mais"

---

## File naming
- Components: PascalCase (`ActivityReviewPanel.tsx`)
- Pages: lowercase with hyphens (Next.js convention)
- Utilities: camelCase (`generateContent.ts`)
