import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockGetUser = jest.fn<(id: string) => Promise<unknown>>();

jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: jest.fn(async () => ({ users: { getUser: mockGetUser } })),
}));
jest.mock('@/app/db', () => ({
  prisma: { user: { findUnique: jest.fn(), upsert: jest.fn() } },
}));

import { getOrCreateDbUser } from '@/lib/auth/dbUser';

const prisma = () => require('@/app/db').prisma;
const { Prisma } = require('@prisma/client');

const clerkUser = (over: Record<string, unknown> = {}) => ({
  id: 'clerk-1',
  firstName: 'Maria',
  lastName: 'Silva',
  primaryEmailAddressId: 'em1',
  emailAddresses: [
    {
      id: 'em1',
      emailAddress: 'maria@example.com',
      verification: { status: 'verified' },
    },
  ],
  privateMetadata: {},
  ...over,
});

describe('getOrCreateDbUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma().user.findUnique.mockResolvedValue(null);
    prisma().user.upsert.mockImplementation(
      async ({ create }: { create: { email: string } }) => ({
        id: 'db-1',
        role: 'USER',
        email: create.email,
      })
    );
    mockGetUser.mockResolvedValue(clerkUser());
  });

  it('returns the existing row without calling Clerk', async () => {
    prisma().user.findUnique.mockResolvedValue({
      id: 'db-1',
      role: 'ADMIN',
      email: 'a@b.c',
    });
    expect(await getOrCreateDbUser('clerk-1')).toMatchObject({
      id: 'db-1',
      role: 'ADMIN',
    });
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('creates a missing row from Clerk data, always as USER', async () => {
    const user = await getOrCreateDbUser('clerk-1');
    expect(user).toMatchObject({ id: 'db-1', role: 'USER' });
    const args = prisma().user.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ clerkUserId: 'clerk-1' });
    expect(args.create).toEqual({
      clerkUserId: 'clerk-1',
      email: 'maria@example.com',
      fullName: 'Maria Silva',
    });
    expect(args.create.role).toBeUndefined(); // default USER, never from input
  });

  it('refuses accounts flagged for deletion (LGPD)', async () => {
    mockGetUser.mockResolvedValue(
      clerkUser({
        privateMetadata: { deletionRequestedAt: '2026-11-18T00:00:00Z' },
      })
    );
    expect(await getOrCreateDbUser('clerk-1')).toBeNull();
    expect(prisma().user.upsert).not.toHaveBeenCalled();
  });

  it('refuses an unverified primary email', async () => {
    mockGetUser.mockResolvedValue(
      clerkUser({
        emailAddresses: [
          {
            id: 'em1',
            emailAddress: 'x@example.com',
            verification: { status: 'unverified' },
          },
        ],
      })
    );
    expect(await getOrCreateDbUser('clerk-1')).toBeNull();
    expect(prisma().user.upsert).not.toHaveBeenCalled();
  });

  it('never links to another account that has the same email', async () => {
    prisma().user.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', 'P2002')
    );
    // Still no row for this Clerk id after the conflict.
    expect(await getOrCreateDbUser('clerk-1')).toBeNull();
  });

  it('returns the row created by a concurrent request', async () => {
    prisma().user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'db-9',
      role: 'USER',
      email: 'maria@example.com',
    });
    prisma().user.upsert.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', 'P2002')
    );
    expect(await getOrCreateDbUser('clerk-1')).toMatchObject({ id: 'db-9' });
  });

  it('returns null when Clerk is unreachable', async () => {
    mockGetUser.mockRejectedValue(new Error('down'));
    expect(await getOrCreateDbUser('clerk-1')).toBeNull();
  });
});
