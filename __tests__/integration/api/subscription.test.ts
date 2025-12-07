import { beforeEach, describe, expect, it } from '@jest/globals';

describe('Subscription API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/stripe/create-checkout', () => {
    it('should create checkout session for authenticated user', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');
      const { stripe } = require('@/lib/stripe');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });
      stripe.checkout.sessions.create.mockResolvedValue({
        url: 'https://checkout.stripe.com/session-123',
      });

      // Mock environment variable
      process.env.STRIPE_MONTHLY_PRICE_ID = 'price_123';

      // Act
      const { POST } = await import('@/app/api/stripe/create-checkout/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-checkout',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.url).toBe('https://checkout.stripe.com/session-123');
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        line_items: [
          {
            price: 'price_123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: expect.stringContaining('/dashboard'),
        cancel_url: expect.stringContaining('/settings/billing'),
        metadata: {
          clerkUserId: 'clerk-user-1',
          userId: 'user-1',
        },
        customer_email: 'test@example.com',
      });
    });

    it('should return 401 for unauthenticated user', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: null });

      // Act
      const { POST } = await import('@/app/api/stripe/create-checkout/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-checkout',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for user not found', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue(null);

      // Act
      const { POST } = await import('@/app/api/stripe/create-checkout/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-checkout',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 500 for missing price ID', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      // Remove price ID
      delete process.env.STRIPE_MONTHLY_PRICE_ID;

      // Act
      const { POST } = await import('@/app/api/stripe/create-checkout/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-checkout',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Server configuration error');
    });
  });

  describe('POST /api/stripe/create-portal', () => {
    it('should create portal session for pro user', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');
      const { stripe } = require('@/lib/stripe');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: {
          paymentId: 'sub_123',
        },
      });
      stripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session-123',
      });

      // Act
      const { POST } = await import('@/app/api/stripe/create-portal/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-portal',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.url).toBe('https://billing.stripe.com/session-123');
    });

    it('should return 404 for user without subscription', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: null,
      });

      // Act
      const { POST } = await import('@/app/api/stripe/create-portal/route');
      const request = {
        url: 'http://localhost:3000/api/stripe/create-portal',
        method: 'POST',
        headers: new Headers(),
      } as any;

      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('No active subscription found');
    });
  });

  describe('GET /api/download-limit', () => {
    it('should return download limit for free user', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: null,
      });
      prisma.download.count.mockResolvedValue(3);

      // Act
      const { GET } = await import('@/app/api/download-limit/route');
      const request = {
        url: 'http://localhost:3000/api/download-limit',
        method: 'GET',
        headers: new Headers(),
      } as any;

      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        isPro: false,
        remaining: 2,
        limit: 5,
        used: 3,
      });
    });

    it('should return unlimited for pro user', async () => {
      // Arrange
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: {
          status: 'ACTIVE',
          tier: 'PRO',
        },
      });
      prisma.download.count.mockResolvedValue(100);

      // Act
      const { GET } = await import('@/app/api/download-limit/route');
      const request = {
        url: 'http://localhost:3000/api/download-limit',
        method: 'GET',
        headers: new Headers(),
      } as any;

      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        isPro: true,
        remaining: 999999,
        limit: 999999,
        used: 100,
      });
    });
  });
});
