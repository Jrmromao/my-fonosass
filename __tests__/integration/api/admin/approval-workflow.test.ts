import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/db', () => ({
  prisma: {
    activity: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Activity Approval Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/activities/pending', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: null });

      const { GET } = await import('@/app/api/admin/activities/pending/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return pending activities when authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.activity.findMany.mockResolvedValue([
        {
          id: 'act-1',
          name: 'Encontre e Circule - Animais',
          phoneme: 'P',
          difficulty: 'BEGINNER',
          ageRange: 'PRESCHOOL',
          status: 'PENDING_REVIEW',
        },
      ]);

      const { GET } = await import('@/app/api/admin/activities/pending/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activities).toHaveLength(1);
      expect(data.activities[0].status).toBe('PENDING_REVIEW');
    });
  });

  describe('POST /api/admin/activities/[id]/approve', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: null });

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/approve/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/approve',
        {
          method: 'POST',
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when activity does not exist', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.activity.findUnique.mockResolvedValue(null);

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/approve/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/approve',
        {
          method: 'POST',
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
    });

    it('should publish activity when approved', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.activity.findUnique.mockResolvedValue({
        id: 'act-1',
        status: 'PENDING_REVIEW',
      });
      prisma.activity.update.mockResolvedValue({
        id: 'act-1',
        status: 'PUBLISHED',
        isPublic: true,
      });

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/approve/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/approve',
        {
          method: 'POST',
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { status: 'PUBLISHED', isPublic: true, approvalToken: null },
      });
    });
  });

  describe('POST /api/admin/activities/[id]/discard', () => {
    it('should reject activity when discarded', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.activity.update.mockResolvedValue({
        id: 'act-1',
        status: 'REJECTED',
      });

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/discard/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/discard',
        {
          method: 'POST',
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.activity.update).toHaveBeenCalledWith({
        where: { id: 'act-1' },
        data: { status: 'REJECTED', isPublic: false, approvalToken: null },
      });
    });
  });

  describe('POST /api/admin/activities/[id]/reject-with-feedback', () => {
    it('should return 400 when feedback is too short', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: 'clerk-user-1' });

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/reject-with-feedback/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/reject-with-feedback',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: 'ab' }),
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('5 characters');
    });

    it('should return 404 when activity does not exist', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.activity.findUnique.mockResolvedValue(null);

      const { POST } = await import(
        '@/app/api/admin/activities/[id]/reject-with-feedback/route'
      );
      const request = new Request(
        'http://localhost:3000/api/admin/activities/act-1/reject-with-feedback',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: 'Erro ortografico no titulo' }),
        }
      );
      const response = await POST(request, {
        params: Promise.resolve({ id: 'act-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
    });
  });
});
