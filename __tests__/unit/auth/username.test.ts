import { describe, expect, it, jest } from '@jest/globals';
import {
  completeMissingUsername,
  usernameFromEmail,
} from '@/components/auth/username';

jest.mock('@clerk/nextjs/errors', () => ({
  isClerkAPIResponseError: (e: { errors?: unknown }) => !!e?.errors,
}));

describe('usernameFromEmail', () => {
  it('builds a valid Clerk username (4-64 chars, a-z 0-9 _ -)', () => {
    for (const email of [
      'joão.filipe+teste@gmail.com',
      'a@b.com',
      'Ana-Lúcia_99@example.com.br',
      `${'x'.repeat(80)}@example.com`,
    ]) {
      const u = usernameFromEmail(email);
      expect(u).toMatch(/^[a-z0-9_-]{4,64}$/);
    }
    expect(usernameFromEmail('joão.silva@x.com')).toMatch(/^joao_silva_\d{4}$/);
    expect(usernameFromEmail('a@b.com')).toMatch(/^usuario_\d{4}$/);
  });
});

describe('completeMissingUsername', () => {
  const signUp = (over: Record<string, unknown> = {}) => {
    const s = {
      status: 'missing_requirements',
      missingFields: ['username'],
      emailAddress: 'maria@example.com',
      update: jest.fn(async () => ({
        ...s,
        status: 'complete',
        missingFields: [],
      })),
      ...over,
    };
    return s;
  };

  it('does nothing when the username is not missing', async () => {
    const s = signUp({ missingFields: [] });
    expect(await completeMissingUsername(s as never)).toBe(s);
    expect(s.update).not.toHaveBeenCalled();
  });

  it('sets a generated username when it is missing', async () => {
    const s = signUp();
    const result = (await completeMissingUsername(s as never)) as {
      status: string;
    };
    expect(result.status).toBe('complete');
    expect(s.update).toHaveBeenCalledWith({
      username: expect.stringMatching(/^maria_\d{4}$/),
    });
  });

  it('retries with another name when the first one is taken', async () => {
    const s = signUp();
    s.update
      .mockRejectedValueOnce({ errors: [{ code: 'form_identifier_exists' }] })
      .mockResolvedValueOnce({ ...s, status: 'complete', missingFields: [] });
    const result = (await completeMissingUsername(s as never)) as {
      status: string;
    };
    expect(result.status).toBe('complete');
    expect(s.update).toHaveBeenCalledTimes(2);
  });

  it('rethrows other errors', async () => {
    const s = signUp();
    s.update.mockRejectedValue({ errors: [{ code: 'form_param_unknown' }] });
    await expect(completeMissingUsername(s as never)).rejects.toBeTruthy();
  });
});
