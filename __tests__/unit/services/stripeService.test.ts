// Mock Stripe before importing
jest.mock('stripe', () => {
  const mockCheckoutSessions = {
    create: jest.fn(),
  };

  const mockBillingPortalSessions = {
    create: jest.fn(),
  };

  const mockWebhooks = {
    constructEvent: jest.fn(),
  };

  const mockStripe = {
    checkout: {
      sessions: mockCheckoutSessions,
    },
    billingPortal: {
      sessions: mockBillingPortalSessions,
    },
    webhooks: mockWebhooks,
  };

  const Stripe = jest.fn(() => mockStripe);
  //@ts-ignore
  Stripe.default = Stripe;

  return Stripe;
});
//@ts-ignore
import { StripeService } from '@/services/stripeService';

// Mock environment variables
const originalEnv = process.env;

describe('StripeService', () => {
  let mockCheckoutSessions: any;
  let mockBillingPortalSessions: any;
  let mockWebhooks: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_mock_webhook_secret',
      NEXT_PUBLIC_APP_URL: 'https://test-app.com',
    };

    // Get the mocked functions
    const Stripe = require('stripe');
    const stripeInstance = new Stripe();
    mockCheckoutSessions = stripeInstance.checkout.sessions;
    mockBillingPortalSessions = stripeInstance.billingPortal.sessions;
    mockWebhooks = stripeInstance.webhooks;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        customer_email: 'test@example.com',
        metadata: { userId: 'user_123' },
      };

      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      const result = await StripeService.createCheckoutSession(
        'user_123',
        'test@example.com'
      );

      expect(result).toEqual(mockSession);
      expect(mockCheckoutSessions.create).toHaveBeenCalledWith({
        customer_email: 'test@example.com',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'FonoSaaS Pro',
                description: 'Downloads ilimitados + Recursos premium',
              },
              unit_amount: 3990,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://test-app.com/dashboard?success=true',
        cancel_url: 'https://test-app.com/dashboard?canceled=true',
        metadata: {
          userId: 'user_123',
        },
      });
    });

    it('should handle checkout session creation errors', async () => {
      const error = new Error('Stripe API error');
      mockCheckoutSessions.create.mockRejectedValue(error);

      await expect(
        StripeService.createCheckoutSession('user_123', 'test@example.com')
      ).rejects.toThrow('Stripe API error');

      expect(mockCheckoutSessions.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPortalSession', () => {
    it('should create a billing portal session successfully', async () => {
      const mockSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/session/bps_test_123',
        customer: 'cus_test_123',
        return_url: 'https://test-app.com/dashboard',
      };

      mockBillingPortalSessions.create.mockResolvedValue(mockSession);

      const result = await StripeService.createPortalSession('cus_test_123');

      expect(result).toEqual(mockSession);
      expect(mockBillingPortalSessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://test-app.com/dashboard',
      });
    });

    it('should handle billing portal session creation errors', async () => {
      const error = new Error('Billing portal error');
      mockBillingPortalSessions.create.mockRejectedValue(error);

      await expect(
        StripeService.createPortalSession('cus_test_123')
      ).rejects.toThrow('Billing portal error');

      expect(mockBillingPortalSessions.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleWebhook', () => {
    it('should construct webhook event successfully', async () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer_email: 'test@example.com',
            metadata: { userId: 'user_123' },
          },
        },
      };

      mockWebhooks.constructEvent.mockReturnValue(mockEvent);

      const result = await StripeService.handleWebhook(
        'raw_body',
        'stripe_signature'
      );

      expect(result).toEqual(mockEvent);
      expect(mockWebhooks.constructEvent).toHaveBeenCalledWith(
        'raw_body',
        'stripe_signature',
        'whsec_mock_webhook_secret'
      );
    });

    it('should handle webhook signature verification errors', async () => {
      const error = new Error('Invalid signature');
      mockWebhooks.constructEvent.mockImplementation(() => {
        throw error;
      });

      await expect(
        StripeService.handleWebhook('raw_body', 'invalid_signature')
      ).rejects.toThrow('Invalid signature');

      expect(mockWebhooks.constructEvent).toHaveBeenCalledWith(
        'raw_body',
        'invalid_signature',
        'whsec_mock_webhook_secret'
      );
    });
  });

  describe('Environment Variables', () => {
    it('should use correct environment variables for checkout session', async () => {
      const mockSession = { id: 'cs_test_env' };
      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      await StripeService.createCheckoutSession('user_123', 'test@example.com');

      expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://test-app.com/dashboard?success=true',
          cancel_url: 'https://test-app.com/dashboard?canceled=true',
        })
      );
    });

    it('should use correct environment variables for portal session', async () => {
      const mockSession = { id: 'bps_test_env' };
      mockBillingPortalSessions.create.mockResolvedValue(mockSession);

      await StripeService.createPortalSession('cus_test_123');

      expect(mockBillingPortalSessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        return_url: 'https://test-app.com/dashboard',
      });
    });

    it('should use correct webhook secret', async () => {
      const mockEvent = { id: 'evt_test_env' };
      mockWebhooks.constructEvent.mockReturnValue(mockEvent);

      await StripeService.handleWebhook('body', 'signature');

      expect(mockWebhooks.constructEvent).toHaveBeenCalledWith(
        'body',
        'signature',
        'whsec_mock_webhook_secret'
      );
    });
  });

  describe('Error Handling', () => {
    it('should propagate Stripe errors from createCheckoutSession', async () => {
      const stripeError = new Error('Your card was declined');
      mockCheckoutSessions.create.mockRejectedValue(stripeError);

      await expect(
        StripeService.createCheckoutSession('user_123', 'test@example.com')
      ).rejects.toThrow('Your card was declined');
    });

    it('should propagate Stripe errors from createPortalSession', async () => {
      const stripeError = new Error('Customer not found');
      mockBillingPortalSessions.create.mockRejectedValue(stripeError);

      await expect(
        StripeService.createPortalSession('invalid_customer_id')
      ).rejects.toThrow('Customer not found');
    });

    it('should propagate webhook verification errors', async () => {
      const webhookError = new Error(
        'No signatures found matching the expected signature'
      );
      mockWebhooks.constructEvent.mockImplementation(() => {
        throw webhookError;
      });

      await expect(
        StripeService.handleWebhook('body', 'invalid_signature')
      ).rejects.toThrow('No signatures found matching the expected signature');
    });
  });
});
