import 'server-only';
import { prisma } from '@/app/db';
import { Prisma } from '@prisma/client';

/** Keep claims long enough to cover Stripe's retry window (3 days). */
const KEEP_DAYS = 30;

/**
 * Atomically claim a webhook event id. Returns false when it was already
 * claimed (duplicate delivery). Fails open on unexpected DB errors: better to
 * risk a duplicate than to drop a payment event.
 */
export async function claimWebhookEvent(
  id: string,
  type: string
): Promise<boolean> {
  try {
    await prisma.processedWebhookEvent.create({ data: { id, type } });
    if (Math.random() < 0.02) await purgeOldClaims();
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return false;
    }
    console.error(
      '[webhooks] could not claim event, processing anyway:',
      error
    );
    return true;
  }
}

export async function releaseWebhookEvent(id: string): Promise<void> {
  try {
    await prisma.processedWebhookEvent.deleteMany({ where: { id } });
  } catch (error) {
    console.error('[webhooks] could not release event claim:', error);
  }
}

async function purgeOldClaims(): Promise<void> {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000);
  await prisma.processedWebhookEvent.deleteMany({
    where: { processedAt: { lt: cutoff } },
  });
}
