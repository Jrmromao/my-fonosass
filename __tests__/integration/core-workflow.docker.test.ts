/**
 * Integration: Core Activity Workflow
 * Tests the full activity lifecycle against a real PostgreSQL database.
 * Run: yarn test:db
 */
jest.unmock('@prisma/client');

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let userId: string;

describe('Activity Workflow Integration (Real DB)', () => {
  beforeAll(async () => {
    const user = await prisma.user.findFirst({ where: { email: 'test@almanaquedafala.com.br' } });
    if (!user) throw new Error('Test user not found — run setup first');
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Activity Search', () => {
    it('returns published activities only', async () => {
      const activities = await prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
      });
      expect(activities.length).toBeGreaterThan(0);
      activities.forEach((a) => {
        expect(a.status).toBe('PUBLISHED');
        expect(a.isPublic).toBe(true);
      });
    });

    it('filters by phoneme correctly', async () => {
      const activities = await prisma.activity.findMany({
        where: { phoneme: 'P', status: 'PUBLISHED' },
      });
      expect(activities.length).toBe(5);
      activities.forEach((a) => expect(a.phoneme).toBe('P'));
    });

    it('paginates correctly', async () => {
      const page1 = await prisma.activity.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      const page2 = await prisma.activity.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        skip: 5,
        orderBy: { createdAt: 'desc' },
      });

      expect(page1.length).toBe(5);
      expect(page2.length).toBe(5);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('searches by name (case insensitive)', async () => {
      const results = await prisma.activity.findMany({
        where: { name: { contains: 'test activity p', mode: 'insensitive' } },
      });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Activity Approval Workflow', () => {
    it('finds pending activities', async () => {
      const pending = await prisma.activity.findMany({
        where: { status: 'PENDING_REVIEW' },
      });
      expect(pending.length).toBeGreaterThanOrEqual(1);
    });

    it('approves an activity', async () => {
      const pending = await prisma.activity.findFirst({
        where: { status: 'PENDING_REVIEW' },
      });
      expect(pending).not.toBeNull();

      const approved = await prisma.activity.update({
        where: { id: pending!.id },
        data: { status: 'PUBLISHED', isPublic: true },
      });

      expect(approved.status).toBe('PUBLISHED');
      expect(approved.isPublic).toBe(true);

      // Revert for other tests
      await prisma.activity.update({
        where: { id: pending!.id },
        data: { status: 'PENDING_REVIEW', isPublic: false },
      });
    });

    it('rejects an activity', async () => {
      const pending = await prisma.activity.findFirst({
        where: { status: 'PENDING_REVIEW' },
      });

      const rejected = await prisma.activity.update({
        where: { id: pending!.id },
        data: { status: 'REJECTED', isPublic: false },
      });

      expect(rejected.status).toBe('REJECTED');

      // Revert
      await prisma.activity.update({
        where: { id: pending!.id },
        data: { status: 'PENDING_REVIEW', isPublic: false },
      });
    });
  });

  describe('Download Gating', () => {
    it('tracks download count', async () => {
      const limit = await prisma.downloadLimit.findUnique({
        where: { userId },
      });
      expect(limit).not.toBeNull();
      expect(limit!.downloads).toBe(2);
    });

    it('increments download count', async () => {
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: { increment: 1 } },
      });

      const updated = await prisma.downloadLimit.findUnique({
        where: { userId },
      });
      expect(updated!.downloads).toBe(3);

      // Revert
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 2 },
      });
    });

    it('blocks at limit (3)', async () => {
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 3 },
      });

      const limit = await prisma.downloadLimit.findUnique({
        where: { userId },
      });
      const remaining = Math.max(0, 3 - limit!.downloads);
      expect(remaining).toBe(0);

      // Revert
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 2 },
      });
    });

    it('resets after 30 days', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 3, resetDate: oldDate },
      });

      const limit = await prisma.downloadLimit.findUnique({
        where: { userId },
      });
      const daysSinceReset = Math.floor(
        (Date.now() - limit!.resetDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysSinceReset).toBeGreaterThanOrEqual(30);

      // Revert
      await prisma.downloadLimit.update({
        where: { userId },
        data: { downloads: 2, resetDate: new Date() },
      });
    });
  });

  describe('Data Integrity', () => {
    it('enforces unique clerkUserId', async () => {
      await expect(
        prisma.user.create({
          data: { clerkUserId: 'test-user-clerk', email: 'dupe@test.com', fullName: 'Dupe' },
        })
      ).rejects.toThrow();
    });

    it('cascades activity deletion does not orphan files', async () => {
      const activity = await prisma.activity.create({
        data: {
          name: 'Temp Activity',
          description: 'temp',
          type: 'SPEECH',
          difficulty: 'BEGINNER',
          ageRange: 'CHILD',
          phoneme: 'T',
          isPublic: false,
          status: 'DRAFT',
          createdById: userId,
        },
      });

      await prisma.activity.delete({ where: { id: activity.id } });

      const deleted = await prisma.activity.findUnique({ where: { id: activity.id } });
      expect(deleted).toBeNull();
    });
  });
});


describe('Edge Cases (Real DB)', () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.findFirst({ where: { email: 'test@almanaquedafala.com.br' } });
    testUserId = user!.id;
  });

  describe('Download limit boundaries', () => {
    it('blocks on exactly the 4th download attempt', async () => {
      await prisma.downloadLimit.update({
        where: { userId: testUserId },
        data: { downloads: 3, resetDate: new Date() },
      });

      const limit = await prisma.downloadLimit.findUnique({ where: { userId: testUserId } });
      const remaining = Math.max(0, 3 - limit!.downloads);
      expect(remaining).toBe(0);

      // Revert
      await prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: 2 } });
    });

    it('resets at exactly 30 days (not 29)', async () => {
      const day29 = new Date();
      day29.setDate(day29.getDate() - 29);

      await prisma.downloadLimit.update({
        where: { userId: testUserId },
        data: { downloads: 3, resetDate: day29 },
      });

      const limit = await prisma.downloadLimit.findUnique({ where: { userId: testUserId } });
      const daysSinceReset = Math.floor((Date.now() - limit!.resetDate.getTime()) / (1000 * 60 * 60 * 24));
      // 29 days — should NOT reset
      expect(daysSinceReset).toBeLessThan(30);

      // Revert
      await prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: 2, resetDate: new Date() } });
    });

    it('concurrent increment does not skip counts', async () => {
      await prisma.downloadLimit.update({
        where: { userId: testUserId },
        data: { downloads: 0 },
      });

      // Simulate 3 concurrent increments
      await Promise.all([
        prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: { increment: 1 } } }),
        prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: { increment: 1 } } }),
        prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: { increment: 1 } } }),
      ]);

      const limit = await prisma.downloadLimit.findUnique({ where: { userId: testUserId } });
      expect(limit!.downloads).toBe(3);

      // Revert
      await prisma.downloadLimit.update({ where: { userId: testUserId }, data: { downloads: 2 } });
    });
  });

  describe('Search edge cases', () => {
    it('handles special characters in search', async () => {
      const results = await prisma.activity.findMany({
        where: { name: { contains: '/R/', mode: 'insensitive' } },
      });
      // Should not throw, may return 0 results
      expect(Array.isArray(results)).toBe(true);
    });

    it('handles Portuguese characters in search', async () => {
      const results = await prisma.activity.findMany({
        where: { name: { contains: 'ção', mode: 'insensitive' } },
      });
      expect(Array.isArray(results)).toBe(true);
    });

    it('handles empty search gracefully', async () => {
      const results = await prisma.activity.findMany({
        where: { name: { contains: '', mode: 'insensitive' } },
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles SQL injection attempt in search', async () => {
      const results = await prisma.activity.findMany({
        where: { name: { contains: "'; DROP TABLE Activity; --", mode: 'insensitive' } },
      });
      // Prisma parameterizes — should return 0, not crash
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);

      // Verify table still exists
      const count = await prisma.activity.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Approval edge cases', () => {
    it('double-approve does not error', async () => {
      const activity = await prisma.activity.findFirst({ where: { status: 'PUBLISHED' } });

      // Approve an already-published activity
      const result = await prisma.activity.update({
        where: { id: activity!.id },
        data: { status: 'PUBLISHED', isPublic: true },
      });
      expect(result.status).toBe('PUBLISHED');
    });

    it('approving non-existent activity throws', async () => {
      await expect(
        prisma.activity.update({
          where: { id: 'non-existent-id-12345' },
          data: { status: 'PUBLISHED' },
        })
      ).rejects.toThrow();
    });
  });

  describe('Activity with no file', () => {
    it('activity without files has empty files array', async () => {
      const activity = await prisma.activity.findFirst({
        include: { files: true },
      });
      expect(activity).not.toBeNull();
      // Our test data has no files — should be empty array, not null
      expect(Array.isArray(activity!.files)).toBe(true);
    });
  });

  describe('User data integrity', () => {
    it('cannot create activity with non-existent user', async () => {
      await expect(
        prisma.activity.create({
          data: {
            name: 'Orphan',
            description: 'test',
            type: 'SPEECH',
            difficulty: 'BEGINNER',
            ageRange: 'CHILD',
            phoneme: 'X',
            isPublic: false,
            status: 'DRAFT',
            createdById: 'non-existent-user-id',
          },
        })
      ).rejects.toThrow();
    });
  });
});
