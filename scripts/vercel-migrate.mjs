// Runs `prisma migrate deploy` during the Vercel build.
//
// - Production: always.
// - Preview: only when PREVIEW_RUN_MIGRATIONS=true. Set it in Vercel for
//   Preview *scoped to the UAT branch* (feat/stripe-billing), whose
//   DATABASE_URL/DIRECT_URL point at the separate preview database
//   (AdF_preview). Other preview branches never migrate, so an unmerged
//   branch can't change a database it shares with others.
// - Locally (no VERCEL_ENV): nothing.
//
// Migrations run before the new code goes live while the old deployment is
// still serving, so they must be backward compatible (add, don't drop or
// rename in the same release). If a migration fails, the build fails and
// the current deployment stays live. Rule: .kiro/rules.md -> Database ->
// "Production migrations".
//
// History: the production database was baselined once on 2026-11-18
// (commit 98fde97). A P3005 now means something is wrong: investigate,
// don't baseline again.
import { execSync } from 'node:child_process';

const env = process.env.VERCEL_ENV;
const previewOptIn = process.env.PREVIEW_RUN_MIGRATIONS === 'true';
const branch = process.env.VERCEL_GIT_COMMIT_REF ?? 'unknown';

if (env === 'production') {
  console.log('[migrate] production build: prisma migrate deploy');
} else if (env === 'preview' && previewOptIn) {
  console.log(`[migrate] preview build (${branch}): prisma migrate deploy`);
} else {
  console.log(
    `[migrate] skipped (VERCEL_ENV=${env ?? 'unset'}, branch=${branch}, PREVIEW_RUN_MIGRATIONS=${previewOptIn})`
  );
  process.exit(0);
}

// Uses DIRECT_URL (schema directUrl), so it bypasses any connection pooler.
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
