import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export async function setupDockerTest() {
  const testDbUrl = process.env.DATABASE_URL || 'postgresql://testuser:testpass@localhost:5433/fonosass_test';
  process.env.DATABASE_URL = testDbUrl;
  process.env.DIRECT_URL = testDbUrl;

  const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;

  if (!isCI) {
    const { execSync } = require('child_process');
    console.log('Starting PostgreSQL test container...');
    try {
      execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
      await waitForDatabase();
      console.log('Applying schema...');
      execSync('npx prisma db push --force-reset --accept-data-loss', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: testDbUrl, DIRECT_URL: testDbUrl, PATH: process.env.PATH },
      });
    } catch (error) {
      console.error('Failed to start Docker:', error);
      throw error;
    }
  }

  prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });

  console.log('Seeding test data...');
  await seedTestData();

  return prisma;
}

async function waitForDatabase() {
  const { execSync } = require('child_process');
  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    try {
      execSync('docker-compose -f docker-compose.test.yml exec -T test-postgres pg_isready -U testuser -d fonosass_test', { stdio: 'pipe' });
      console.log('Database ready');
      return;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Database failed to start');
}

async function seedTestData() {
  const user = await prisma.user.upsert({
    where: { clerkUserId: 'test-user-clerk' },
    create: { clerkUserId: 'test-user-clerk', email: 'test@almanaquedafala.com.br', fullName: 'Test User', role: 'ADMIN' },
    update: {},
  });

  // Seed activities
  const phonemes = ['P', 'R', 'S'];
  for (const phoneme of phonemes) {
    for (let i = 0; i < 5; i++) {
      await prisma.activity.create({
        data: {
          name: `Test Activity ${phoneme}-${i}`,
          description: `Test description for phoneme /${phoneme}/`,
          type: 'SPEECH',
          difficulty: 'BEGINNER',
          ageRange: 'CHILD',
          phoneme,
          isPublic: true,
          status: 'PUBLISHED',
          createdById: user.id,
        },
      });
    }
  }

  // Pending activities
  await prisma.activity.create({
    data: {
      name: 'Pending Activity',
      description: '{"titulo":"Test","objetivo":"Test"}',
      type: 'SPEECH',
      difficulty: 'BEGINNER',
      ageRange: 'CHILD',
      phoneme: 'R',
      isPublic: false,
      status: 'PENDING_REVIEW',
      createdById: user.id,
    },
  });

  // Download limit
  await prisma.downloadLimit.create({
    data: { userId: user.id, downloads: 2, resetDate: new Date() },
  });

  console.log('Test data seeded: 15 activities + 1 pending');
}

export async function teardownDockerTest() {
  if (prisma) {
    await prisma.activity.deleteMany({});
    await prisma.downloadLimit.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  }

  const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
  if (!isCI) {
    const { execSync } = require('child_process');
    console.log('Stopping test containers...');
    execSync('docker-compose -f docker-compose.test.yml down -v', { stdio: 'inherit' });
  }
}

export function getTestPrisma() {
  return prisma;
}
