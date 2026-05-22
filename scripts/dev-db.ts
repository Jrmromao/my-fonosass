/**
 * Start a local PostgreSQL via Docker for development.
 * Usage: npx tsx scripts/dev-db.ts
 *
 * This starts a Postgres container and runs migrations.
 * The connection string is printed — copy it to .env as DATABASE_URL.
 */
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { execSync } from 'child_process';

let container: StartedTestContainer;

async function main() {
  console.log('🐘 Starting PostgreSQL container...');

  container = await new GenericContainer('postgres:15')
    .withEnvironment({
      POSTGRES_DB: 'fonosaas',
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
    })
    .withExposedPorts(5432)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const url = `postgresql://postgres:postgres@${host}:${port}/fonosaas`;

  console.log(`\n✅ PostgreSQL running on port ${port}`);
  console.log(`\n📋 Connection string:\n   DATABASE_URL="${url}"\n`);

  // Run migrations
  console.log('🔄 Running migrations...');
  execSync(`DATABASE_URL='${url}' npx prisma migrate deploy`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // Generate client
  execSync('npx prisma generate', { stdio: 'inherit', cwd: process.cwd() });

  console.log('\n🎉 Database ready! Container will stay running.');
  console.log('   Press Ctrl+C to stop.\n');

  // Keep alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping container...');
    await container.stop();
    process.exit(0);
  });

  // Block forever
  await new Promise(() => {});
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
