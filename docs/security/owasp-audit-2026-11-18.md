# OWASP Security Audit (2026-11-18)

Branch: `security/owasp-audit` (from `main` @ 0dc2e92)
Scope: 68 API routes, `middleware.ts`, `vercel.json`, dependencies, secret scan, XSS sinks.
Method: static review plus `yarn audit`. Nothing was exploited or run against a live environment. Findings marked "confirmed in code" were read directly; none were reproduced at runtime.

## Summary

| ID | Severity | OWASP 2021 | Finding |
|----|----------|-----------|---------|
| F1 | Critical | A06 | Next.js 15.5.18 and @clerk/nextjs 6.32.0 have critical advisories (unauthenticated RCE in image optimization, Clerk middleware route-protection bypass) |
| F2 | High | A01 | Admin routes check only "logged in", not `role === 'ADMIN'`: `admin/analytics`, `admin/monitoring` (GET+POST), `admin/waiting-list`, `cache/stats` (GET+DELETE) |
| F3 | High | A01 | `admin/sync-activities` browser path accepts any logged-in user; machine path acts as "first user by createdAt", not an admin |
| F4 | High | A01 | `resources/[id]/file`: any logged-in user downloads non-free resources, no subscription check |
| F5 | High | A04 / A05 | `POST /api/activities/generate` is unauthenticated and calls OpenAI with no rate limit (cost abuse) |
| F6 | Medium | A07 | Reviewer approval is a state-changing GET with the token in the query string |
| F7 | Medium | A04 | In-memory rate limiter and `x-forwarded-for` as key (ineffective on Vercel, spoofable) |
| F8 | Medium | A01 / A09 | Public blog like/view endpoints trust client-supplied `ipAddress`, and create DB rows for arbitrary slugs |
| F9 | Medium | A03 | `marked(post.content)` and a regex markdown renderer are injected with `dangerouslySetInnerHTML`, no sanitizer |
| F10 | Medium | A05 | CSP allows `'unsafe-inline' 'unsafe-eval'`; `connect-src` allows any `https:`/`wss:`; `productionBrowserSourceMaps: true` |
| F11 | Medium | A04 (LGPD) | Data-export requests are kept in an in-memory `Map`; `waiting-list` writes emails and IPs to local files |
| F12 | Low | A02 | Secret comparisons not constant-time (`ADMIN_API_KEY`, `approvalToken`) |
| F13 | Low | A09 | Error details returned to the client (PDF fallback), `console.log` of web-vitals, unauthenticated web-vitals endpoint |
| F14 | Low | A08 | Stub `subscription/callback` accepts unauthenticated POSTs and does nothing |

## Details

### F1 Vulnerable components (A06)
`yarn audit --groups dependencies`: 152 findings (14 critical, 62 high), including transitive ones.
Production-relevant ones:
- `next` 15.5.18, fix >= 15.5.28 (critical: unauthenticated RCE in the Image Optimization API; high: SSRF in rewrites/Server Actions, Server Actions DoS)
- `@clerk/nextjs` 6.32.0, fix >= 6.39.3 (critical: middleware-based route protection bypass; high: authorization bypass). This matters because `middleware.ts` is the only guard for `/dashboard`, `/api/ai`, `/api/user`.
- `fast-xml-parser` 5.2.5 via `@aws-sdk/client-s3` (critical, entity encoding bypass)
- `sharp` 0.34.4, `postcss` 8.4.31 (via next), `zod` 3.25.76 (memory exhaustion on oversized collections), `nanoid` 3.3.11, `js-yaml` via `gray-matter`.
Fix: bump `next` and `@clerk/nextjs` first, run `yarn upgrade` for the transitive ones, re-run the audit. `aws-sdk` v2 is also still a dependency and is end-of-life; remove it if v3 covers all uses.

### F2 Missing admin authorization (A01)
Confirmed in code. These handlers call `auth()` and stop at `if (!userId)`:
- `app/api/admin/analytics/route.ts` (business metrics)
- `app/api/admin/monitoring/route.ts` GET and POST (contains `// TODO: Add admin role check here`)
- `app/api/admin/waiting-list/route.ts` (list of emails, PII, `// TODO: Add role-based access control`)
- `app/api/cache/stats/route.ts` GET and DELETE (any user can flush the cache)

Every other `admin/*` route correctly uses `requireAdmin()` from `lib/activities/approval.ts`. Fix: use `requireAdmin()` in all four.
Also note `middleware.ts` does not cover `/api/admin` or `/api/cache`; each handler is the only check.

### F3 sync-activities (A01)
`app/api/admin/sync-activities/route.ts` lines ~245-275: the Clerk branch only loads the user, never checks `role`. Any registered user can trigger an S3 scan, DB writes, optional OpenAI calls and review notifications. The machine branch (`Bearer ADMIN_API_KEY`) uses `prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })`, which is not guaranteed to be an admin. Fix: `requireAdmin()` for the browser path; for the machine path look up `where: { role: 'ADMIN' }` and compare the key with `timingSafeEqual`.

### F4 Premium resource download (A01)
`app/api/resources/[id]/file/route.ts`: `if (!resource.isFree && !user)` only requires a login. A free-plan account can download paid resources. The files route `files/[fileId]/download` correctly delegates to `lib/access.ts`; reuse that. Related: `resources/[id]` GET (public, cached) returns `content`, `files[].s3Url` and rating authors' `fullName` to anonymous users for every published resource, including non-free ones. Confirm the S3 URLs are not publicly readable and strip `content`/`s3Url` for non-free resources.

### F5 Unauthenticated AI generation (A04)
`app/api/activities/generate/route.ts` has Zod validation but no `auth()`, no rate limit and no credit check, and it is outside the `/api/ai` matcher in `middleware.ts`. Each request triggers OpenAI generation (with retries) and PDF rendering. Fix: require auth and subscription/credit checks via `lib/access.ts`, and add a shared (Redis/Upstash) rate limit. If it is meant to be a public demo, cap it by IP at the edge and cache by parameters.

### F6 Approval link (A07)
`app/api/exercises/[id]/approve` and `reject` perform state changes on GET. Link-preview bots (Telegram, which is the delivery channel), email scanners and browser prefetch can fire the request and consume the single-use token, publishing content without a human decision. The token also appears in URLs, logs and Referer headers. Positive points: tokens are random (`randomUUID` / `nanoid(32)`), single-use, and the update is atomic. Fix: GET shows a confirmation page, POST performs the action. Compare tokens with `timingSafeEqual`.

### F7 Rate limiting (A04)
`lib/security/rateLimiter.ts` stores counters in a process-local `Map`, and `webhooks/stripe` keeps a module-level array. On Vercel each instance has its own memory, so limits are not enforced. Keys come from the first `x-forwarded-for` value, which a client can prepend to. Only 13 of 36 mutating routes use `SecurityMiddleware` (the CSRF/rate-limit layer). Fix: Upstash Ratelimit (Upstash/Redis is already in your stack) and use Vercel's trusted IP (`request.ip` / last hop of `x-forwarded-for`). Remove the Stripe in-memory limiter; signature verification already protects it.

### F8 Public blog endpoints (A01/A09)
`blog/[slug]/like` and `/view` accept `ipAddress` and `userAgent` from the JSON body, so one client can like repeatedly under different fake IPs, and `POST` creates a `blogPost` row for any slug (unbounded table growth). Fix: derive IP server-side, only update existing posts (or validate the slug against known posts), and rate-limit.

### F9 XSS sinks (A03)
- `components/blog/BlogPostClient.tsx:556` renders `marked(post.content)` without sanitization.
- `app/recursos-gratuitos/[id]/ResourcePageClient.tsx:228` builds HTML with regex replaces from `resource.content`.
Content currently comes from admins/S3, so exploitation needs a compromised admin or bucket, but the CSP allows inline scripts (F10), so there is no second layer. Fix: wrap in `DOMPurify.sanitize` (isomorphic-dompurify) or render with `react-markdown`. The JSON-LD sinks use `JSON.stringify` and are fine as long as `<` is escaped (`.replace(/</g, '\\u003c')`).

### F10 Headers / config (A05)
`vercel.json` CSP has `script-src 'unsafe-inline' 'unsafe-eval'`, `img-src https:` and `connect-src https: wss:`, which largely negates XSS protection. Move to nonce-based CSP via middleware (Clerk supports this). `X-XSS-Protection` is deprecated (harmless). `productionBrowserSourceMaps: true` publishes your source to everyone; disable it or upload maps to an error tracker only. Headers are in `vercel.json` only, so `next start`/local builds do not get them.

### F11 LGPD and data handling (A04)
- `user-data/export-requests*` keeps requests in a module-level `Map` ("in production, use a database"). On serverless these vanish between invocations, so LGPD access requests can be silently lost. Persist them in Postgres.
- `waiting-list` appends emails and IPs to `data/waiting-list.csv/json` on disk (only "works" locally), has only `email.includes('@')` validation and no rate limit. Use Zod `email()`, a DB table and a rate limit. Escape CSV fields if the CSV stays (formula injection: leading `= + - @`).
- Request IPs are stored in `resourceDownload`, `blogLike`, waiting list. Document the legal basis and retention in `/lgpd`.

### F12 Timing-safe comparisons (A02)
`apiKey === process.env.ADMIN_API_KEY` and `activity.approvalToken !== token` use ordinary string comparison. Use `crypto.timingSafeEqual` on equal-length buffers.

### F13 Information exposure (A09)
`resources/[id]/file` returns `Error generating PDF: ${error.message}` to the client. `web-vitals` logs unauthenticated, unvalidated client data with `console.log` (log injection and noise, and your rules ban `console.log`). The route has no size or rate limit.

### F14 Stub webhook (A08)
`subscription/callback` is a PagSeguro stub with commented-out DB writes and no signature check. It is harmless today; delete it, or add signature verification before enabling the code.

## What looked fine
- Stripe webhook verifies the signature (`constructEvent`); Clerk webhook verifies Svix headers.
- All `ai/*` routes use `requireAdmin()` and Zod; checkout builds URLs from `NEXT_PUBLIC_APP_URL`, price IDs from server config.
- No raw SQL (`$queryRawUnsafe`), `eval`, `child_process`, or user-controlled `fetch` URLs found. Prisma queries are parameterized.
- No tracked `.env` files or live keys (only `sk_test_mock`/`whsec_mock` in disabled CI and tests).
- `free-preview/[fileId]` validates the id as a cuid and only serves whitelisted free samples with a 5-minute presigned URL.
- `resources/upload` enforces admin, CSRF, size and MIME allowlist (MIME is client-declared; add magic-byte checks via `lib/security/fileValidation.ts`).

## Not covered
Server actions in `lib/actions`, `app/` pages with direct Prisma access, S3 bucket policy, Clerk dashboard settings, Vercel env configuration, git history secret scan (`git log -p` / gitleaks), runtime/DAST testing.

## Suggested fix order
1. F1 dependency upgrades (Next, Clerk).
2. F2, F3, F4 authorization fixes (small diffs, highest impact).
3. F5 plus F7 (auth and a shared rate limiter).
4. F6, F9, F10, F11, then the low items.

---

## Remediation status (same branch)

| ID | Status | Change |
|----|--------|--------|
| F1 | Fixed (partly) | `next` 15.5.28, `@clerk/nextjs` 6.39.x, patched transitive deps via `resolutions`/upgrades. Audit (prod deps): 14 critical / 62 high -> 0 critical / 3 high. Remaining: `zod` (fix needs v4, a major upgrade) and `effect`/`deepmerge-ts` inside the Prisma CLI (build time only). |
| F2 | Fixed | New `guardAdmin()` in `lib/activities/approval.ts`, used by `admin/analytics`, `admin/monitoring`, `admin/waiting-list`, `cache/stats`. `middleware.ts` now also protects `/api/admin/*` (except sync-activities), `/api/cache`, `/api/user-data`, `/api/activities/generate`. |
| F3 | Fixed | sync-activities: browser path uses `requireAdmin()`, machine path attributes to an ADMIN user, key compared with `safeEqual`. |
| F4 | Fixed | `lib/resources/access.ts`; `/file` and `/download` require subscription or admin for non-free resources (403). Public `GET /api/resources` and `/api/resources/[id]` strip `content`/`downloadUrl`/`viewUrl`/`s3Url` for non-free items except for admins; signed-in requests skip the shared response cache; reviewer names reduced to first name; list limit capped at 200. |
| F5 | Fixed | `activities/generate` requires login + subscription/admin and has a 10/hour limit; stricter Zod regexes for phoneme/topic. |
| F6 | Fixed | approve/reject act only on POST (token in form body); GET redirects to the review page, which has confirm buttons. Token compare is constant-time. Old Telegram links still work (one extra click). |
| F7 | Fixed (Upstash env vars confirmed in Vercel Preview + Production) | `RateLimiter.checkAsync()` uses Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, else falls back to memory. Client IP from `lib/security/clientIp.ts` (Vercel headers first). Stripe in-memory limiter removed. |
| F8 | Fixed | Blog like/view: IP derived server-side, slug must match a real post (`lib/blog-tracking.ts`), rate limited, user agent/referer truncated. |
| F9 | Fixed | `lib/security/sanitizeHtml.ts` (sanitize-html 2.13.1, pinned for Node 20.18) on both markdown sinks; `lib/security/jsonLd.ts` escapes `<`/`>` in all JSON-LD scripts. |
| F10 | Fixed (partly) | `unsafe-eval` removed in production; added `object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors`, HSTS, Permissions-Policy, X-Frame-Options DENY in `next.config.js` (the active config); browser source maps off. `'unsafe-inline'` scripts remain: removing them needs a nonce CSP, which makes every page dynamic. |
| F11 | Partly | waiting-list: Zod email, rate limit, no filesystem writes in production, hashed S3 key (no email in object name), CSV formula-injection escaping. Export requests: Zod input + `randomUUID` ids, **still in memory** (needs a Prisma model + migration). |
| F12 | Fixed | `lib/security/safeCompare.ts` used for API key and approval tokens. |
| F13 | Fixed | PDF error detail no longer returned; web-vitals validated, size/rate limited, no payload logging. |
| F14 | Fixed | `subscription/callback` stub deleted. |
| Extra | Fixed | `lib/actions/user.action.ts` server actions (`remove`, `getAll`, `findById`, `insert`, `invite`, `update`) had no auth; all now require ADMIN. Upload route: magic-byte check, server-chosen extension, `resourceId` validated. `lib/images/watermark.ts` typing fixed for sharp 0.35. |

Verification run: `tsc` (0 errors outside test files; the test-file errors existed before), `jest` 56 suites / 517 tests passing, `next build` passing, and anonymous HTTP checks on `next start`: protected routes refuse anonymous callers (Clerk `protect-rewrite`), sync with a bad key returns 401, GET approve returns a 303 with no state change, fake blog slugs return 404, invalid waiting-list/web-vitals input returns 400, the removed callback returns 404, the CSP has no `unsafe-eval`, and there are 0 `.map` files in `.next/static`.
Not verified: behaviour for a signed-in non-admin or a subscriber (no test Clerk session), and the Upstash path (no credentials locally).

Node: local development moved to Node 22 (`.nvmrc`), matching the Vercel project setting (`nodeVersion: 22.x`). Dependencies were reinstalled without `--ignore-engines`, and tests (517) and `next build` pass on Node 22.23.5.

## Follow-ups (same branch)

### LGPD data-export requests: persisted (closes the F11 remainder)
- New model `DataExportRequest` and migration `prisma/migrations/20261118_lgpd_data_export_requests` (additive: 2 enums and 1 table, FK to `User` with `ON DELETE CASCADE`). It was generated with `prisma migrate diff` and applied locally with `migrate deploy`, per `.kiro/rules.md`. Production applies it on the next production build.
- Requests are answered immediately: the export is generated on demand from live data, and the row records when it was requested and answered. Old behaviour: rows in a `Map` stayed `PENDING` forever and the download button did nothing.
- Every export is recorded. A dashboard request counts downloads through `?request=<id>` (owner-only, not expired). A direct download from the privacy panel creates an already-answered row. Limit: 5 requests per user per 24h. Links expire after 7 days (`EXPIRED` is derived when read).
- Only JSON is offered. The CSV and PDF buttons were removed because nothing ever produced those formats.
- Verified against the local DB: create/list, daily limit, owner-only download count, another user's id rejected, expiry, cascade on user delete.
- **Still open:** data **correction** requests (`/api/user-data/update`, LGPD art. 18 III) are not stored at all, and GET always returns `[]`. They need the same treatment plus an admin review flow.

### zod 4 (closes the zod advisory in F1)
- `zod` 3.25.76 -> 4.6.7 and `@hookform/resolvers` 3 -> 5.9.2. Code changes: `ZodError.errors` -> `.issues` (3 places); `required_error`/`invalid_type_error` -> `error` with the same pt-BR messages (`lib/schema/index.ts`); the sign-up form is typed with separate input and output types because of a `.transform`.
- `react`/`react-dom` 19.1.1 -> 19.1.10 (same minor version, includes the React Server Components security fixes; removes Clerk's peer warning).
- Audit (prod deps): 2 high left, both inside the Prisma CLI (`effect`, `deepmerge-ts`), which only runs at build time.

### Nonce-based CSP (closes the F10 remainder)
- `middleware.ts` + `lib/security/csp.ts`: a fresh nonce per request, `script-src 'self' 'nonce-…' 'strict-dynamic'`. The nonce is passed on the request headers to Next.js and Clerk (`<ClerkProvider dynamic>`), and the root layout passes it to `next-themes` and Google Analytics.
- The static CSPs were removed from `vercel.json` (the one production actually served) and `next.config.js`. Host lists are unchanged from what production served.
- Verified in Chromium against `next start` on 7 pages: 0 CSP violations, React hydrates and Clerk loads, the nonce changes per request, and both injected inline handlers and an injected `<script>` without the nonce are **blocked**. `next dev` also runs with 0 violations.
- **Trade-off:** HTML is now rendered per request (the root layout reads headers), so the homepage `revalidate = 3600` no longer applies and HTML is not CDN-cached. `style-src 'unsafe-inline'` is kept (Next and framer-motion use inline styles).

### Data correction flow (LGPD art. 18 III), reworked
- **Name:** self-service. `PUT /api/user/profile` now updates **Clerk first, then the DB** (the Clerk `user.updated` webhook rewrites `User.fullName` from Clerk, so a DB-only edit was reverted on the next sync).
- **Email:** never written by our API. `PUT /api/user/profile` returns 400 if the email differs from the stored one; the profile form shows it read-only with a "Gerenciar conta" button (Clerk account settings verify the new address, then the webhook syncs the DB). This closes a hole where any signed-in user could set an unverified email, including someone else's, and break the link to their Clerk login. Removed: the second unverified writer, `PUT /api/user-data/update`.
- **Phone:** removed from the form (the `User` model has no phone).
- **"Outro" / anything else:** new `DataCorrectionRequest` model and migration `20261118_lgpd_data_correction_requests` (additive). `POST /api/user-data/update` stores the request (CSRF, 5/day limit) and emails the DPO (`dpo@almanaquedafala.com.br`); `GET` lists the user's own. Admins answer at `/dashboard/correcoes` (admin-only, 404 for others) via `GET /api/admin/correction-requests` and `POST /api/admin/correction-requests/[id]`. An answer needs a note, is final (cannot be rewritten), and is emailed to the user.
- Verified: unit/integration tests updated (519 pass), DB round-trip (create, daily limit, resolve, final answer, cascade delete), `tsc` and `next build` clean. **Not verified:** the Clerk name update and the two emails (need live Clerk/Resend credentials), and the signed-in admin page in a browser.

### Audit trail (`AuditEvent`)
- New table `audit_events` (migration `20261118_audit_events`, additive). Append-only, **no foreign keys and no personal data**: actor type, internal actor id, a dotted action code, target type/id, IP, and a small flat metadata object (strings cut to 120 chars). It survives account deletion without keeping anything that identifies a person. Retention: **6 months** (`AUDIT_RETENTION_MONTHS` in `lib/audit/audit.ts`), matching the "Logs de Sistema: 6 meses" line published on `/lgpd` (first draft said 12; corrected after checking the policy), purged opportunistically (about 1 in 50 writes), so no cron job or secret is needed.
- `recordAudit()` never throws: a failed write is logged and the request continues (fail-open on purpose, so an audit hiccup cannot take admin features down).
- Recorded: waiting-list read (`admin.waiting_list.read`), correction request answer, activity sync (admin or machine), free-sample set/clear, monitoring data clear, cache clear, user insert/invite/update/remove (field names and role only, never values), reading the audit trail itself. Security events: a signed-in non-admin hitting an admin endpoint (`security.admin_denied`) and a wrong review token (`security.approval_token_invalid`); both are throttled to one entry per actor/IP per 5-10 minutes so they cannot be used to fill the table.
- `GET /api/admin/audit-events` (admin only): filters `action` (prefix), `actorId`, `targetId`, cursor pagination. There is no update or delete endpoint.
- Left out on purpose: admin analytics (aggregates only), activity approve/reject/discard (already tracked by `reviewedById`/`reviewedAt`), ordinary user reads and writes, rate-limit hits (a flood would write a flood).
- Verified against the local DB: write, metadata truncation, per-IP throttling (5 attempts -> 1 row), hostile IP header sanitized, 12-month purge keeps recent rows, helper swallows DB errors. Tests (519), `tsc` and `next build` pass. **Not verified:** the wiring inside each route with a live admin session.

### Audit trail: retention and viewer
- **Retention corrected to 6 months.** `/lgpd` publishes "Logs de Sistema: 6 meses" (the Marco Civil art. 15 minimum), so the constant now matches it. To keep events longer, raise `AUDIT_RETENTION_MONTHS` and change that line on `app/lgpd/page.tsx` in the same release.
- **Viewer:** `/dashboard/auditoria` (admin-only; sidebar entry "Auditoria"): filter All / Admin actions / Security events, 50 per page with "Carregar mais", labels in Portuguese, read-only.
- **Verified end to end** on `next start` with a temporary Clerk dev user (created and deleted afterwards), driven by Chromium: admin reads waiting list and clears cache, and each produced one event with the admin's id and the right actor type; the audit API filter and cursor validation work; both admin pages render and show in the sidebar; the same user demoted to USER gets 403 on all four admin endpoints, produces exactly one `security.admin_denied` event for four attempts, sees the 404 page (not the admin UI) on both admin pages, and creates no admin events; six wrong review tokens (approve and reject) produce one anonymous event and leave the activity untouched; 0 CSP violations.
- **Policy page gap (not changed):** `/lgpd` does not mention the audit trail. Suggested wording: "Registros de auditoria de ações administrativas e eventos de segurança (apenas identificadores, sem dados pessoais diretos): 6 meses." Other figures on that page also differ from the code's retention policies (payment data: 5 anos published vs 7 in `dataRetentionService`; patient data: 20 anos vs 15; user data: 2 anos both). The published numbers should be reviewed with whoever owns the legal text.

### Published retention figures (`/lgpd`) aligned
- Added "Registros de Auditoria: 6 meses" with the sentence "Registros de auditoria de ações administrativas e eventos de segurança (apenas identificadores, sem dados pessoais diretos): 6 meses."
- Removed "Dados de Pacientes: 20 anos": the app does not store patient data (no patient table; `PatientForm` is UI only).
- Payment data stays **5 anos** and the code was changed to match. Fiscal records in Brazil are kept 5 years (CTN arts. 173 and 174); the code's 7 years was an unsourced "legal requirement". In `lib/services/dataRetentionService.ts`: `payment_data` 2555 -> 1825 days, and the default `medical_records` (15 years) policy removed. That service is not called from anywhere in the app today, so this changes the defaults only, and rows already in `data_retention_policies` are not rewritten.
- **Still published elsewhere, and not edited:** `app/privacidade/page.tsx` ("Dados de Pacientes: nome, data de nascimento, histórico médico, dados de saúde") and `app/termos/page.tsx` ("Dados de Pacientes... Retenção conforme Resolução CFFa", "Prontuários digitais de pacientes", plans "R$ 97/mês, até 50 pacientes" and "R$ 197/mês, pacientes ilimitados"). These describe a product and prices the app no longer has, and should be rewritten by whoever owns the legal text.

### Sync with main (7f30b33)
- The branch had no commits of its own, so it was fast-forwarded to `main` (no merge commit) and the uncommitted work was re-applied on top. Conflicts: `components/seo/StructuredData.tsx` (both imports kept) and `app/lgpd/page.tsx` (main rewrote the page; main's version taken).
- **Legal pages:** main's rewrite already says "Não tratamos dados de pacientes" and has no retention table, so the patient and figure edits became moot. The audit-trail wording was re-applied to the new `app/privacidade/page.tsx`: section 2 (audit records; the user's privacy requests) and section 6 (6 months for audit records; privacy requests kept with the account). `LEGAL_LAST_UPDATED` was already today's date.
- Verified after the sync: `tsc` clean, 57 suites / 529 tests, `next build` passes.
- **Correction (earlier claim was wrong):** `components/user/UserProfile.tsx` and `components/data-subject-rights/DataSubjectRightsDashboard.tsx` are not rendered anywhere. The live profile is `app/dashboard/profile/page.tsx` (reads Clerk, no edit form, no correction form), and `/lgpd` says corrections are done by email. The API protections still stand (the unverified email write is closed; correction requests, export requests and the admin queue exist and work), but there is no user-facing form that submits a correction request.
- **Conflict with main's caching work:** with the nonce CSP the root layout reads request headers, so `/`, `/sign-in` and `/sign-up` are now rendered per request and main's `revalidate = 3600` plus `refreshPublicCatalogPages()` have no effect on them.

### CSP split (replaces the "nonce everywhere" version) and a live correction form
- **CSP:** two modes chosen per route in `middleware.ts` (`lib/security/csp.ts`). Signed-in areas (`/dashboard`, `/data-rights`, `/consent-dashboard`) get a per-request nonce, **no `'unsafe-inline'`**, plus the host allowlist; those routes are `force-dynamic`. Public pages are prerendered and cached again (`/`, `/blog`, `/faq`, `/privacidade`, `/lgpd`, `/recursos-gratuitos` all `○`/`●` in the build, `s-maxage` cache headers present), so main's `revalidate = 3600` and `refreshPublicCatalogPages()` work as designed. Public pages keep `'unsafe-inline'` and the host list, with `'unsafe-eval'` removed in production (an improvement over what production served before).
- Not `'strict-dynamic'`: Clerk's loader tag is rendered by the static root layout and cannot carry a nonce, so Clerk's script is allowed by host. The root layout, `Providers.tsx` and `GoogleAnalytics.tsx` are back to main's versions (only the safe JSON-LD change remains in `layout.tsx`).
- **ThemeProvider removed from `components/Providers.tsx`.** The app is light-only (nothing calls `useTheme`, no CSS targets the class it set) and it emitted an inline script on every page that the nonce policy blocks. `components/theme-provider.tsx` stays for later. Restore it only together with a CSP hash or nonce for its script.
- Verified in Chromium on `next start`: 7 public pages, 0 violations, hydrated, Clerk loaded, cached; 7 signed-in pages, 0 violations; profile navigation and data export work; an injected inline handler and an injected inline `<script>` are **blocked** in the signed-in area. `__tests__/unit/security/csp.test.ts` covers both modes.
- **Correction form is now live:** "Corrigir dados" in Perfil → Privacidade (`components/settings/PrivacyPanel.tsx`) posts to `/api/user-data/update`. `/lgpd` row updated to match. The request is saved first; the DPO and user emails are best-effort (a mail failure no longer fails the request). Verified end to end with two temporary Clerk users (deleted afterwards): submit through the real panel, the row is saved, a normal user gets 403 on the admin queue, the admin answers from `/dashboard/correcoes`, a second answer is refused with 409, the audit trail shows the answer, and the user sees it in their list. **Not verified:** the two emails (no `RESEND_API_KEY` locally).
- `sign-in` and `sign-up` render per request on main already (production serves them with `cache-control: private, no-store`), so `refreshPublicCatalogPages()` revalidating them does nothing. Not changed.

### Best-practice hardening pass
- **CI** (`.github/workflows/ci.yml`, read-only permissions, Node from `.nvmrc`): type check of application code (`tsconfig.ci.json`), unit tests, production build against a throw-away Postgres, `yarn audit` (fails on critical production advisories), gitleaks over the full history (`.gitleaks.toml` allowlists 4 known placeholders). Dependabot weekly for npm and Actions, ignoring Tailwind majors (project rule) and framework majors. The migration history cannot be replayed from an empty database (known issue in `.kiro/rules.md`), so CI builds its database from the schema; production still only uses migrations. **Not run on GitHub yet**: the YAML parses and every step was run locally, but the first real run will tell.
- **Webhooks:** Stripe events are now idempotent (`processed_webhook_events`, migration `20261118_processed_webhook_events`): a duplicate delivery is acknowledged without repeating emails or writes, a failed run releases its claim so Stripe's retry works, and a database error fails open. The Clerk webhook had the same in-memory pre-verification rate limit as Stripe did (forged requests could make real deliveries fail with 429); removed.
- **CSRF defense in depth:** mutating `/api/*` requests with a foreign `Origin` get 403 (`lib/security/origin.ts`, in middleware). Requests without an Origin (webhooks, GitHub Actions) pass and rely on their own secrets.
- **Fail closed where it matters:** reading the waiting list (emails, IPs) now requires the audit entry to be written; if it cannot be, the request returns 503. Other audit calls still fail open. The rate limiter logs a warning in production when Upstash is not configured.
- **CSP rollout:** a strict report-only policy (exact hosts for `connect-src`, `img-src`, `frame-src`, `font-src`, `media-src`) now ships beside the enforced one, and both send reports to `/api/csp-report` (size-capped, rate-limited, validated; stores only blocked origin and page path as a throttled `security.csp_violation` audit event; visible at `/dashboard/auditoria`). Promote the strict lists to enforcement after a few weeks with no legitimate violations. Zod 4 probes `new Function` once, which the CSP blocks and reports on pages with forms; `z.config({ jitless: true })` (`lib/zodConfig.ts`) removes the probe. Verified in Chromium: all public pages and both auth pages show no violations.
- **Tests added:** 39 tests across the security helpers, CSP (both modes and the report-only policy), the audit helper, export and correction requests, webhook idempotency, and the route behaviour for the CSP report endpoint, the waiting-list guard (403, success, 503) and the correction answer (403/401/400/409). Suite: 62 files, 573 tests.
- **Docs for the owner (drafts, with blanks to fill):** `docs/security/incident-response.md` (includes the 3-business-day ANPD clock, Resolução CD/ANPD nº 15/2024), `docs/security/backup-restore-runbook.md` (restore test; backup facts unknown from code), `docs/privacy/processors-register.md`, `docs/security/asvs-l1-checklist.md` (honest self-assessment with gaps), and `public/.well-known/security.txt` (contact is the DPO mailbox; expires 2027-11-18, renew yearly).
- **Known flaky test (pre-existing, not from this work):** `crossword.test.ts` "backfills from the bank" failed once in a full run and passed 6 of 6 reruns; it depends on `Math.random`.
