import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Download rules (lib/access.ts):
// - subscribers and admins download everything published
// - other signed-in users download only the free samples (2 of FREE_PHONEME)
// - unpublished files are hidden from non-admins

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));

jest.mock('@/app/db', () => ({
  prisma: {
    // No admin choice for the month: automatic rotation (lib/access.ts).
    freeSampleSelection: { findMany: jest.fn(async () => []) },
    user: { findUnique: jest.fn() },
    activityFile: { findUnique: jest.fn() },
    activity: { findMany: jest.fn() },
    subscription: { findUnique: jest.fn() },
    downloadHistory: { create: jest.fn() },
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(async () => 'https://s3.example.com/signed-url'),
}));

const FILE_ID = 'ckfile0000000000000000000';

const mocks = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
});

const setup = ({
  signedIn = true,
  role = 'USER',
  status = 'PUBLISHED',
  activityId = 'act-paid',
  subscription = null as null | Record<string, unknown>,
  freeSampleIds = ['act-free-1', 'act-free-2'],
} = {}) => {
  const { auth, prisma } = mocks();
  auth.mockResolvedValue({ userId: signedIn ? 'clerk-1' : null });
  prisma.user.findUnique.mockResolvedValue({ id: 'u1', role });
  prisma.activityFile.findUnique.mockResolvedValue({
    name: 'atividade.pdf',
    s3Key: 'activities/x.pdf',
    fileType: 'application/pdf',
    sizeInBytes: 1000,
    activityId,
    activity: { status },
  });
  prisma.subscription.findUnique.mockResolvedValue(subscription);
  prisma.activity.findMany.mockResolvedValue(
    freeSampleIds.map((id) => ({
      id,
      name: id,
      files: [{ id: `${id}-img` }],
    }))
  );
};

const download = async () => {
  const { getFileDownloadUrl } = await import(
    '@/lib/actions/file-download.action'
  );
  return getFileDownloadUrl({ fileId: FILE_ID });
};

describe('Download gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET_NAME = 'fonosapp';
  });

  it('should refuse when user is not authenticated', async () => {
    setup({ signedIn: false });
    const result = await download();
    expect(result.success).toBe(false);
    expect(mocks().prisma.activityFile.findUnique).not.toHaveBeenCalled();
  });

  it('should refuse invalid input', async () => {
    setup();
    const { getFileDownloadUrl } = await import(
      '@/lib/actions/file-download.action'
    );
    const result = await getFileDownloadUrl({ fileId: '' });
    expect(result.success).toBe(false);
  });

  it('should require a subscription for paid activities', async () => {
    setup({ activityId: 'act-paid' });
    const result = await download();
    expect(result).toMatchObject({
      success: false,
      requiresSubscription: true,
    });
    expect(mocks().prisma.downloadHistory.create).not.toHaveBeenCalled();
  });

  it('should allow a free sample without a subscription', async () => {
    setup({ activityId: 'act-free-1' });
    const result = await download();
    expect(result.success).toBe(true);
  });

  it('should allow any published activity with an active subscription', async () => {
    setup({
      activityId: 'act-paid',
      subscription: {
        status: 'ACTIVE',
        tier: 'PRO',
        currentPeriodEnd: new Date(Date.now() + 86_400_000),
      },
    });
    const result = await download();
    expect(result.success).toBe(true);
    expect(mocks().prisma.downloadHistory.create).toHaveBeenCalled();
  });

  it('should treat an expired subscription as no subscription', async () => {
    setup({
      activityId: 'act-paid',
      subscription: {
        status: 'ACTIVE',
        tier: 'PRO',
        currentPeriodEnd: new Date(Date.now() - 86_400_000),
      },
    });
    const result = await download();
    expect(result).toMatchObject({
      success: false,
      requiresSubscription: true,
    });
  });

  it('should hide unpublished files from non-admins', async () => {
    setup({
      status: 'PENDING_REVIEW',
      subscription: { status: 'ACTIVE', tier: 'PRO', currentPeriodEnd: null },
    });
    const result = await download();
    expect(result).toMatchObject({ success: false });
    expect(result).not.toHaveProperty('requiresSubscription');
  });

  it('should let admins download unpublished files', async () => {
    setup({ role: 'ADMIN', status: 'PENDING_REVIEW' });
    const result = await download();
    expect(result.success).toBe(true);
  });
});
