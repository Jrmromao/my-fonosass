const mockConstructEvent = jest.fn();
const mockSubUpdate = jest.fn();
const mockSubRetrieve = jest.fn();
const mockUpsert = jest.fn();
const mockClerkUpdate = jest.fn();
const mockSendConfirmed = jest.fn();

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: (...a: unknown[]) => mockConstructEvent(...a) },
    subscriptions: {
      update: (...a: unknown[]) => mockSubUpdate(...a),
      retrieve: (...a: unknown[]) => mockSubRetrieve(...a),
    },
  },
}));
jest.mock('@/lib/webhooks/idempotency', () => ({
  claimWebhookEvent: jest.fn().mockResolvedValue(true),
  releaseWebhookEvent: jest.fn(),
}));
jest.mock('@/app/db', () => ({
  prisma: {
    subscription: { upsert: (...a: unknown[]) => mockUpsert(...a) },
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ email: 'a@b.com', fullName: 'Ana' }),
    },
  },
}));
jest.mock('@clerk/nextjs/server', () => ({
  clerkClient: async () => ({
    users: { updateUser: (...a: unknown[]) => mockClerkUpdate(...a) },
  }),
}));
jest.mock('@/services/emailService', () => ({
  EmailService: {
    sendSubscriptionConfirmed: (...a: unknown[]) => mockSendConfirmed(...a),
  },
}));

import { POST } from '@/app/api/webhooks/stripe/route';

const subscription = {
  id: 'sub_1',
  items: {
    data: [
      {
        price: { unit_amount: 3990, recurring: { interval: 'month' } },
        current_period_start: 1_800_000_000,
        current_period_end: 1_802_592_000,
      },
    ],
  },
};

function deliver(type: string, paymentStatus: string) {
  mockConstructEvent.mockReturnValue({
    id: `evt_${type}`,
    type,
    data: {
      object: {
        id: 'cs_1',
        mode: 'subscription',
        subscription: 'sub_1',
        payment_status: paymentStatus,
        metadata: { clerkUserId: 'user_c', userId: 'u1' },
      },
    },
  });
  return POST({
    text: async () => '{}',
    headers: new Headers({ 'stripe-signature': 'sig' }),
  } as unknown as Request);
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  mockSubRetrieve.mockResolvedValue(subscription);
  mockUpsert.mockResolvedValue({});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Stripe webhook: Pix (asynchronous) subscriptions', () => {
  it('Pix pending at checkout: records the subscription without access or email', async () => {
    const res = await deliver('checkout.session.completed', 'unpaid');
    expect(res.status).toBe(200);
    const args = mockUpsert.mock.calls[0][0];
    expect(args.create.status).toBe('INACTIVE');
    expect(args.update.status).toBe('INACTIVE');
    expect(
      mockClerkUpdate.mock.calls[0][1].privateMetadata.subscription.status
    ).toBe('pending');
    expect(mockSendConfirmed).not.toHaveBeenCalled();
  });

  it('Pix paid later: async_payment_succeeded grants access and confirms', async () => {
    const res = await deliver(
      'checkout.session.async_payment_succeeded',
      'paid'
    );
    expect(res.status).toBe(200);
    expect(mockUpsert.mock.calls[0][0].update.status).toBe('ACTIVE');
    expect(
      mockClerkUpdate.mock.calls[0][1].privateMetadata.subscription.status
    ).toBe('active');
    expect(mockSendConfirmed).toHaveBeenCalledTimes(1);
  });

  it('card paid at checkout: access and confirmation right away', async () => {
    await deliver('checkout.session.completed', 'paid');
    expect(mockUpsert.mock.calls[0][0].create.status).toBe('ACTIVE');
    expect(mockSendConfirmed).toHaveBeenCalledTimes(1);
  });

  it('Pix failed: no access granted and nothing written', async () => {
    const res = await deliver(
      'checkout.session.async_payment_failed',
      'unpaid'
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockClerkUpdate).not.toHaveBeenCalled();
  });
});
