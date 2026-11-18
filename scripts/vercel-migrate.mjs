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
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const env = process.env.VERCEL_ENV;

if (env !== 'production') {
  console.log(`[migrate] skipped (VERCEL_ENV=${env ?? 'unset'})`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// TEMPORARY one-time baseline. REMOVE in the commit after it has run once.
//
// The production database was never tracked by Prisma (no _prisma_migrations,
// so `migrate deploy` fails with P3005). On 2026-11-18 a read-only
// `prisma migrate diff` against production showed that it already matches
// every migration below, and differs only by the two newer ones
// (20261117_activity_type_alphabet, 20261118_anonymous_download_stats).
// So, only on P3005: mark exactly these as applied, then deploy normally.
// After this has run, a P3005 must fail the build again.
const BASELINE = [
  '20241125214551_imit_db',
  '20241201181817_add_patient_tutor_email',
  '20241201184807_update_db',
  '20241204204120_add_subscription_tables',
  '20241223175000_add_content_to_resources',
  '20241223180000_add_slug_to_resources',
  '20250322154916_update_db_tables_for_mvp',
  '20250323131121_add_column_for_phoneme',
  '20250504170148_update_activity_type_enum',
  '20250504170709_update_activity_type_enum',
  '20250919161654_add_download_limits',
  '20250919162427_add_download_history',
  '20250920120000_add_consent_management_tables',
  '20250921193952_add_blog_analytics',
  '20250923083218_add_download_model',
  '20250923164930_optimize_database_indexes',
  '20250928084428_add_resource_models',
  '20260522_add_activity_status',
  '20261026_activity_review_audit',
];
// ---------------------------------------------------------------------------

// Uses DIRECT_URL (schema directUrl), so it bypasses any connection pooler.
function prisma(args) {
  const res = spawnSync('npx', ['prisma', ...args], { encoding: 'utf8' });
  process.stdout.write(res.stdout ?? '');
  process.stderr.write(res.stderr ?? '');
  return { ok: res.status === 0, output: `${res.stdout}\n${res.stderr}` };
}

console.log('[migrate] production build: prisma migrate deploy');
let result = prisma(['migrate', 'deploy']);

if (!result.ok && result.output.includes('P3005')) {
  const missing = BASELINE.filter(
    (m) => !existsSync(`prisma/migrations/${m}/migration.sql`)
  );
  if (missing.length > 0) {
    console.error(`[migrate] baseline aborted, missing: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(
    `[migrate] P3005: one-time baseline of ${BASELINE.length} migrations`
  );
  for (const m of BASELINE) {
    if (!prisma(['migrate', 'resolve', '--applied', m]).ok) {
      console.error(`[migrate] baseline failed at ${m}`);
      process.exit(1);
    }
  }
  console.log('[migrate] baseline done, deploying pending migrations');
  result = prisma(['migrate', 'deploy']);
}

if (!result.ok) process.exit(1);
