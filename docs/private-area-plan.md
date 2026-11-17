# Private area: remaining phases

Last updated: 2026-11-17. Production at commit `342a1c2`.

Status: `[ ]` open, `[~]` in progress, `[x]` done.
Owner: **Dev** = code change, **Eliane** = content or clinical decision, **João** = business or account decision.

Each phase is committed and pushed on its own. Before pushing a phase: type-check, lint, and the full Jest suite with no new failures compared with the previous commit (see "Known test debt").

---

## Done

### Phase 1: security (`f921f5b`)
- [x] `/api/ai/*` (6 routes) admin-only (DB role)
- [x] `createActivity` admin-only
- [x] `/dashboard/ai*` and `/dashboard/exercises/review` return 404 for non-admins
- [x] Menu role read from the DB (same source as the API routes)
- [x] Deleted test code: `/test-consent`, `/dashboard/users`, `/api/create-users` (created Clerk users with a hardcoded password)

### Phase 2: access rules (`342a1c2`)
- [x] One rule in `lib/access.ts`: subscribers and admins download everything published; signed-in users get 2 free /s/ samples; visitors only preview them
- [x] 3/5 monthly download limit removed from downloads and stats
- [x] Fixed: unpublished files downloadable by file id
- [x] Fixed: search API sent signed URLs of paid files to non-subscribers
- [x] Upgrade dialog with monthly and annual Stripe checkout
- [x] Free plan removed from `lib/pricing.ts`; profile shows the real plan

### Phase 2: to verify in production (João)
- [ ] Monthly checkout with a Stripe test card; account changes to "Profissional"
- [ ] Annual checkout; confirm `STRIPE_ANNUAL_PRICE_ID` is set in Vercel
- [ ] Your account has `role = ADMIN` in the production `User` table (admin menu and "Nova atividade" depend on it)
- [ ] Free /s/ offer appears once 2 published /s/ activities with an image exist (Eliane approves them)

---

## Phase 3: cleanup

Goal: remove dead code from the old clinic-system product and earlier experiments, so the private area only contains what the activity library uses. Everything deleted stays in git history.

Before deleting each item: confirm nothing imports it (`grep -rn`), then type-check.

### 3.1 Clinic-system leftovers (Dev)
- [x] `app/dashboard/patient/` (list, `new`, `[id]`)
- [x] `app/api/patients/`
- [x] `components/dialogs/new-patient-dialog.tsx`
- [x] `components/PatientTableClient.tsx`, `components/PatientTableWrapper.tsx`, `components/patient-history-feed.tsx`
- [ ] Prisma `Patient`-related models: **do not drop in this phase.** Dropping tables needs a migration and a backup; list them and decide separately.

### 3.2 Dead pages and experiments (Dev)
- [x] `app/dashboard/landing/` (redirect page; metadata still says "Gerencie pacientes")
- [x] `app/dashboard/settings/` (empty folder) and the `/settings(.*)` and `/profile(.*)` entries in `middleware.ts` (routes don't exist)
- [x] `app/dashboard/customButton.tsx`
- [x] `app/dashboard/ai/text-to-speech/` and `components/ai/VoiceDemo.tsx` (demo)
- [x] `app/test-exercises/` (public test route)
- [x] `app/coming-soon/` (empty)
- [x] `--version/` directory at the repo root (mistyped command)

### 3.3 Old landing pages and pricing components (Dev)
- [x] `app/fomosaas-landing.tsx`, `app/landing-v2.tsx`
- [x] `components/landing/FomosaasLanding.tsx`, `components/landing/FomosaasLandingWrapper.tsx`, `components/landing/LazyBalloon.tsx` (check use first)
- [x] `components/PricingSection.tsx`, `components/PricingSignup.tsx`, `components/PlanSelectionButton.tsx`, `components/SubscribeButton.tsx`, `components/home/pricing-section.tsx`
- [x] `components/SubscriptionPlans.tsx` (only used by the old landing pages)
- [x] `public/images/eliane.png` (untracked, unused full-body photo)

### 3.4 Old download-limit system (Dev)
- [x] `app/api/download-limit/` and its `__tests__`
- [x] `components/dashboard/SubscriptionStatus.tsx` and its 2 test files
- [x] `components/dialogs/exercise-preview-modal.tsx` (calls `/api/download-limit`; used by `components/table/DataTableRowActions.tsx`, check whether that table is still rendered)
- [ ] `services/downloadLimitService.ts`: **keep** for now, the LGPD data export (`app/api/user-data/export`) still reads it. Replace the export's download section with `DownloadHistory`, then delete the service and its tests.
- [ ] `DownloadLimit` and `Download` tables: decide separately (migration + backup)

### 3.5 Broken or risky API routes (Dev)
- [x] `hooks/useSubscription.ts` calls `/api/user/subscription`, which doesn't exist. Only used by `SubscriptionPlans.tsx`: delete with 3.3, or add the route if something still needs it.
- [x] `app/api/onboarding/`: admin-style user creation (password and role in the body), not called by the onboarding page. Review and delete.
- [x] `app/api/test/`, `app/api/test-csrf/`: test routes reachable in production. Delete or block.
- [x] Duplicate Stripe routes: `app/api/create-checkout/` and `app/api/billing/` vs `app/api/stripe/create-checkout` and `app/api/stripe/create-portal`. Keep the `stripe/*` pair, delete the others after checking callers.
- [x] `components/data-subject-rights/DataSubjectRightsDashboard.tsx.backup`

### 3.6 Onboarding (Dev, Eliane for the questions)
- [ ] Remove "Qual faixa etária dos seus pacientes?" (clinic framing). Decide with Eliane which 1 or 2 questions are useful for the library (e.g. which phonemes she works with most).

### Done when
- [ ] No route or component above remains, or each kept one has a reason written next to it
- [x] Type-check and lint pass; Jest has no new failures
- [ ] `/dashboard`, `/dashboard/games`, `/dashboard/profile`, `/dashboard/resources` (admin) still load

---

## Phase 4: design and UX of the private area

Goal: the signed-in area follows `DESIGN_SYSTEM.md` like the landing and auth pages, and a fonoaudióloga can find, preview and download activities without friction.

### 4.1 Navigation (Dev)
- [x] Sidebar items: Painel, Biblioteca (`/dashboard/games`), Perfil, Assinatura, Meus dados (LGPD, `/data-rights`); admin only: Revisão / Recursos
- [x] Give "Recursos" its own icon (it reuses the library's)
- [x] Rename the route `/dashboard/games` → `/dashboard/biblioteca`, with a redirect from the old URL
- [x] Sidebar: `gray-*` → `neutral-*`, remove `backdrop-blur` and `shadow-lg`

### 4.2 Dashboard home (Dev)
- [x] Per-user cards only: downloads this month, plan status, new activities this week. Move "Pendentes" to the admin view.
- [x] Quick links that make sense for a user: Biblioteca, the free /s/ samples (non-subscribers), Assinatura

### 4.3 Library page (Dev)
- [x] Age filter (the API already supports `ageRange`)
- [x] Phoneme filter grouped like the landing taxonomy (pairs, nasais/laterais/vibrantes, arquifonema/encontro)
- [x] Card or grid view with the example word, consistent with the landing cards
- [x] Remove `any` types for activities; type the API response
- [x] Move `updateParams` out of render (side effect during render)
- [x] Replace the server-action download call with an API route (project rule: no server actions from client components) with 401/403/400 tests
- [ ] Real previews for non-subscribers: low-resolution, watermarked images generated at upload time, so the placeholder "Prévia disponível para assinantes" goes away

### 4.4 Profile and subscription (Dev)
- [x] Profile: remove clinic-only fields if not needed ("clinic", "specialization"), `gray-*` → `neutral-*`
- [x] Subscription page: current plan, renewal date, "Gerenciar assinatura" (Stripe portal), cancel
- [x] Handle `?checkout=canceled` and success after checkout with a short confirmation message

### 4.5 LGPD pages (Dev)
- [x] `/data-rights` and `/consent-dashboard` linked from the sidebar ("Meus dados")
- [x] Add `/consent-dashboard` to the protected routes in `middleware.ts`
- [x] Restyle both with `neutral-*` tokens

### 4.6 Admin area (Dev)
- [x] `/dashboard/resources`: restyle; "Corrigir com IA" stays admin-only and never visible to users
- [x] Decide between `/dashboard/exercises/review` and the Revisão tab in Resources; keep one
- [x] Admin views must show the new phoneme codes (`R_FORTE`, `R_FRACO`, `LH`, `ARQ`, `ENC`) with labels from `lib/activityLabels.ts`

### Done when
- [ ] No `gray-*`, `slate-*`, gradients, blur, emoji or English UI text in the private area
- [ ] Contrast audit (WCAG AA) passes on dashboard, library, profile and subscription
- [ ] Tested on desktop and mobile

---

## Phase 5: content and data (after the code phases)

- [ ] **Eliane:** review the pending activities in `/dashboard/resources` (Revisão)
- [ ] **Eliane:** confirm the example words in `lib/phonemes.ts`
- [ ] **Dev:** content pipeline writes the new phoneme codes (`R_FORTE` / `R_FRACO` instead of `R`, plus `LH`, `ARQ`, `ENC`)
- [ ] **Eliane, then Dev:** reclassify existing `R` activities as R forte or r fraco
- [ ] **Dev:** add a food activity type for "Alimentos" (Prisma migration)
- [ ] **João:** marketing email opt-in at sign-up (separate, unticked checkbox, LGPD) before any campaign

---

## Known test debt

The full suite has 47 failing tests in 7 suites, identical before and after phases 1 and 2. They predate this work. Known cause in at least one: `__tests__/integration/api/admin/approval-workflow.test.ts` mocks Prisma without the `user` model, so `requireAdmin` can't run.

- [ ] List the 7 failing suites and fix or delete each (Dev). Until then, the rule is "no new failures compared with the previous commit".

See also `docs/outstanding-tasks.md` for landing, legal-page and deployment items.
