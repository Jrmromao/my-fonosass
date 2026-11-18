// Runs `prisma migrate deploy` during the Vercel build, production only.
//
// Preview and Production share DATABASE_URL/DIRECT_URL in Vercel, so a
// preview build of an unmerged branch must never migrate the shared
// database. Locally (no VERCEL_ENV) it does nothing.
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

if (env !== 'production') {
  console.log(`[migrate] skipped (VERCEL_ENV=${env ?? 'unset'})`);
  process.exit(0);
}

console.log('[migrate] production build: prisma migrate deploy');
// Uses DIRECT_URL (schema directUrl), so it bypasses any connection pooler.
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
