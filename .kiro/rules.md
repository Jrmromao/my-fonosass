# Almanaque da Fala — Project Rules

## Language & Content (ABSOLUTE)

All user-facing text MUST be written in correct Brazilian Portuguese (pt-BR):
- Proper accents: ã, õ, é, ê, í, ó, ô, ú, ç
- Correct grammar and concordância verbal/nominal
- Zero spelling errors — no tolerance
- Zero emojis in any user-facing content
- No English in UI (except: PDF, download, login)
- Common mistakes to avoid: "a" vs "à", "por que" vs "porque", "há" vs "a", "sessão" not "seção"

When generating or modifying Portuguese text, always verify accents and grammar before committing.

## Target Audience & Positioning

- Primary customer: **Fonoaudiólogos que atendem crianças** (speech therapists working with children)
- Value proposition: AI-powered library of printable therapeutic activities for pediatric sessions
- Tone: Professional but warm. Approachable for clinicians who work with kids daily.
- The materials are kid-friendly (colorful, playful) but the platform/copy speaks to the professional
- Competitor reference: fonoclub.com.br (we differentiate with AI-generated content at scale)

## Brand Standards

- Name: Almanaque da Fala
- Domain/watermark: almanaquedafala.com.br
- Primary color: indigo-600
- Backgrounds: white, gray-50 alternating
- No multi-color gradients, no decorative blur blobs, no pink-to-yellow
- Typography: font-display (Nunito) for headings, font-sans (Inter) for body
- UI must look hand-crafted, not AI-generated

## Architecture & Code Quality

### Data Fetching
- Server-side filtering and pagination for ALL data lists
- Never fetch entire collections client-side
- URL-based state for filters (useSearchParams)
- React Query with appropriate staleTime (30s for lists, 60s for stats)
- API routes return: `{ success: boolean, data?: T, error?: string, pagination?: {...} }`

### Database
- ALL schema changes via Prisma migrations only (`yarn prisma migrate dev --name <desc>`)
- Never use `db push`, never edit migration files, never apply SQL directly
- Use proper indexes for filtered/sorted columns
- Singleton pattern for services (`getInstance()`)

### Security
- Validate all inputs with Zod on server
- Sanitize user content before storage
- Rate limiting on upload/generation endpoints
- Presigned URLs for S3 file access (5 min expiry)
- ADMIN_API_KEY for machine-to-machine auth (GitHub Actions)
- Clerk for user auth, token-based for Telegram review links

### Package Manager
- ALWAYS use yarn (never npm)
- Commands: `yarn install`, `yarn test`, `yarn dev`, `yarn build`

## Testing Standards (MANDATORY)

### Every new API route MUST have:
- At least 1 integration test covering the happy path
- At least 1 test for unauthorized access (401)
- At least 1 test for invalid input (400)

### Every new service/utility MUST have:
- Unit tests covering core logic
- Edge case coverage (empty inputs, null values)

### Every bug fix MUST include:
- A regression test that would have caught the bug

### Test commands:
```bash
yarn test:unit          # Unit tests with coverage
yarn test:integration   # Integration tests
yarn test:security      # Security tests
yarn test:e2e           # Playwright end-to-end
```

### Test naming convention:
```typescript
it('should return 401 when user is not authenticated', ...)
it('should create activity when all fields are valid', ...)
it('should skip duplicate activities during sync', ...)
```

### Before declaring work done:
1. `yarn test` — all must pass
2. `yarn build` — must compile without errors
3. No reduction in existing test coverage

## AI Usage (INTERNAL ONLY)

- AI is used internally to generate activities — NEVER mention this publicly
- Public messaging: all materials are "criados por fonoaudióloga"
- Post-MVP vision: private AI model trained on patient data to assess progress and suggest exercises
- The AI quality check, generation pipeline, and automation are implementation details, not features to advertise

## Git & Deployment

- Never commit without user permission
- Stage only files modified in current session (no `git add .`)
- Commit messages: `type(scope): description` (feat, fix, refactor, test, docs)
- Vercel auto-deploys from main branch
- GitHub Actions for: content generation (2x/week), S3 sync

## Quality Gates for Activities

- Dedup: no duplicate activity (same phoneme + type + ageRange + name)
- Quality check on creation: spelling, grammar, age-appropriateness, no emojis
- New activities start as PENDING_REVIEW unless they pass quality check
- Admin approval required via /dashboard/resources (Revisão tab) or Telegram
