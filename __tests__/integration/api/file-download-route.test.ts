import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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
    activityDownloadStat: { upsert: jest.fn() },
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
  fileExists = true,
  subscribed = false,
} = {}) => {
  const { auth, prisma } = mocks();
  auth.mockResolvedValue({ userId: signedIn ? 'clerk-1' : null });
  prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
  prisma.activityFile.findUnique.mockResolvedValue(
    fileExists
      ? {
          name: 'atividade.pdf',
          s3Key: 'activities/x.pdf',
          fileType: 'application/pdf',
          sizeInBytes: 1000,
          activityId: 'act-paid',
          activity: { status: 'PUBLISHED' },
        }
      : null
  );
  prisma.subscription.findUnique.mockResolvedValue(
    subscribed
      ? { status: 'ACTIVE', tier: 'PRO', currentPeriodEnd: null }
      : null
  );
  prisma.activity.findMany.mockResolvedValue([]);
};

const call = async (fileId = FILE_ID) => {
  const { POST } = await import('@/app/api/files/[fileId]/download/route');
  return POST(new Request('http://localhost/api/files/x/download'), {
    params: Promise.resolve({ fileId }),
  });
};

describe('POST /api/files/[fileId]/download', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET_NAME = 'fonosapp';
  });

  it('returns 401 when not signed in', async () => {
    setup({ signedIn: false });
    const res = await call();
    expect(res.status).toBe(401);
  });

  it('returns 400 for an invalid file id', async () => {
    setup();
    const res = await call('');
    expect(res.status).toBe(400);
  });

  it('returns 403 with requiresSubscription for a paid file', async () => {
    setup();
    const res = await call();
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.requiresSubscription).toBe(true);
    expect(mocks().prisma.downloadHistory.create).not.toHaveBeenCalled();
    expect(mocks().prisma.activityDownloadStat.upsert).not.toHaveBeenCalled();
  });

  it('returns 404 when the file does not exist', async () => {
    setup({ fileExists: false });
    const res = await call();
    expect(res.status).toBe(404);
  });

  it('returns the signed url for a subscriber and is not cacheable', async () => {
    setup({ subscribed: true });
    const res = await call();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.url).toBe('https://s3.example.com/signed-url');
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mocks().prisma.downloadHistory.create).toHaveBeenCalled();
    // Anonymous monthly counter, kept after account deletion.
    expect(mocks().prisma.activityDownloadStat.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ activityId: 'act-paid', count: 1 }),
      })
    );
  });
});
