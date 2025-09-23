import { expect, test } from '@playwright/test';

test.describe('Billing Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/dashboard');

    // Mock user data
    await page.evaluate(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user-1',
          email: 'test@example.com',
          isPro: false,
        })
      );
    });
  });

  test('should display subscription status for free user', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: false,
            remaining: 2,
            limit: 5,
            used: 3,
          },
        }),
      });
    });

    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page.getByText('Plano Gratuito')).toBeVisible();
    await expect(page.getByText('3 de 5 downloads usados')).toBeVisible();
    await expect(page.getByText('2 downloads restantes')).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();
  });

  test('should display subscription status for pro user', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: true,
            remaining: 999999,
            limit: 999999,
            used: 150,
          },
        }),
      });
    });

    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page.getByText('Plano Pro')).toBeVisible();
    await expect(page.getByText('150 downloads realizados')).toBeVisible();
    await expect(page.getByText('Downloads ilimitados')).toBeVisible();
    await expect(page.queryByRole('progressbar')).not.toBeVisible();
  });

  test('should handle upgrade flow', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: false,
            remaining: 2,
            limit: 5,
            used: 3,
          },
        }),
      });
    });

    await page.route('/api/stripe/create-checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.stripe.com/session-123',
        }),
      });
    });

    // Act
    await page.goto('/dashboard');
    await page.getByText('Fazer Upgrade').click();

    // Assert
    await expect(page).toHaveURL('https://checkout.stripe.com/session-123');
  });

  test('should handle manage subscription flow', async ({ page }) => {
    // Arrange
    await page.evaluate(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user-1',
          email: 'test@example.com',
          isPro: true,
        })
      );
    });

    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: true,
            remaining: 999999,
            limit: 999999,
            used: 150,
          },
        }),
      });
    });

    await page.route('/api/stripe/create-portal', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://billing.stripe.com/session-123',
        }),
      });
    });

    // Act
    await page.goto('/dashboard');
    await page.getByText('Gerenciar Assinatura').click();

    // Assert
    await expect(page).toHaveURL('https://billing.stripe.com/session-123');
  });

  test('should show download limit warning when approaching limit', async ({
    page,
  }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: false,
            remaining: 1,
            limit: 5,
            used: 4,
          },
        }),
      });
    });

    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(
      page.getByText('Atenção: Apenas 1 download restante')
    ).toBeVisible();
    await expect(
      page.getByText('Considere fazer upgrade para downloads ilimitados')
    ).toBeVisible();
  });

  test('should block download when limit reached', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: false,
            remaining: 0,
            limit: 5,
            used: 5,
          },
        }),
      });
    });

    await page.route('/api/activities/*/download', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Download limit reached',
        }),
      });
    });

    // Act
    await page.goto('/dashboard/games');
    await page.getByText('Download').first().click();

    // Assert
    await expect(page.getByText('Limite de downloads atingido')).toBeVisible();
    await expect(
      page.getByText('Faça upgrade para continuar baixando')
    ).toBeVisible();
  });

  test('should handle subscription webhook updates', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            isPro: false,
            remaining: 2,
            limit: 5,
            used: 3,
          },
        }),
      });
    });

    // Act
    await page.goto('/dashboard');

    // Simulate webhook update
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('subscription-updated', {
          detail: {
            isPro: true,
            remaining: 999999,
            limit: 999999,
            used: 0,
          },
        })
      );
    });

    // Assert
    await expect(page.getByText('Plano Pro')).toBeVisible();
    await expect(page.getByText('Downloads ilimitados')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Arrange
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
        }),
      });
    });

    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page.getByText('Erro ao carregar assinatura')).toBeVisible();
    await expect(page.getByText('Tente novamente')).toBeVisible();
  });

  test('should refresh subscription status on page reload', async ({
    page,
  }) => {
    // Arrange
    let callCount = 0;
    await page.route('/api/download-limit', async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              isPro: false,
              remaining: 2,
              limit: 5,
              used: 3,
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              isPro: true,
              remaining: 999999,
              limit: 999999,
              used: 0,
            },
          }),
        });
      }
    });

    // Act
    await page.goto('/dashboard');
    await expect(page.getByText('Plano Gratuito')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Plano Pro')).toBeVisible();

    // Assert
    expect(callCount).toBe(2);
  });
});
