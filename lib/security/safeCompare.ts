import { createHash, timingSafeEqual } from 'crypto';

/**
 * Constant-time string comparison for secrets (API keys, one-time tokens).
 * Both inputs are hashed first so the comparison runs on equal-length buffers
 * and does not leak the secret's length.
 */
export function safeEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}
