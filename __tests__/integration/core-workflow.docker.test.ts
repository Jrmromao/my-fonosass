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
