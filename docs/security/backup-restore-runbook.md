# Backup and restore runbook

Draft for the owner. **A backup that was never restored is not a backup.**
Several answers below are unknown from the code and must be filled in from the
hosting dashboards. Nothing here was tested by the author.

> Note: `lib/backup/backupManager.ts` in the repo is not a working backup
> (it is not wired to any job or storage). Do not rely on it.

## What must be recoverable

| Data | Where it lives | Recoverable how |
|---|---|---|
| Users, subscriptions, consents, downloads, requests, audit trail | PostgreSQL (`DATABASE_URL`) | Database backup / point-in-time restore |
| Activity files (PDFs, images), blog images | AWS S3 bucket (`AWS_S3_BUCKET_NAME`) | S3 versioning (+ optional cross-region replication) |
| Logins, passwords, sessions | Clerk | Clerk's own service; export users if you need an offline copy |
| Payments, invoices | Stripe | Stripe's records |
| Code and config | Git repository, Vercel env vars | Git history; keep an encrypted copy of env var **names and owners** (not values) |

## Fill in (check each in the provider dashboard)

- [ ] Where is the production database hosted? _(provider, region)_
- [ ] Automated backups on? Retention days: ___ . Point-in-time recovery? ___
- [ ] Backups encrypted? Stored in another region/account? ___
- [ ] S3 versioning enabled? Lifecycle rules? Bucket not public? ___
- [ ] Who can restore, and do they have access today? ___
- [ ] Target recovery time (RTO) and acceptable data loss (RPO): ___ / ___
  (suggestion for this stage: RTO 4 h, RPO 24 h)

## Restore test (do this now, then every 6 months)

1. Restore the latest backup **into a new, separate database** (never over
   production).
2. Point a local or preview build at it (`DATABASE_URL`, `DIRECT_URL`).
3. Check: `npx prisma migrate status` shows up to date; row counts for `User`,
   `Subscription`, `Activity`, `ConsentRecord` match production within the RPO;
   sign in as a test user and download one activity.
4. Record: date, backup used, time it took, problems. Delete the test database.
5. If it took longer than the RTO or failed, fix the process and repeat.

## If production data is lost or corrupted

1. Stop writes if possible (put the app in maintenance mode or revoke the DB
   user's write rights). Keep the damaged database for evidence.
2. Restore to a new database (as above) and verify.
3. Switch `DATABASE_URL`/`DIRECT_URL` in Vercel to the restored database and redeploy.
4. Reconcile the gap: Stripe events since the backup can be replayed from the
   Stripe dashboard (the webhook is idempotent, so replays are safe); users
   created in Clerk after the backup are recreated by the Clerk webhook when
   they next sign in.
5. Tell users if their data was affected (see `incident-response.md`).

## Migrations

Production migrations run in the Vercel build (`scripts/vercel-migrate.mjs`)
before the new code goes live and must be additive. Take or confirm a fresh
backup before any release that contains a migration that is not purely
additive.
