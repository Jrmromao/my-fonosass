---
name: db-ops
description: Database operations for Almanaque da Fala — applying Prisma migrations to prod/dev, checking migration status, and loading DB/service credentials from .env.db. Use when a task involves prisma migrate, a "column does not exist" / schema-drift error, syncing S3 activities to the DB, or running DB commands that need prod credentials.
---

# DB Ops — Almanaque da Fala

Safe, migrations-only database workflow. Credentials live in **`.env.db`**
(git-ignored); the wrapper script is **`scripts/db.sh`**.

## Absolute rules (never break)

- **Migrations only.** Schema changes go through `prisma migrate` exclusively.
  `prisma db push`, `prisma db execute`, and raw SQL against prod are
  **forbidden**. `scripts/db.sh` refuses `push`/`execute` by design.
- **Never commit `.env.db`** or echo its secret values into chat/logs. It is
  covered by `.gitignore` (`.env*`). Reference keys by name, not value.
- **The agent does not run `migrate deploy` against production unprompted.**
  Production schema changes require the user's explicit go-ahead. Prepare the
  commands; the user (or an authorized, confirmed run) executes them.

## Credentials

All DB/service creds are in `.env.db` at the repo root (placeholders until the
user fills them). Required for migrations:
- `DATABASE_URL` — pooled app connection.
- `DIRECT_URL` — direct (non-pooled) connection; `migrate deploy` needs this on
  hosts that pool (Supabase/Neon: the `:5432` non-pooler URL).

`scripts/db.sh` auto-sources `.env.db`. To load manually:
`set -a; source .env.db; set +a`.

## Common tasks

```bash
./scripts/db.sh status     # applied vs pending migrations (read-only, safe)
./scripts/db.sh deploy     # apply pending migrations (prod-safe, non-interactive)
./scripts/db.sh new <name> # DEV ONLY: create + apply a new migration
./scripts/db.sh url        # print target host/db with the password masked
```

Equivalent raw commands (when the util isn't used):
```bash
npx prisma migrate status
npx prisma migrate deploy     # prod
npx prisma migrate dev --name <desc>   # dev
```

## Deploys apply migrations automatically

`vercel.json` sets `buildCommand` to
`prisma generate && prisma migrate deploy && next build`, so every Vercel
deploy applies pending migrations at build time. This requires `DATABASE_URL`
to be present in the **build** environment, not just runtime. A `vercel-build`
script alone is NOT enough if the Vercel dashboard has an explicit Build
Command — the dashboard overrides it, so keep the command in `vercel.json`.

## Troubleshooting: "The column X does not exist in the current database"

This is schema drift: a migration is committed in code but not applied to that
database. Fix:
1. `./scripts/db.sh status` → confirm the migration is listed as **pending**.
2. `./scripts/db.sh deploy` → apply it (with prod creds loaded).
3. Re-run whatever failed (e.g. the S3→DB sync).

Do **not** work around it with `db push` or by editing the DB directly.

## Syncing S3 activities to the DB

The `Generate Content` GH Action uploads PDFs to S3, then POSTs
`/api/admin/sync-activities` (auth: `ADMIN_API_KEY`) to register them. To
re-sync without regenerating:
```bash
gh workflow run "Sync S3 Activities to DB"
```
The sync route returns a `detail` field with the real error for authenticated
machine callers — read it from the Action log to diagnose failures. A failing
sync now fails the job (non-200 → exit 1), so a red run is surfacing the real
error, not a new problem.
