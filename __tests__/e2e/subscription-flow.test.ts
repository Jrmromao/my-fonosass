import { expect, test } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should display subscription status for free user', async ({ page }) => {
    // Mock free user subscription
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tier: 'FREE',
          status: 'active',
          subscriptionId: null,
          currentPeriodEnd: null,
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Check subscription status display
    await expect(page.locator('text=Plano Gratuito')).toBeVisible();
    await expect(page.locator('text=5 exercícios por mês')).toBeVisible();
    await expect(page.locator('text=Upgrade para PRO')).toBeVisible();
  });

  test('should display subscription status for pro user', async ({ page }) => {
    // Mock pro user subscription
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tier: 'PRO',
          status: 'active',
          subscriptionId: 'sub_123',
          currentPeriodEnd: '2024-12-31T00:00:00.000Z',
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Check subscription status display
    await expect(page.locator('text=Plano PRO')).toBeVisible();
    await expect(page.locator('text=Acesso ilimitado')).toBeVisible();
    await expect(page.locator('text=Gerenciar Assinatura')).toBeVisible();
  });

  test('should navigate to pricing page from upgrade button', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Click upgrade button
    await page.click('text=Upgrade para PRO');
    
    // Should navigate to pricing page
    await expect(page).toHaveURL(/.*pricing/);
    await expect(page.locator('h1')).toContainText('Planos');
  });

  test('should display pricing plans correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    
    // Check if pricing plans are displayed
    await expect(page.locator('text=Plano Gratuito')).toBeVisible();
    await expect(page.locator('text=Plano PRO')).toBeVisible();
    
    // Check pricing details
    await expect(page.locator('text=R$ 0/mês')).toBeVisible();
    await expect(page.locator('text=R$ 29,90/mês')).toBeVisible();
    
    // Check features
    await expect(page.locator('text=5 exercícios por mês')).toBeVisible();
    await expect(page.locator('text=Acesso ilimitado')).toBeVisible();
  });

  test('should initiate subscription purchase', async ({ page }) => {
    await page.goto('http://localhost:3000/pricing');
    
    // Click on PRO plan button
    await page.click('button:has-text("Escolher PRO")');
    
    // Should show Stripe checkout or redirect
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('should handle subscription purchase success', async ({ page }) => {
    // Mock successful subscription creation
    await page.route('**/api/stripe/create-subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          subscriptionId: 'sub_123',
          clientSecret: 'pi_123_secret_456',
        }),
      });
    });

    await page.goto('http://localhost:3000/pricing');
    await page.click('button:has-text("Escolher PRO")');
    
    // Should show success message
    await expect(page.locator('text=Assinatura criada com sucesso')).toBeVisible();
  });

  test('should handle subscription purchase failure', async ({ page }) => {
    // Mock failed subscription creation
    await page.route('**/api/stripe/create-subscription', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Payment failed',
        }),
      });
    });

    await page.goto('http://localhost:3000/pricing');
    await page.click('button:has-text("Escolher PRO")');
    
    // Should show error message
    await expect(page.locator('text=Erro ao criar assinatura')).toBeVisible();
  });

  test('should display billing information for pro user', async ({ page }) => {
    // Mock pro user with billing info
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tier: 'PRO',
          status: 'active',
          subscriptionId: 'sub_123',
          currentPeriodEnd: '2024-12-31T00:00:00.000Z',
          billingPortalUrl: 'https://billing.stripe.com/portal/123',
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Click manage subscription button
    await page.click('text=Gerenciar Assinatura');
    
    // Should open billing portal
    await expect(page).toHaveURL(/.*billing/);
  });

  test('should handle subscription cancellation', async ({ page }) => {
    // Mock subscription cancellation
    await page.route('**/api/stripe/cancel-subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Subscription cancelled successfully',
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Gerenciar Assinatura');
    
    // Click cancel subscription
    await page.click('button:has-text("Cancelar Assinatura")');
    
    // Confirm cancellation
    await page.click('button:has-text("Confirmar")');
    
    // Should show success message
    await expect(page.locator('text=Assinatura cancelada com sucesso')).toBeVisible();
  });

  test('should handle subscription renewal', async ({ page }) => {
    // Mock subscription renewal
    await page.route('**/api/stripe/renew-subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Subscription renewed successfully',
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Gerenciar Assinatura');
    
    // Click renew subscription
    await page.click('button:has-text("Renovar Assinatura")');
    
    // Should show success message
    await expect(page.locator('text=Assinatura renovada com sucesso')).toBeVisible();
  });

  test('should show download limits for free user', async ({ page }) => {
    // Mock free user with download limits
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tier: 'FREE',
          status: 'active',
          subscriptionId: null,
          currentPeriodEnd: null,
          downloadLimit: 5,
          downloadsUsed: 3,
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Check download limit display
    await expect(page.locator('text=3/5 downloads usados')).toBeVisible();
    await expect(page.locator('text=2 downloads restantes')).toBeVisible();
  });

  test('should show unlimited downloads for pro user', async ({ page }) => {
    // Mock pro user
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tier: 'PRO',
          status: 'active',
          subscriptionId: 'sub_123',
          currentPeriodEnd: '2024-12-31T00:00:00.000Z',
          downloadLimit: -1, // Unlimited
          downloadsUsed: 50,
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Check unlimited download display
    await expect(page.locator('text=Acesso ilimitado')).toBeVisible();
    await expect(page.locator('text=50 downloads realizados')).toBeVisible();
  });

  test('should handle subscription webhook events', async ({ page }) => {
    // Mock webhook event
    await page.route('**/api/stripe/webhook', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          event: 'customer.subscription.updated',
        }),
      });
    });

    // Simulate webhook call
    await page.request.post('http://localhost:3000/api/stripe/webhook', {
      data: {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            status: 'active',
          },
        },
      },
    });

    // Should handle webhook successfully
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should display subscription history', async ({ page }) => {
    // Mock subscription history
    await page.route('**/api/user/subscription/history', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          history: [
            {
              id: 'sub_123',
              status: 'active',
              createdAt: '2024-01-01T00:00:00.000Z',
              amount: 2990,
              currency: 'brl',
            },
          ],
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.click('text=Histórico de Assinaturas');
    
    // Should display subscription history
    await expect(page.locator('text=R$ 29,90')).toBeVisible();
    await expect(page.locator('text=Ativa')).toBeVisible();
  });

  test('should handle subscription errors gracefully', async ({ page }) => {
    // Mock subscription error
    await page.route('**/api/user/subscription', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to load subscription',
        }),
      });
    });

    await page.goto('http://localhost:3000/dashboard');
    
    // Should show error message
    await expect(page.locator('text=Erro ao carregar assinatura')).toBeVisible();
  });
});
