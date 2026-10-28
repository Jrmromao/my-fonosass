# Session Summary — Launch Planning & UI Redesign Direction

Date: 2026-10-19
Status: Planning only. No code changed, no plan doc committed yet.
Purpose: Hand-off context so a future session can resume without re-discovery.

## Objective

Plan a first public launch of Almanaque da Fala (my-fonosass) over the next
3 weeks, with a UI redesign. The app already works in production, but the owner
feels it does not look like a credible, professional speech-therapy product —
it reads as a generic/hobby SaaS rather than a clinical tool a fonoaudióloga
would trust and pay for.

## Key Context Loaded

- Q-context.md and .kiro/rules.md were read and understood.
- Product: AI-powered library of printable therapeutic activities for pediatric
  speech therapy, sold to Brazilian fonoaudiólogos. Target ~R$79/month.
- Stack: Next.js 15 + TypeScript, Tailwind, Radix/shadcn, Clerk, Prisma,
  Stripe, S3, React Query. Package manager: yarn only.
- Hard rules: pt-BR user-facing copy (correct accents/grammar), zero emojis,
  no gradients/glow, Prisma migrations only, Zod validation, tests mandatory
  for new routes/services, no git commits without explicit permission.

## Core Diagnosis (the main finding)

The codebase has a "split-brain" design problem:

1. Two conflicting design definitions exist:
   - .kiro/design-system.md -> Navy (#1e293b) + Coral (#f97066), Vercel-style,
     restrained, no gradients. (More detailed and well-considered.)
   - .kiro/rules.md -> indigo-600 primary.
   - tailwind.config.js uses CSS-variable shadcn tokens, so neither is the
     enforced source of truth yet.

2. The landing page (components/landing/FomosaasLanding.tsx) directly violates
   the project's own design rules and is the root cause of the "unprofessional"
   feel:
   - Page background: bg-gradient-to-b from-cyan-100 to-fuchsia-100 (gradient).
   - Hero title: indigo-600 via-pink-500 to-yellow-400 gradient text.
   - CTA: from-pink-500 to-yellow-400 with pink glow shadows.
   - Decorative blur-3xl glow blobs.
   - Badge copy "Fonoaudiologia Divertida" frames it as a kids' toy.
   - globals.css uses pink focus rings and pink blog link styling.

3. The dashboard (app/dashboard/page.tsx) is ALREADY correct — it uses the
   restrained token system (border-border, text-muted-foreground, mono phoneme
   notation, no gradients). So the good design exists; it is simply not applied
   to the surfaces that sell the product.

Guiding principle agreed in discussion: the playful/colorful personality
belongs INSIDE the activities (printables, balloons), not in the platform
chrome. The platform speaks to the professional; the materials are for kids.
This matches rules.md already.

## Proposed Design Decision (NOT yet confirmed by owner)

Adopt Navy (#1e293b) + Coral (#f97066), zero gradients, zero glow. This
resolves the indigo-vs-coral conflict and removes the candy gradients.
ACTION NEEDED: owner must confirm Navy + Coral, or provide a reference site
they admire to sharpen the landing redesign.

## Proposed 3-Week Plan (draft, not yet written to a plan doc)

Week 1 — Foundation and trust:
- Lock design tokens into globals.css + tailwind.config.js as single source of
  truth (navy/coral/grays, Nunito/Inter, radius, shadows).
- Reconcile .kiro/design-system.md and .kiro/rules.md into one consistent spec.
- Harden core component layer (Button, Card, Input, Badge, Table, Section).
- Rebuild landing page for clinical credibility: real value proposition for
  fonoaudiólogas, trust signals ("criado por fonoaudióloga", testimonials,
  sample activity previews), clean pricing. Remove all gradients/glow/candy.

Week 2 — Conversion path:
- Redesign sign-up / sign-in, pricing, and Stripe checkout / subscription gate.
- Redesign the activity library (browse / filter / preview) as a curated
  professional catalog; playful color only inside activity thumbnails.
- Dashboard polish to fully match tokens.

Week 3 — Launch hardening:
- Accessibility pass (WCAG AA: contrast, focus, keyboard).
- Mobile responsiveness on all launch surfaces.
- Copy pass: correct pt-BR, professional tone, no emojis, remove "Divertida"
  framing from chrome.
- Launch checklist: yarn test + yarn build green, Stripe live mode, LGPD
  consent live, error monitoring, SEO/OG tags.

Launch surfaces in scope: landing, auth, pricing/checkout, activity library,
dashboard, account/billing. Other pages (blog internals, admin) inherit tokens
but get no bespoke redesign.

## Open Questions for Next Session

1. Confirm design direction: Navy + Coral (recommended) vs indigo.
2. Any reference SaaS sites the owner admires (anchors "professional").
3. Confirm launch surface list (add/drop anything?).
4. Are all current flows working end to end (sign up -> browse -> pay ->
   download), or is there broken functionality to budget fix time for?

## Immediate Next Actions (when resuming)

1. Get design direction confirmation.
2. Write the full day-by-day plan to docs/launch-plan-2026.md.
3. Begin Week 1: establish design tokens (low-risk, reversible), then rebuild
   the landing page.
4. Do not commit to git without explicit permission. Use yarn for all commands.

## Notes

- "bank!" in this project runs `yarn session:bank` (scripts/bank.sh) to save
  session context. It was discussed but NOT run this session.
- Existing docs/feature-release-plan.md and docs/production-plan-tracker.md are
  stale (targets from Sep/Oct 2025) and use emojis against project rules.
  Consider superseding them with the new launch plan.
