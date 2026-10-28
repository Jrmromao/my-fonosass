import {
  canTransition,
  assertTransition,
  AuthzError,
  errorResponse,
  type ActivityStatus,
} from '@/lib/activities/approval';

describe('approval state machine', () => {
  describe('canTransition', () => {
    it('allows the core review flow', () => {
      expect(canTransition('DRAFT', 'PENDING_REVIEW')).toBe(true);
      expect(canTransition('PENDING_REVIEW', 'PUBLISHED')).toBe(true);
      expect(canTransition('PENDING_REVIEW', 'REJECTED')).toBe(true);
      expect(canTransition('REJECTED', 'PENDING_REVIEW')).toBe(true);
      expect(canTransition('PUBLISHED', 'DRAFT')).toBe(true);
    });

    it('allows idempotent no-ops', () => {
      const all: ActivityStatus[] = [
        'DRAFT',
        'PENDING_REVIEW',
        'PUBLISHED',
        'REJECTED',
      ];
      for (const s of all) expect(canTransition(s, s)).toBe(true);
    });

    it('forbids skipping review (DRAFT cannot go straight to PUBLISHED)', () => {
      expect(canTransition('DRAFT', 'PUBLISHED')).toBe(false);
    });

    it('forbids reviving a rejected item directly to published', () => {
      expect(canTransition('REJECTED', 'PUBLISHED')).toBe(false);
    });

    it('forbids rejected -> draft', () => {
      expect(canTransition('REJECTED', 'DRAFT')).toBe(false);
    });
  });

  describe('assertTransition', () => {
    it('throws AuthzError(409) on an invalid transition', () => {
      expect(() => assertTransition('DRAFT', 'PUBLISHED')).toThrow(AuthzError);
      try {
        assertTransition('DRAFT', 'PUBLISHED');
      } catch (e) {
        expect((e as AuthzError).status).toBe(409);
      }
    });

    it('does not throw on a valid transition', () => {
      expect(() =>
        assertTransition('PENDING_REVIEW', 'PUBLISHED')
      ).not.toThrow();
    });
  });

  describe('errorResponse', () => {
    it('maps AuthzError to its status', () => {
      expect(errorResponse(new AuthzError(403, 'nope'))).toEqual({
        body: { error: 'nope' },
        status: 403,
      });
    });

    it('maps unknown errors to 500 with a generic message', () => {
      const r = errorResponse(new Error('boom'));
      expect(r.status).toBe(500);
      expect(r.body.error).toBe('Erro interno');
    });
  });
});
