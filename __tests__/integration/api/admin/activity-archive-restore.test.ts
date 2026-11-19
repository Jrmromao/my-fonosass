import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/cache/publicPages', () => ({
  refreshPublicCatalogPages: jest.fn(),
}));
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: { apply: jest.fn() },
}));
jest.mock('@/lib/audit/audit', () => ({
  AuditAction: {
    ACTIVITY_ARCHIVE: 'admin.activity.archive',
    ACTIVITY_RESTORE: 'admin.activity.restore',
    ADMIN_DENIED: 'security.admin_denied',
  },
  recordAudit: jest.fn(),
}));
jest.mock('@/lib/files/archive', () => ({
  archiveFiles: jest.fn(),
  restoreFiles: jest.fn(),
  deleteObjects: jest.fn(),
}));
jest.mock('@/lib/files/preview', () => ({ deletePreviews: jest.fn() }));

// Interactive transactions run against this fake client.
jest.mock('@/app/db', () => {
  const tx = {
    activity: { updateMany: jest.fn() },
    activityFile: { update: jest.fn() },
  };
  return {
    prisma: {
      user: { findUnique: jest.fn() },
      activity: { findUnique: jest.fn() },
      tx,
      $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    },
  };
});

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  security: require('@/lib/security/securityMiddleware').SecurityMiddleware
    .apply,
  audit: require('@/lib/audit/audit').recordAudit,
  refresh: require('@/lib/cache/publicPages').refreshPublicCatalogPages,
  s3: require('@/lib/files/archive'),
  deletePreviews: require('@/lib/files/preview').deletePreviews,
});

const post = (action: 'archive' | 'restore') =>
  require(`@/app/api/admin/activities/[id]/${action}/route`).POST(
    new Request('http://localhost/x', { method: 'POST' }) as never,
    { params: Promise.resolve({ id: 'a1' }) }
  );

const files = [
  { id: 'f1', s3Key: 'activities/a.pdf', archivedFromKey: null },
  { id: 'f2', s3Key: 'activities/b.png', archivedFromKey: null },
];
const archivedFiles = [
  {
    id: 'f1',
    s3Key: 'archive/activities/a.pdf',
    archivedFromKey: 'activities/a.pdf',
  },
  {
    id: 'f2',
    s3Key: 'archive/activities/b.png',
    archivedFromKey: 'activities/b.png',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  const { auth, prisma, security, audit, s3 } = m();
  security.mockResolvedValue({ success: true });
  auth.mockResolvedValue({ userId: 'clerk-admin' });
  prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  prisma.tx.activity.updateMany.mockResolvedValue({ count: 1 });
  audit.mockResolvedValue(true);
  s3.deleteObjects.mockResolvedValue([]);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/admin/activities/[id]/archive', () => {
  const published = () =>
    m().prisma.activity.findUnique.mockResolvedValue({
      id: 'a1',
      status: 'PUBLISHED',
      files,
    });

  it('requires admin and CSRF', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u', role: 'USER' });
    expect((await post('archive')).status).toBe(403);

    m().security.mockResolvedValue({
      success: false,
      response: new Response('{}', { status: 403 }),
    });
    expect((await post('archive')).status).toBe(403);
    expect(m().s3.archiveFiles).not.toHaveBeenCalled();
  });

  it.each(['DRAFT', 'PENDING_REVIEW', 'REJECTED', 'ARCHIVED'])(
    'returns 409 for a %s activity and touches nothing',
    async (status) => {
      m().prisma.activity.findUnique.mockResolvedValue({
        id: 'a1',
        status,
        files,
      });
      const res = await post('archive');
      expect(res.status).toBe(409);
      expect(m().s3.archiveFiles).not.toHaveBeenCalled();
    }
  );

  it('returns 404 for an unknown activity', async () => {
    m().prisma.activity.findUnique.mockResolvedValue(null);
    expect((await post('archive')).status).toBe(404);
  });

  it('returns 502 and changes nothing when an S3 copy fails', async () => {
    published();
    m().s3.archiveFiles.mockRejectedValue(new Error('AccessDenied'));
    const res = await post('archive');
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({
      success: false,
      error: 'Não foi possível mover os arquivos. Nada foi alterado.',
    });
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
    expect(m().s3.deleteObjects).not.toHaveBeenCalled();
    expect(m().audit).not.toHaveBeenCalled();
  });

  it('archives: status, keys, archivedFromKey, cleanup, audit, refresh', async () => {
    const { prisma, s3, audit, refresh, deletePreviews } = m();
    published();
    s3.archiveFiles.mockResolvedValue([
      'archive/activities/a.pdf',
      'archive/activities/b.png',
    ]);

    const res = await post('archive');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { id: 'a1', status: 'ARCHIVED' },
    });
    expect(prisma.tx.activity.updateMany).toHaveBeenCalledWith({
      where: { id: 'a1', status: 'PUBLISHED' },
      data: { status: 'ARCHIVED', isPublic: false },
    });
    expect(prisma.tx.activityFile.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: {
        s3Key: 'archive/activities/a.pdf',
        archivedFromKey: 'activities/a.pdf',
      },
    });
    expect(prisma.tx.activityFile.update).toHaveBeenCalledTimes(2);
    // Originals are removed only after the database points at archive/.
    expect(s3.deleteObjects).toHaveBeenCalledWith([
      'activities/a.pdf',
      'activities/b.png',
    ]);
    expect(deletePreviews).toHaveBeenCalledWith('f1');
    expect(deletePreviews).toHaveBeenCalledWith('f2');
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.activity.archive',
        targetId: 'a1',
        metadata: { files: 2 },
      })
    );
    expect(refresh).toHaveBeenCalled();
  });

  it('still succeeds when the cleanup delete fails (it is logged by the helper)', async () => {
    const { s3 } = m();
    published();
    s3.archiveFiles.mockResolvedValue(['archive/a', 'archive/b']);
    s3.deleteObjects.mockResolvedValue(['activities/a.pdf']);
    const res = await post('archive');
    expect(res.status).toBe(200);
  });

  it('removes the new copies when the database update fails', async () => {
    const { prisma, s3 } = m();
    published();
    s3.archiveFiles.mockResolvedValue(['archive/a', 'archive/b']);
    prisma.$transaction.mockRejectedValueOnce(new Error('db down'));
    const res = await post('archive');
    expect(res.status).toBe(500);
    expect(s3.deleteObjects).toHaveBeenCalledWith(['archive/a', 'archive/b']);
    expect(m().audit).not.toHaveBeenCalled();
  });

  it('returns 409 and keeps the copies when the status changed meanwhile', async () => {
    const { prisma, s3 } = m();
    published();
    s3.archiveFiles.mockResolvedValue(['archive/a', 'archive/b']);
    prisma.tx.activity.updateMany.mockResolvedValue({ count: 0 });
    const res = await post('archive');
    expect(res.status).toBe(409);
    expect(prisma.tx.activityFile.update).not.toHaveBeenCalled();
    expect(s3.deleteObjects).not.toHaveBeenCalled();
  });
});

describe('POST /api/admin/activities/[id]/restore', () => {
  const archived = (
    f: {
      id: string;
      s3Key: string;
      archivedFromKey: string | null;
    }[] = archivedFiles
  ) =>
    m().prisma.activity.findUnique.mockResolvedValue({
      id: 'a1',
      status: 'ARCHIVED',
      files: f,
    });

  it('returns 409 for an activity that is not archived', async () => {
    m().prisma.activity.findUnique.mockResolvedValue({
      id: 'a1',
      status: 'PUBLISHED',
      files,
    });
    expect((await post('restore')).status).toBe(409);
    expect(m().s3.restoreFiles).not.toHaveBeenCalled();
  });

  it('returns 409 when a file has no archivedFromKey', async () => {
    archived([{ ...archivedFiles[0], archivedFromKey: null }]);
    expect((await post('restore')).status).toBe(409);
    expect(m().s3.restoreFiles).not.toHaveBeenCalled();
  });

  it('returns 502 and changes nothing when the copy back fails', async () => {
    archived();
    m().s3.restoreFiles.mockRejectedValue(new Error('boom'));
    const res = await post('restore');
    expect(res.status).toBe(502);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
    expect(m().s3.deleteObjects).not.toHaveBeenCalled();
  });

  it('restores: original keys back, archivedFromKey cleared, archive copies removed', async () => {
    const { prisma, s3, audit, refresh } = m();
    archived();
    s3.restoreFiles.mockResolvedValue(['activities/a.pdf', 'activities/b.png']);

    const res = await post('restore');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: { id: 'a1', status: 'PUBLISHED' },
    });
    expect(prisma.tx.activity.updateMany).toHaveBeenCalledWith({
      where: { id: 'a1', status: 'ARCHIVED' },
      data: { status: 'PUBLISHED', isPublic: true },
    });
    expect(prisma.tx.activityFile.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: { s3Key: 'activities/a.pdf', archivedFromKey: null },
    });
    expect(s3.deleteObjects).toHaveBeenCalledWith([
      'archive/activities/a.pdf',
      'archive/activities/b.png',
    ]);
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'admin.activity.restore',
        metadata: { files: 2 },
      })
    );
    expect(refresh).toHaveBeenCalled();
  });
});
