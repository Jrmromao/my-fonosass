#!/usr/bin/env node

/**
 * Almanaque da Fala Database Diagnostic Script
 *
 * This script safely diagnoses database issues without losing data.
 * NEVER suggests database reset or data loss.
 *
 * Usage: node scripts/db-diagnose.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Almanaque da Fala Database Diagnostic Tool');
console.log('=====================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    console.log('✅ Success');
    if (result.trim()) {
      console.log(result);
    }
  } catch (error) {
    console.log('❌ Error:');
    console.log(error.stdout || error.message);
  }
  console.log('');
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// 1. Check Prisma configuration
console.log('1️⃣ Checking Prisma Configuration');
console.log('----------------------------------');
runCommand('npx prisma validate', 'Validating Prisma schema');
runCommand('npx prisma --version', 'Checking Prisma version');

// 2. Check migration status
console.log('2️⃣ Checking Migration Status');
console.log('-----------------------------');
runCommand('npx prisma migrate status', 'Migration status');

// 3. Check for drift
console.log('3️⃣ Checking for Schema Drift');
console.log('-----------------------------');
runCommand('npx prisma db pull --print', 'Current database schema');

// 4. Check migration files
console.log('4️⃣ Checking Migration Files');
console.log('----------------------------');
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
if (checkFileExists('prisma/migrations')) {
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((item) => fs.statSync(path.join(migrationsDir, item)).isDirectory())
    .filter((item) => item !== '.DS_Store')
    .sort();

  console.log(`Found ${migrations.length} migration directories:`);
  migrations.forEach((migration) => {
    const migrationFile = path.join(migrationsDir, migration, 'migration.sql');
    if (fs.existsSync(migrationFile)) {
      console.log(`  ✅ ${migration}`);
    } else {
      console.log(`  ❌ ${migration} (missing migration.sql)`);
    }
  });
} else {
  console.log('❌ No migrations directory found');
}

// 5. Check environment
console.log('5️⃣ Checking Environment');
console.log('------------------------');
if (checkFileExists('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing');
}

if (checkFileExists('.env.local')) {
  console.log('✅ .env.local file exists');
} else {
  console.log('⚠️  .env.local file missing (optional)');
}

// 6. Recommendations
console.log('6️⃣ Recommendations');
console.log('-------------------');
console.log('Based on the diagnostic results:');
console.log('');
console.log('🚨 CRITICAL RULES:');
console.log('- NEVER use: prisma migrate reset (LOSES ALL DATA)');
console.log('- NEVER use: prisma db push (bypasses migration history)');
console.log('- ALWAYS create proper migration files for existing tables');
console.log('- ALWAYS use prisma migrate resolve for existing tables');
console.log('');
console.log('📋 Next Steps:');
console.log('1. If drift detected: Create migration file manually');
console.log('2. If tables exist but no migrations: Use prisma migrate resolve');
console.log(
  '3. If migrations exist but tables missing: Use prisma migrate deploy'
);
console.log('4. Always test database operations after resolution');
console.log('');
console.log('🔗 See: .cursor/workflows.md for detailed resolution steps');
