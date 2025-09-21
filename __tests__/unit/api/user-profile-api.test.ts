import { GET, PUT } from '@/app/api/user/profile/route';
import { prisma } from '@/app/db';
import { CacheManager, QueryCache } from '@/lib/performance/cacheManager';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Mock NextRequest
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || 'GET',
    headers: new Map(Object.entries(init?.headers || {})),
    json: jest.fn().mockResolvedValue(JSON.parse(init?.body || '{}')),
  })),
}));

// Mock dependencies
jest.mock('@/app/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    downloadHistory: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    downloadLimit: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock the SecurityMiddleware.apply method
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: {
    apply: jest.fn().mockResolvedValue({ success: true }),
    createSecureResponse: jest.fn((data) => ({
      json: () => data,
      status: 200,
    })),
    createErrorResponse: jest.fn((message, status) => ({
      json: () => ({ error: message }),
      status,
    })),
  },
}));

jest.mock('@/lib/performance/cacheManager', () => ({
  QueryCache: {
    get: jest.fn(),
    invalidate: jest.fn(),
  },
  CacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
  withCaching: jest.fn((fn, options) => fn),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockQueryCache = QueryCache as jest.Mocked<typeof QueryCache>;
const mockCacheManager = CacheManager as jest.Mocked<typeof CacheManager>;

const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'USER',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  subscriptions: {
    status: 'ACTIVE',
    tier: 'FREE',
    currentPeriodEnd: null,
  },
};

const mockDownloadHistory = [
  {
    id: 'download_1',
    fileName: 'activity1.pdf',
    downloadedAt: new Date('2024-01-15'),
    activity: {
      id: 'activity_1',
      name: 'Test Activity',
      type: 'SPEECH',
      phoneme: 's',
      difficulty: 'BEGINNER',
    },
  },
];

const mockDownloadLimit = {
  id: 'limit_1',
  userId: 'user_123',
  downloads: 2,
  resetDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('/api/user/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryCache.get.mockImplementation((key, fn) => fn());
    mockCacheManager.get.mockReturnValue(null);
    mockCacheManager.set.mockImplementation(() => {});
    mockPrisma.downloadHistory.count.mockResolvedValue(5);
    mockPrisma.downloadHistory.findFirst.mockResolvedValue({
      downloadedAt: new Date(),
    });
    mockPrisma.downloadHistory.findMany.mockResolvedValue(mockDownloadHistory);
    mockPrisma.downloadHistory.groupBy.mockResolvedValue([
      { activityId: 'activity_1' },
    ]);
    mockPrisma.downloadLimit.findUnique.mockResolvedValue(mockDownloadLimit);
  });

  describe('GET /api/user/profile', () => {
    it('should return user profile successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.user).toEqual({
        id: 'user_123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      expect(data.data.subscription).toEqual({
        tier: 'FREE',
        status: 'ACTIVE',
        currentPeriodEnd: undefined,
      });
      expect(data.data.downloadLimits).toEqual({
        canDownload: true,
        remaining: 3,
        isPro: false,
      });
      expect(data.data.stats).toEqual({
        totalDownloads: 5,
        uniqueActivities: 1,
        recentDownloads: expect.any(Number),
      });
      expect(data.data.recentDownloads).toHaveLength(1);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 404 when user is not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);

      expect(response.status).toBe(404);
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    it('should handle pro users correctly', async () => {
      const proUser = {
        ...mockUser,
        subscriptions: {
          status: 'ACTIVE',
          tier: 'PRO',
          currentPeriodEnd: new Date('2024-12-31'),
        },
      };

      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockResolvedValue(proUser);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.subscription.tier).toBe('PRO');
      expect(data.data.downloadLimits.isPro).toBe(true);
      expect(data.data.downloadLimits.remaining).toBe(Infinity);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        fullName: 'Updated Name',
        email: 'updated@example.com',
      };

      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            fullName: 'Updated Name',
            email: 'updated@example.com',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Profile updated successfully');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'user_123' },
        data: {
          fullName: 'Updated Name',
          email: 'updated@example.com',
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            fullName: 'Updated Name',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PUT(request);

      expect(response.status).toBe(401);
    });

    it('should handle update errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.update.mockRejectedValue(new Error('Update failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            fullName: 'Updated Name',
            email: 'valid@example.com',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PUT(request);

      expect(response.status).toBe(500);
    });

    it('should invalidate caches after update', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: JSON.stringify({
            fullName: 'Updated Name',
            email: 'valid@example.com',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      await PUT(request);

      expect(mockQueryCache.invalidate).toHaveBeenCalledWith(
        'user:profile:user_123'
      );
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'user:stats:user_123'
      );
      expect(mockCacheManager.delete).toHaveBeenCalledWith(
        'user:profile:user_123'
      );
    });
  });
});
