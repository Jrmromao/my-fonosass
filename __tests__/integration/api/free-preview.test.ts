import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Public preview of the free samples only (no download, no other files).

// The global setup stubs next/server without NextResponse.redirect.
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
    redirect: (url: string, status = 307) =>
      new Response(null, { status, headers: { location: url } }),
  },
}));

jest.mock('@/app/db', () => ({
  prisma: {
    // No admin choice for the month: automatic rotation (lib/access.ts).
    freeSampleSelection: { findMany: jest.fn(async () => []) },
    activity: { findMany: jest.fn() },
    activityFile: { findUnique: jest.fn() },
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(async () => 'https://s3.example.com/preview'),
}));

const SAMPLE_FILE = 'cksample00000000000000000';
const OTHER_FILE = 'ckother000000000000000000';

const call = async (fileId: string) => {
  const { GET } = await import('@/app/api/free-preview/[fileId]/route');
  return GET(new Request('http://localhost/api/free-preview/x') as never, {
    params: Promise.resolve({ fileId }),
  });
};

describe('GET /api/free-preview/[fileId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { prisma } = require('@/app/db');
    prisma.activity.findMany.mockResolvedValue([
      {
        id: 'act-1',
        name: 'Animais',
        ageRange: 'PRESCHOOL',
        difficulty: 'BEGINNER',
        files: [{ id: SAMPLE_FILE }],
      },
    ]);
    prisma.activityFile.findUnique.mockResolvedValue({ s3Key: 'a/b.png' });
  });

  it('should return 400 for an invalid file id', async () => {
    const response = await call('not-a-cuid!');
    expect(response.status).toBe(400);
  });

  it('should return 404 for a file that is not a free sample', async () => {
    const response = await call(OTHER_FILE);
    expect(response.status).toBe(404);
  });

  it('should redirect to an inline preview for a free sample', async () => {
    const response = await call(SAMPLE_FILE);
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe(
      'https://s3.example.com/preview'
    );
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    expect(GetObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({ ResponseContentDisposition: 'inline' })
    );
  });
});
