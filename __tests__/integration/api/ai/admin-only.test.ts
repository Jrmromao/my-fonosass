import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Regression: the /api/ai/* routes used to accept any signed-in user, so any
// account could spend OpenAI/TTS credits. They are now admin-only.

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

// ESM-only dependency of generate-exercise; not needed to test the guard.
jest.mock('nanoid', () => ({ nanoid: () => 'test-id' }));

const ROUTES = [
  'analyze-progress',
  'generate-content',
  'generate-exercise',
  'generate-pdf',
  'google-tts',
  'text-to-speech',
] as const;

const post = () =>
  new Request('http://localhost:3000/api/ai/x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

describe('AI routes are admin-only', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each(ROUTES)('POST /api/ai/%s', (route) => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: null });

      const { POST } = await import(`@/app/api/ai/${route}/route`);
      const response = await POST(post());

      expect(response.status).toBe(401);
    });

    it('should return 403 when user is not an admin', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');
      auth.mockResolvedValue({ userId: 'clerk-user-1' });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });

      const { POST } = await import(`@/app/api/ai/${route}/route`);
      const response = await POST(post());

      expect(response.status).toBe(403);
    });
  });
});
