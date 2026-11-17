import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Regressions:
// - createActivity accepted any signed-in user (S3 uploads + review queue).
// - The menu role came from Clerk metadata while API routes used the DB role.

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    activity: { create: jest.fn() },
  },
}));

jest.mock('@/services/S3Service', () => ({
  __esModule: true,
  default: { getInstance: () => ({}) },
}));

jest.mock('@/services/PDFService', () => ({
  __esModule: true,
  default: { getInstance: () => ({}) },
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const signedInAs = (role: 'ADMIN' | 'USER' | null) => {
  const { auth } = require('@clerk/nextjs/server');
  const { prisma } = require('@/app/db');
  auth.mockResolvedValue({ userId: role === null ? null : 'clerk-user-1' });
  prisma.user.findUnique.mockResolvedValue(
    role === null ? null : { id: 'u1', role }
  );
};

describe('createActivity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should refuse when user is not authenticated', async () => {
    signedInAs(null);
    const { createActivity } = await import('@/lib/actions/activity.action');

    const result = await createActivity(new FormData());

    expect(result.success).toBe(false);
  });

  it('should refuse non-admin users without creating anything', async () => {
    signedInAs('USER');
    const { prisma } = require('@/app/db');
    const { createActivity } = await import('@/lib/actions/activity.action');

    const result = await createActivity(new FormData());

    expect(result.success).toBe(false);
    expect(prisma.activity.create).not.toHaveBeenCalled();
  });
});

describe('getCurrentUserRole', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return GUEST when user is not authenticated', async () => {
    signedInAs(null);
    const { getCurrentUserRole } = await import('@/utils');
    expect(await getCurrentUserRole()).toBe('GUEST');
  });

  it('should return ADMIN from the database role', async () => {
    signedInAs('ADMIN');
    const { getCurrentUserRole } = await import('@/utils');
    expect(await getCurrentUserRole()).toBe('ADMIN');
  });

  it('should return USER for a regular database user', async () => {
    signedInAs('USER');
    const { getCurrentUserRole } = await import('@/utils');
    expect(await getCurrentUserRole()).toBe('USER');
  });
});
