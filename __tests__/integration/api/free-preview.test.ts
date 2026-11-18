import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Public preview of the free samples only (no download, no other files),
// served as a resized, CDN-cacheable WebP.

// The global setup stubs next/server; only NextResponse.json is used.
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), { status: init?.status ?? 200 }),
  },
}));

jest.mock('@/app/db', () => ({
  prisma: {
    // No admin choice for the month: the default /s/ samples (lib/access.ts).
    freeSampleSelection: { findMany: jest.fn(async () => []) },
    activity: { findMany: jest.fn() },
    activityFile: { findUnique: jest.fn() },
  },
}));

const mockSend = jest.fn(async () => ({
  Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) },
}));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  GetObjectCommand: jest.fn(),
}));

// sharp(input).resize(opts).webp(opts).toBuffer()
const mockResize = jest.fn();
jest.mock('sharp', () =>
  jest.fn(() => {
    const chain = {
      resize: (opts: unknown) => {
        mockResize(opts);
        return chain;
      },
      webp: () => chain,
      toBuffer: async () => Buffer.from('webp-bytes'),
    };
    return chain;
  })
);

const SAMPLE_FILE = 'cksample00000000000000000';
const OTHER_FILE = 'ckother000000000000000000';

const call = async (fileId: string, query = '') => {
  const { GET } = await import('@/app/api/free-preview/[fileId]/route');
  return GET(
    new Request(`http://localhost/api/free-preview/${fileId}${query}`) as never,
    { params: Promise.resolve({ fileId }) }
  );
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
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should serve a free sample as a cacheable inline WebP', async () => {
    const response = await call(SAMPLE_FILE, '?w=512');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('content-disposition')).toBe('inline');
    expect(response.headers.get('cache-control')).toContain('s-maxage=3600');
    expect(mockResize).toHaveBeenCalledWith(
      expect.objectContaining({ width: 512, withoutEnlargement: true })
    );
  });

  it('should fall back to 1024 px for an unsupported width', async () => {
    await call(SAMPLE_FILE, '?w=4000');
    expect(mockResize).toHaveBeenCalledWith(
      expect.objectContaining({ width: 1024 })
    );
  });
});
