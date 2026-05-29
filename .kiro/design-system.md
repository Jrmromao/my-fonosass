# Almanaque da Fala — Design System

## Philosophy

Professional warmth. Like a well-designed pediatric clinic — clean, trustworthy, but not cold.
The balloons are the brand's personality. Everything else is restrained to let them shine.

## Differentiation from FonoClub

| FonoClub | Almanaque da Fala |
|----------|-------------------|
| Green/teal primary | Navy + coral accent |
| WordPress/generic | Custom, minimal |
| Emojis in headers | Zero emojis |
| Rounded, playful everything | Sharp content, playful only in balloons |
| Stock photo feel | Interactive balloon demo |
| "ASSINE AGORA" aggressive | Calm, confident CTAs |

## Colors

### Primary Palette
```
--navy: #1e293b (slate-800) — headings, primary text, buttons
--coral: #f97066 — accent, CTAs, active states, links
--coral-light: #fef2f2 — subtle backgrounds, hover states
```

### Neutral Palette
```
--white: #ffffff — page backgrounds
--gray-50: #f8fafc — alternating sections, card backgrounds
--gray-100: #f1f5f9 — borders, dividers
--gray-200: #e2e8f0 — input borders
--gray-500: #64748b — secondary text, metadata
--gray-900: #0f172a — primary text
```

### Status Colors (used sparingly)
```
--success: #059669 (emerald-600)
--warning: #d97706 (amber-600)
--error: #dc2626 (red-600)
```

### Balloon Colors (ONLY in balloon components)
```
#6366f1, #ec4899, #f59e0b, #10b981, #8b5cf6, #06b6d4, #f97316
```

## Typography

### Font Stack
- **Headings:** Nunito (font-display) — rounded, friendly, professional
- **Body:** Inter (font-sans) — clean, readable, neutral
- **Monospace:** JetBrains Mono — phoneme notation, data

### Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Page title | text-2xl (24px) | font-bold | Nunito |
| Section heading | text-xl (20px) | font-semibold | Nunito |
| Card title | text-base (16px) | font-semibold | Inter |
| Body | text-sm (14px) | font-normal | Inter |
| Caption/meta | text-xs (12px) | font-medium | Inter |
| Phoneme notation | text-sm | font-mono | JetBrains Mono |

## Components

### Buttons
```
Primary: bg-slate-900 text-white hover:bg-slate-800 — confident, not flashy
Secondary: border border-gray-200 text-gray-700 hover:bg-gray-50
Accent: bg-coral text-white hover:bg-coral/90 — used sparingly (1 per page max)
Ghost: text-gray-500 hover:text-gray-900 hover:bg-gray-50
```

### Cards
```
bg-white border border-gray-100 rounded-lg
Hover: hover:border-gray-200 hover:shadow-sm transition-all duration-150
No shadow by default. Shadow only on hover.
```

### Tables (Vercel-style)
```
No card wrapper. Just rows with border-b border-gray-50.
Header: text-xs uppercase tracking-wider text-gray-500
Rows: hover:bg-gray-50 cursor-pointer
```

### Inputs
```
h-9 border-gray-200 rounded-md text-sm
Focus: ring-2 ring-coral/20 border-coral
```

### Badges/Tags
```
Phoneme: font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded
Status: text-xs font-medium (color varies by status, no background)
```

## Layout

### Sidebar (Dashboard)
```
bg-white border-r border-gray-100 w-56
Active item: text-slate-900 font-medium bg-gray-50 border-l-2 border-coral
Inactive: text-gray-500 hover:text-gray-900
```

### Page Structure
```
Header: border-b border-gray-100, px-6 py-4
Content: px-6 py-6, max-w-5xl for content pages
Sections: separated by border-t border-gray-100 or bg-gray-50 alternating
```

### Spacing
```
Section padding: py-16 (landing) or py-6 (dashboard)
Card gap: gap-4
Element spacing: space-y-4 within cards
```

## Rules

1. NO gradients anywhere (except balloon canvas internals)
2. NO blur/glow effects
3. NO scale transforms on hover (only shadow-sm)
4. NO emojis
5. NO colored backgrounds on cards (white only)
6. NO more than 2 colors per component (navy + coral OR navy + gray)
7. Coral accent used maximum 1x per visible screen (CTA button or active state)
8. Balloons are the ONLY place multiple bright colors appear
9. All text in correct pt-BR with proper accents
10. Monospace font for phoneme notation only (/P/, /R/, etc.)
