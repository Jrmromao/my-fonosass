# OWASP ASVS Level 1: self-assessment (partial)

A first pass by the author against the ASVS chapters, based on code review and
the tests run during the 2026-11 audit. "Met" means checked in code or by a
test; "Partly" and "Not assessed" are honest gaps. This is not an independent
assessment.

| Chapter | Status | Notes |
|---|---|---|
| V1 Architecture, threat modelling | Partly | Audit report exists; no formal threat model |
| V2 Authentication | Met (delegated) | Clerk handles credentials, MFA, sessions; verify MFA is enforced for admins in the Clerk dashboard |
| V3 Session management | Met (delegated) | Clerk cookies; Origin check on cross-site API mutations |
| V4 Access control | Met | Role check inside every admin handler; middleware as second layer; ownership checks on user data; tests for the guards |
| V5 Validation, sanitization, encoding | Met | Zod on inputs, sanitize-html on rendered markdown, JSON-LD escaped, parameterized queries (Prisma), no raw SQL |
| V6 Stored cryptography | Partly | Passwords and cards are not stored by us; confirm database encryption at rest with the host |
| V7 Error handling and logging | Partly | Generic errors to clients; audit trail for admin actions; no central alerting |
| V8 Data protection | Partly | Export/delete/correct flows, retention aligned with policy; database and S3 encryption not verified |
| V9 Communication | Met | HTTPS and HSTS via Vercel; webhooks verified by signature |
| V10 Malicious code | Partly | Dependabot and CI audit/secret scan configured; lockfile enforced |
| V11 Business logic | Met | Premium access checked server-side; webhooks idempotent; rate limits on abuse-prone routes |
| V12 Files and resources | Partly | Admin-only uploads with type and magic-byte checks; presigned downloads; no antivirus scanning |
| V13 API | Met | Authenticated routes, validated bodies, size limits on public endpoints |
| V14 Configuration | Partly | Security headers and CSP set; CSP still allows `'unsafe-inline'` on public pages and any `https:` host for images/connections (report-only strict policy in rollout) |

## Next steps to close the gaps

1. Enforce MFA for admin users in Clerk.
2. Confirm encryption at rest (database, S3) and S3 public-access block.
3. Promote the report-only CSP to enforcing after reviewing `security.csp_violation` events.
4. Add alerting on spikes of `security.*` audit events.
5. Run an independent penetration test before a major launch or expansion.
