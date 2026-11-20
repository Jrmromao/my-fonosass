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
// Baseline: prisma/migrations starts with 0_init, the full schema squashed on
// 2026-11-19. A database created before that (production) already has the
// schema but no 0_init row, so running 0_init would fail ("already exists").
// adoptBaseline() records 0_init as applied there, but only when the live
// schema matches schema.prisma exactly. A new, empty database gets 0_init
// applied normally. A database that matches neither fails the build.
import { execSync, spawnSync } from 'node:child_process';
/* global process, console */

const BASELINE = '0_init';
const SCHEMA = 'prisma/schema.prisma';

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

// Prisma CLI with DATABASE_URL set to the direct connection: introspection
// and migrations bypass the pooler. The URL is passed through the
// environment, never on the command line.
function prisma(args) {
  const result = spawnSync('npx', ['prisma', ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

function fail(message, output) {
  console.error(`[migrate] ${message}`);
  if (output) console.error(output);
  process.exit(1);
}

function adoptBaseline() {
  // Exit code 0: live schema == schema.prisma. 2: they differ. 1: error.
  const diff = prisma([
    'migrate',
    'diff',
    '--from-schema-datasource',
    SCHEMA,
    '--to-schema-datamodel',
    SCHEMA,
    '--exit-code',
  ]);
  if (diff.status === 2) {
    // Empty database (0_init will run) or pending migrations (deploy applies
    // them). Nothing to adopt.
    console.log('[migrate] schema differs from the database: no adoption');
    return;
  }
  if (diff.status !== 0) {
    fail('could not compare the database with schema.prisma', diff.output);
  }

  const resolve = prisma(['migrate', 'resolve', '--applied', BASELINE]);
  if (resolve.status === 0) {
    console.log(
      `[migrate] database already matches schema.prisma: recorded ${BASELINE} as applied`
    );
  } else if (resolve.output.includes('P3008')) {
    // Already recorded: the usual case after the first adoption.
    console.log(`[migrate] ${BASELINE} already recorded`);
  } else {
    fail(`could not record ${BASELINE} as applied`, resolve.output);
  }
}

adoptBaseline();
execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
