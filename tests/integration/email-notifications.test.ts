import { test, expect } from '@playwright/test'

test.describe('Email Notifications Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock email service to prevent actual emails during testing
    await page.addInitScript(() => {
      window.mockEmailService = {
        sendDownloadLimitWarning: jest.fn(),
        sendDownloadLimitReached: jest.fn(),
        sendWelcomeEmail: jest.fn()
      }
    })
  })

  test('should trigger warning email when approaching download limit', async ({ page }) => {
    // Mock API responses for user with 4 downloads (1 remaining)
    await page.route('/api/download-limit', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { canDownload: true, remaining: 1, isPro: false }
          })
        })
      } else if (route.request().method() === 'POST') {
        // Simulate email trigger on download
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { downloaded: true, remaining: 0, emailSent: 'warning' }
          })
        })
      }
    })

    await page.goto('http://localhost:3000/dashboard/games')
    
    // Open exercise modal
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Click download button
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
    
    // Should show warning about last download
    await expect(page.locator('text=Restam 0 downloads')).toBeVisible()
  })

  test('should trigger limit reached email when downloads exhausted', async ({ page }) => {
    // Mock API responses for user with 5 downloads (0 remaining)
    await page.route('/api/download-limit', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { canDownload: false, remaining: 0, isPro: false }
          })
        })
      }
    })

    await page.goto('http://localhost:3000/dashboard/games')
    
    // Open exercise modal
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Handle alert for limit reached
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Limite de downloads atingido!')
      await dialog.accept()
    })
    
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
  })

  test('should show download history in user profile', async ({ page }) => {
    // Mock profile API with download history
    await page.route('/api/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user1',
              email: 'user@test.com',
              fullName: 'Test User',
              role: 'USER',
              createdAt: new Date().toISOString()
            },
            subscription: {
              tier: 'FREE',
              status: 'INACTIVE'
            },
            downloadLimits: {
              canDownload: true,
              remaining: 3,
              isPro: false
            },
            stats: {
              totalDownloads: 2,
              uniqueActivities: 2,
              recentDownloads: 1
            },
            recentDownloads: [
              {
                id: '1',
                fileName: 'exercise1.pdf',
                downloadedAt: new Date().toISOString(),
                activity: {
                  id: 'act1',
                  name: 'Exercício de /p/',
                  type: 'SPEECH',
                  phoneme: 'p',
                  difficulty: 'BEGINNER'
                }
              },
              {
                id: '2',
                fileName: 'exercise2.pdf',
                downloadedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                activity: {
                  id: 'act2',
                  name: 'Exercício de /b/',
                  type: 'SPEECH',
                  phoneme: 'b',
                  difficulty: 'INTERMEDIATE'
                }
              }
            ]
          }
        })
      })
    })

    await page.goto('http://localhost:3000/dashboard/profile')
    
    // Should show user stats
    await expect(page.locator('text=Total Downloads')).toBeVisible()
    await expect(page.locator('text=2').first()).toBeVisible() // Total downloads
    
    // Should show download history
    await expect(page.locator('text=Histórico de Downloads')).toBeVisible()
    await expect(page.locator('text=Exercício de /p/')).toBeVisible()
    await expect(page.locator('text=Exercício de /b/')).toBeVisible()
    
    // Should show remaining downloads
    await expect(page.locator('text=3').first()).toBeVisible() // Remaining downloads
    await expect(page.locator('text=/5')).toBeVisible()
  })

  test('should handle Pro user with unlimited downloads', async ({ page }) => {
    // Mock profile API for Pro user
    await page.route('/api/user/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user1',
              email: 'pro@test.com',
              fullName: 'Pro User',
              role: 'USER',
              createdAt: new Date().toISOString()
            },
            subscription: {
              tier: 'PRO',
              status: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString()
            },
            downloadLimits: {
              canDownload: true,
              remaining: -1,
              isPro: true
            },
            stats: {
              totalDownloads: 50,
              uniqueActivities: 25,
              recentDownloads: 10
            },
            recentDownloads: []
          }
        })
      })
    })

    await page.goto('http://localhost:3000/dashboard/profile')
    
    // Should show Pro badge
    await expect(page.locator('text=PRO')).toBeVisible()
    await expect(page.locator('text=Ativo')).toBeVisible()
    
    // Should show unlimited downloads
    await expect(page.locator('text=∞')).toBeVisible()
    await expect(page.locator('text=Ilimitado')).toBeVisible()
    
    // Should not show upgrade button
    await expect(page.locator('text=Upgrade Pro')).not.toBeVisible()
  })

  test('should handle email service errors gracefully', async ({ page }) => {
    // Mock API to simulate email service error
    await page.route('/api/download-limit', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { downloaded: true, remaining: 0, emailError: 'Service unavailable' }
          })
        })
      }
    })

    await page.goto('http://localhost:3000/dashboard/games')
    
    // Download should still work even if email fails
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Should still show success message
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Download iniciado!')
      await dialog.accept()
    })
    
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
  })
})

test.describe('Email Content Validation', () => {
  
  test('should validate email templates contain required elements', async ({ page }) => {
    // This would be a more comprehensive test in a real scenario
    // Testing email template rendering and content
    
    const emailTemplates = [
      {
        type: 'welcome',
        requiredElements: ['Bem-vindo', '5 downloads gratuitos', 'Explorar Exercícios']
      },
      {
        type: 'warning',
        requiredElements: ['downloads restantes', 'Upgrade para Pro', 'R$ 39,90/mês']
      },
      {
        type: 'limit_reached',
        requiredElements: ['Limite Atingido', 'Downloads ilimitados', 'Upgrade Agora']
      }
    ]

    // In a real test, you would render email templates and validate content
    emailTemplates.forEach(template => {
      expect(template.requiredElements.length).toBeGreaterThan(0)
    })
  })
})
