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
    ACTIVITY_UPDATE: 'admin.activity.update',
    ACTIVITY_DELETE: 'admin.activity.delete',
    ADMIN_DENIED: 'security.admin_denied',
  },
  recordAudit: jest.fn(),
}));
jest.mock('@/lib/files/archive', () => ({ deleteObjects: jest.fn() }));
jest.mock('@/lib/files/preview', () => ({ deletePreviews: jest.fn() }));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    activity: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activityFile: { deleteMany: jest.fn() },
    downloadHistory: { count: jest.fn() },
    activityDownloadStat: { count: jest.fn() },
    freeSampleSelection: { count: jest.fn() },
    $transaction: jest.fn(async (ops: unknown) => ops),
  },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  security: require('@/lib/security/securityMiddleware').SecurityMiddleware
    .apply,
  audit: require('@/lib/audit/audit').recordAudit,
  refresh: require('@/lib/cache/publicPages').refreshPublicCatalogPages,
  deleteObjects: require('@/lib/files/archive').deleteObjects,
  deletePreviews: require('@/lib/files/preview').deletePreviews,
});

const route = () => require('@/app/api/admin/activities/[id]/route');
const call = (method: 'PATCH' | 'DELETE', body?: unknown) =>
  route()[method](
    new Request('http://localhost/api/admin/activities/a1', {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    }) as never,
    { params: Promise.resolve({ id: 'a1' }) }
  );

beforeEach(() => {
  jest.clearAllMocks();
  const { auth, prisma, security, audit } = m();
  security.mockResolvedValue({ success: true });
  auth.mockResolvedValue({ userId: 'clerk-admin' });
  prisma.user.findUnique.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  audit.mockResolvedValue(true);
});

describe('PATCH /api/admin/activities/[id]', () => {
  const current = {
    id: 'a1',
    name: 'Titulo antigo',
    description: 'Descrição antiga longa',
  };

  it('returns 401 when signed out', async () => {
    m().auth.mockResolvedValue({ userId: null });
    const res = await call('PATCH', { name: 'Novo título' });
    expect(res.status).toBe(401);
    expect((await res.json()).success).toBe(false);
  });

  it('returns 403 for a non-admin', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
    const res = await call('PATCH', { name: 'Novo título' });
    expect(res.status).toBe(403);
    expect(m().prisma.activity.update).not.toHaveBeenCalled();
  });

  it('returns the security response when CSRF fails, before anything else', async () => {
    m().security.mockResolvedValue({
      success: false,
      response: new Response(JSON.stringify({ error: 'CSRF' }), {
        status: 403,
      }),
    });
    const res = await call('PATCH', { name: 'Novo título' });
    expect(res.status).toBe(403);
    expect(m().auth).not.toHaveBeenCalled();
    expect(m().prisma.activity.update).not.toHaveBeenCalled();
  });

  it.each([
    [{}],
    [{ name: 'ab' }],
    [{ description: 'curta' }],
    [{ name: 'Título válido', extra: 1 }],
  ])('returns 400 for invalid body %j', async (body) => {
    const res = await call('PATCH', body);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toMatchObject({ success: false });
    expect(typeof json.error).toBe('string');
  });

  it('returns 404 for an unknown id', async () => {
    m().prisma.activity.findUnique.mockResolvedValue(null);
    const res = await call('PATCH', { name: 'Novo título' });
    expect(res.status).toBe(404);
  });

  it('saves, audits only the changed field names, and refreshes the pages', async () => {
    const { prisma, audit, refresh } = m();
    prisma.activity.findUnique.mockResolvedValue(current);
    prisma.activity.update.mockResolvedValue({
      ...current,
      name: 'Título novo',
    });

    const res = await call('PATCH', {
      name: '  Título novo  ',
      description: current.description,
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      success: true,
      data: { ...current, name: 'Título novo' },
    });
    expect(prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'a1' },
        data: { name: 'Título novo' },
      })
    );
    const event = audit.mock.calls[0][0] as Record<string, unknown>;
    expect(event).toMatchObject({
      action: 'admin.activity.update',
      actorId: 'admin-1',
      targetId: 'a1',
      metadata: { fields: 'name' },
    });
    expect(JSON.stringify(event.metadata)).not.toContain('Título');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not write or audit when nothing changed', async () => {
    const { prisma, audit } = m();
    prisma.activity.findUnique.mockResolvedValue(current);
    const res = await call('PATCH', { name: current.name });
    expect(res.status).toBe(200);
    expect(prisma.activity.update).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/admin/activities/[id]', () => {
  const draft = (status = 'DRAFT') => ({
    id: 'a1',
    status,
    files: [
      { id: 'f1', s3Key: 'activities/a.pdf' },
      { id: 'f2', s3Key: 'activities/b.png' },
    ],
  });
  const history = (d = 0, s = 0, f = 0) => {
    const { prisma } = m();
    prisma.downloadHistory.count.mockResolvedValue(d);
    prisma.activityDownloadStat.count.mockResolvedValue(s);
    prisma.freeSampleSelection.count.mockResolvedValue(f);
  };

  it('returns 409 for a published activity', async () => {
    m().prisma.activity.findUnique.mockResolvedValue(draft('PUBLISHED'));
    history();
    const res = await call('DELETE');
    expect(res.status).toBe(409);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([
    ['downloads', 1, 0, 0],
    ['stats', 0, 1, 0],
    ['free samples', 0, 0, 1],
  ])(
    'returns 409 with the archive message when there are %s',
    async (_n, d, s, f) => {
      m().prisma.activity.findUnique.mockResolvedValue(draft());
      history(d, s, f);
      const res = await call('DELETE');
      expect(res.status).toBe(409);
      expect((await res.json()).error).toBe(
        'Esta atividade tem histórico; arquive em vez de excluir.'
      );
      expect(m().prisma.$transaction).not.toHaveBeenCalled();
      expect(m().deleteObjects).not.toHaveBeenCalled();
    }
  );

  it('returns 404 for an unknown id', async () => {
    m().prisma.activity.findUnique.mockResolvedValue(null);
    expect((await call('DELETE')).status).toBe(404);
  });

  it.each(['DRAFT', 'REJECTED'])(
    'deletes a %s without history: rows, S3 objects, previews, audit',
    async (status) => {
      const { prisma, deleteObjects, deletePreviews, audit, refresh } = m();
      prisma.activity.findUnique.mockResolvedValue(draft(status));
      history();

      const res = await call('DELETE');

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true, data: { id: 'a1' } });
      expect(prisma.activityFile.deleteMany).toHaveBeenCalledWith({
        where: { activityId: 'a1' },
      });
      expect(prisma.activity.delete).toHaveBeenCalledWith({
        where: { id: 'a1' },
      });
      expect(deleteObjects).toHaveBeenCalledWith([
        'activities/a.pdf',
        'activities/b.png',
      ]);
      expect(deletePreviews).toHaveBeenCalledWith('f1');
      expect(deletePreviews).toHaveBeenCalledWith('f2');
      expect(audit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'admin.activity.delete',
          targetId: 'a1',
          metadata: { files: 2 },
        })
      );
      expect(refresh).toHaveBeenCalled();
    }
  );

  it('still succeeds when the S3 cleanup reports failures', async () => {
    const { prisma, deleteObjects } = m();
    prisma.activity.findUnique.mockResolvedValue(draft());
    history();
    // deleteObjects is best effort: it logs and returns the failed keys.
    deleteObjects.mockResolvedValue(['activities/a.pdf']);
    const res = await call('DELETE');
    expect(res.status).toBe(200);
  });
});
