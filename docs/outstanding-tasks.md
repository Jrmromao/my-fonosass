# Outstanding tasks: landing relaunch

Last updated: 2026-11-17. Production at commit `c104474` (deployed, verified live).

Status: `[ ]` open, `[~]` in progress, `[x]` done.
Owner: **Dev** = code change, **Eliane** = content or clinical decision, **João** = business or asset decision.

---

## P0: before publishing /s/ activities in production

The landing page hides the free /s/ offer until /s/ has published activities. These items must be done before that happens, or the page will promise something the backend does not do.

- [ ] **Backend download rules match the free /s/ offer** (Dev)
  - Today: `app/api/download-limit/route.ts` gives non-subscribers 5 downloads of **any** phoneme (`limit = isPro ? 999999 : 5`).
  - Needed: signed-in users download all `FREE_PHONEME` activities without limit; other phonemes return 403 for non-subscribers; remove the 5-download limit.
  - Files: `app/api/download-limit/route.ts`, `lib/actions/file-download.action.ts`, routes that generate S3 URLs for downloads.
  - Done when: integration tests cover 401 (no session), 403 (locked phoneme, free user), 200 (free phoneme, free user) and 200 (any phoneme, PRO).

- [ ] **Tests and rate limit for `/api/free-preview/[fileId]`** (Dev)
  - Public route, no auth by design. Only serves images of PUBLISHED activities of `FREE_PHONEME`.
  - Needed: tests for 400 (invalid id), 404 (other phoneme, unpublished, non-image), 302 (valid, with and without `?download=1`); apply the project rate limiter.

- [ ] **Publish /s/ activities in production, with image files attached** (Eliane)
  - Production currently has only 2 published activities (/b/ and /z/).
  - The popup shows images and the "Baixar" button only for activities with an `image/*` file.

---

## P1: content and correctness

- [ ] **Review the pending activities** (Eliane)
  - Local DB: 185 activities in `PENDING_REVIEW`, 180 files attached. Production count not checked yet (needs read-only access to the production `DATABASE_URL`).
  - Approve in `/dashboard/resources` (Revisão tab) or Telegram. The landing FAQ says "Nada é publicado sem revisão", so bulk approval without review would make that untrue.

- [ ] **Taxonomy follow-ups** (Eliane, then Dev)
  - Confirm group names: "Nasais, laterais e vibrantes" and "Arquifonema e encontro consonantal".
  - Decide whether Arquifonema and Encontro consonantal are split into /r/ and /l/ tiles (today: one tile each, both sounds).
  - New activities must use `phoneme` = `LH`, `ARQ` or `ENC` to appear in the new tiles.
  - Optional later: split /r/ into R forte and r fraco tiles; requires tagging each existing /r/ activity.
  - Source: `lib/phonemes.ts`.

- [ ] **"Alimentos" in Outros has no activity type** (Dev, after Eliane confirms topics)
  - `ActivityType` has no food value, so the tile stays "Em breve". Adding one needs a Prisma migration (`yarn prisma migrate dev --name add-food-activity-type`).

- [ ] **Placeholder phone numbers on legal pages** (João: real contact data; Dev: replace)
  - `(11) 99999-9999` and `(11) 88888-8888` in `app/lgpd`, `app/dpo`, `app/privacidade`, `app/termos`, `app/cookies`, `components/seo/StructuredData.tsx`. Use real numbers or show email only.

- [ ] **Public test routes** (Dev)
  - `/test-consent` and `/test-exercises` are in the production build. Also check `/api/test`, `/api/test-csrf` and `/dashboard/landing`. Delete or block.

- [ ] **404s seen on the landing page** (Dev)
  - `/api/user/subscription` is called by `hooks/useSubscription.ts` but the route does not exist.
  - `/icon-144x144.png` is referenced by `public/manifest.json` but missing.

- [ ] **Dashboard still shows a free plan card** (Dev)
  - `components/SubscriptionPlans.tsx` renders "Gratuito R$ 0,00" from `FREE_PLAN` in `lib/pricing.ts`. Align with the paid-only model plus free /s/.

- [ ] **Run the full test suite** (Dev)
  - `yarn test` has not been run during the relaunch. Project rules require it, plus `yarn build`, before work counts as done.

- [ ] **Migrations workflow** (Dev)
  - `scripts/dev.sh` runs `prisma db push` on every start, which breaks the migrations-only rule.
  - Production database is not baselined (`P3005`), which is why `migrate deploy` was removed from the Vercel build. Baseline it, then restore `migrate deploy`.

---

## P2: design and cleanup

- [ ] **Real activity images in the hero** (João: pick 2 or 3 sheets; Dev: wire in)
  - Hero still draws placeholder sheets with dashed boxes. Use images of **our own** activities only. "Como cada bicho se move?" (WhatsApp image, 2026-10-28) is **not our IP** and must not be used on the site. Ideally include one /s/ sheet.
  - Same applies to the placeholder sheet on the sign-in/sign-up brand panel (`components/auth/AuthShell.tsx`).

- [ ] **Eliane's quote in her own words** (Eliane)
  - Current quote in `components/landing/HomeLanding.tsx` was drafted by us. Replace with her text.

- [ ] **Confirm the founder photo is a real, unretouched photo** (João)
  - `public/images/eliane_head.png`. A generated or heavily retouched photo undermines the trust section.

- [ ] **Logo looks low resolution in the navbar** (João: new asset)

- [ ] **Heading ink decision** (João)
  - `INK` toggle in `components/landing/HomeLanding.tsx`: `'neutral'` (current) or `'violet'`. If violet, apply it to names, FAQ questions and tiles too.

- [ ] **Shared navbar still uses `gray-*`** (Dev)
  - `components/layout/SharedNavbar.tsx` on other pages; `DESIGN_SYSTEM.md` requires `neutral-*`.

- [ ] **Remove dead files** (Dev, confirm before deleting)
  - `app/fomosaas-landing.tsx`, `app/landing-v2.tsx`, empty `app/coming-soon/`, unused `public/images/eliane.png` (1 MB, untracked), stray `--version/` directory, duplicate `next.config.js` / `next.config.mjs` / `next.config.ts`.

- [ ] **Outdated knowledge base** (Dev)
  - `docs/knowledge-base/project-status.md` (Dec 2024) describes prontuários, scheduling and R$ 97–497 pricing. Rewrite to match the activity-library product.

---

## Done in this relaunch

- [x] Lean server-rendered landing page with live catalog counts
- [x] Paid-only plan on the landing page (R$ 39,90/mês or R$ 399,90/ano)
- [x] Free /s/ preview popup with 2 downloadable activities (shown only when /s/ has content)
- [x] "Em breve" tiles for empty phonemes; headline adapts to catalog size
- [x] Clinical taxonomy from Eliane: pairs, nasais/laterais/vibrantes, arquifonema/encontro, Linguagem (single tile), Outros (temas)

- [x] Founder section with photo and CRFa 3-10032
- [x] Metadata repositioned as an activity library (not "prontuários/agendamentos")
- [x] Lavender theme, WCAG AA text contrast (0 failures in browser audit)
- [x] `DESIGN_SYSTEM.md` consolidated as single source of truth
