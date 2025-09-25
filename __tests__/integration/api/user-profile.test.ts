import { GET, PUT } from '@/app/api/user/profile/route';

// Mock NextRequest directly in the test file
class MockNextRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  body: string | null;

  constructor(url: string, init: any = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map();
    this.body = init.body || null;

    // Set headers
    if (init.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value as string);
      });
    }
  }

  async json() {
    if (!this.body) {
      throw new Error('Request body is null');
    }

    try {
      return JSON.parse(this.body);
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  }

  async text() {
    return this.body || '';
  }

  async formData() {
    return new FormData();
  }

  clone() {
    return new MockNextRequest(this.url, {
      method: this.method,
      body: this.body,
      headers: Object.fromEntries(this.headers.entries()),
    });
  }
}

const NextRequest = MockNextRequest;

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock('@/app/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    downloadHistory: {
      aggregate: jest.fn(),
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

// Mock performance modules
jest.mock('@/lib/performance/cacheManager', () => ({
  CacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
  QueryCache: {
    get: jest.fn(),
    invalidate: jest.fn(),
  },
  withCaching: jest.fn((handler) => handler),
}));

// Mock security middleware
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: {
    apply: jest.fn().mockResolvedValue({ success: true }),
    createSecureResponse: jest.fn((data, status = 200) => ({
      json: () => Promise.resolve(data),
      status,
    })),
    createErrorResponse: jest.fn((error, status = 400) => ({
      json: () =>
        Promise.resolve({ error, timestamp: new Date().toISOString() }),
      status,
    })),
  },
}));

describe('/api/user/profile', () => {
  const mockAuth = require('@clerk/nextjs/server').auth;
  const mockPrisma = require('@/app/db').prisma;
  const { QueryCache } = require('@/lib/performance/cacheManager');
  const { CacheManager } = require('@/lib/performance/cacheManager');
  const mockQueryCache = QueryCache;
  const mockCacheManager = CacheManager;

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
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    QueryCache.get.mockImplementation((key, fn) => fn());
    CacheManager.get.mockReturnValue(null);
    CacheManager.set.mockImplementation(() => {});
    mockPrisma.downloadHistory.count.mockResolvedValue(5);
    mockPrisma.downloadHistory.findFirst.mockResolvedValue({
      downloadedAt: new Date(),
    });
    mockPrisma.downloadHistory.findMany.mockResolvedValue([]);
    mockPrisma.downloadHistory.groupBy.mockResolvedValue([]);
    mockPrisma.downloadLimit.findUnique.mockResolvedValue(null);
  });

  describe('GET /api/user/profile', () => {
    it('should return user profile successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      // Mock QueryCache.get to return the user data
      mockQueryCache.get.mockResolvedValue(mockUser);

      // Mock the additional database queries
      mockPrisma.downloadHistory.aggregate.mockResolvedValue({
        _count: { id: 5 },
      });
      mockPrisma.downloadHistory.findMany.mockResolvedValueOnce([
        { activityId: 'activity_1' },
      ]);
      mockPrisma.downloadHistory.count.mockResolvedValue(3);
      mockPrisma.downloadHistory.findMany.mockResolvedValueOnce(
        mockDownloadHistory
      );
      mockPrisma.downloadLimit.findUnique.mockResolvedValue({
        downloads: 0,
      });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            fullName: 'Test User',
            role: 'USER',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          subscription: {
            tier: 'FREE',
            status: 'ACTIVE',
            currentPeriodEnd: undefined,
          },
          downloadLimits: {
            canDownload: true,
            remaining: 5,
            isPro: false,
          },
          stats: expect.any(Object),
          recentDownloads: expect.any(Array),
        },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Authentication required',
        timestamp: expect.any(String),
      });
    });

    it('should return 404 when user is not found', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'User not found',
        timestamp: expect.any(String),
      });
    });

    it('should handle database errors', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/user/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch user profile',
        timestamp: expect.any(String),
      });
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile successfully', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        fullName: 'Updated Name',
        email: 'updated@example.com',
      });

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
      expect(data).toEqual({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: 'user_123',
            email: 'updated@example.com',
            fullName: 'Updated Name',
            role: 'USER',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { clerkUserId: 'user_123' },
        data: {
          fullName: 'Updated Name',
          email: 'updated@example.com',
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          updatedAt: true,
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
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Authentication required',
        timestamp: expect.any(String),
      });
    });

    it('should return 500 when request body is invalid', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });

      const request = new NextRequest(
        'http://localhost:3000/api/user/profile',
        {
          method: 'PUT',
          body: 'invalid json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to update profile',
        timestamp: expect.any(String),
      });
    });

    it('should handle database errors during update', async () => {
      mockAuth.mockResolvedValue({ userId: 'user_123' });
      mockPrisma.user.update.mockRejectedValue(new Error('Database error'));

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
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to update profile',
        timestamp: expect.any(String),
      });
    });
  });
});
