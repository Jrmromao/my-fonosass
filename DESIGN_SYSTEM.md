# Almanaque da Fala — Design System

## CRITICAL: Read this before writing ANY UI code.

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `orange-500` | Buttons, links, active states |
| Primary hover | `orange-600` | Button hover |
| Text | `gray-900` | Headings, primary text |
| Text secondary | `gray-500` | Descriptions, metadata |
| Text muted | `gray-400` | Timestamps, hints |
| Background | `white` | Page background |
| Background alt | `gray-50` | Alternating sections |
| Border | `gray-100` | Section dividers, card borders |
| Sidebar bg | `gray-900` | Dashboard sidebar |
| Sidebar text | `gray-400` | Sidebar inactive items |
| Sidebar active | `white` with `white/10` bg | Sidebar active item |

### Forbidden colors
- ❌ NO pink, fuchsia, cyan, yellow as UI colors
- ❌ NO indigo/purple as primary (competitor uses it)
- ❌ NO multi-color gradients on text
- ❌ NO `bg-gradient-to-*` on backgrounds (exception: very subtle `from-white to-gray-50`)
- ✅ Balloons are the ONLY place where multiple bright colors appear

---

## Typography

| Element | Classes |
|---------|---------|
| Page title (h1) | `text-3xl md:text-4xl font-extrabold text-gray-900 font-display` |
| Section title (h2) | `text-xl font-bold text-gray-900 font-display` |
| Card title (h3) | `text-base font-semibold text-gray-900` |
| Body text | `text-sm text-gray-600` or `text-base text-gray-600` |
| Small/meta | `text-xs text-gray-400` |
| Dashboard page title | `text-xl font-semibold text-gray-900 font-display` |

### Font families
- `font-display` = Nunito (headings only)
- `font-sans` = Inter (body, UI)

---

## Buttons

| Type | Classes |
|------|---------|
| Primary | `px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600` |
| Secondary | `px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50` |
| Ghost | `text-sm font-medium text-gray-600 hover:text-gray-900` |
| Danger | `text-sm text-red-600 hover:bg-red-50` |

### Button rules
- Always `rounded-full` on landing page
- Always `rounded-lg` in dashboard
- Never use `shadow-lg` or `shadow-xl` on buttons
- Never use gradient backgrounds on buttons

---

## Layout

### Landing page
- Max width: `max-w-5xl` or `max-w-6xl`
- Section padding: `py-16`
- Section dividers: `border-t border-gray-100`
- Background alternation: white → gray-50 → white

### Dashboard
- Sidebar: fixed, `w-56` expanded / `w-16` collapsed, `bg-gray-900`
- Page header: white bg, `border-b border-gray-100`, `px-8 py-6`
- Content area: `p-8`, `bg-gray-50`
- Cards: `bg-white border border-gray-200 rounded-xl`

---

## Components

### Cards
```
bg-white border border-gray-200 rounded-xl p-6
```
- NO `shadow-xl`, only `shadow-sm` if needed on hover
- NO gradient backgrounds inside cards

### Tabs (dashboard)
```
TabsList: inline-flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm
TabsTrigger: px-4 py-2 text-sm rounded-md data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700
```

### Badges/Tags
```
px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs
```
- NO colored badges unless semantic (green=success, red=error, amber=warning)

### Form inputs
- Use existing shadcn/ui components
- Add `bg-white border-gray-200` when on gray backgrounds

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
