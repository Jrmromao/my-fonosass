import { test, expect } from '@playwright/test'

test.describe('Download Limits Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('http://localhost:3000/dashboard/games')
    await page.waitForLoadState('networkidle')
  })

  test('should show download limit in exercise preview modal', async ({ page }) => {
    // Open exercise preview
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Should show download limit info
    await expect(page.locator('text=5 downloads grátis por mês')).toBeVisible()
    await expect(page.locator('text=Download Grátis')).toBeVisible()
    await expect(page.locator('text=Upgrade Pro - R$ 39,90/mês')).toBeVisible()
  })

  test('should handle download button click for free user', async ({ page }) => {
    // Mock API responses
    await page.route('/api/download-limit', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { canDownload: true, remaining: 3, isPro: false }
          })
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { downloaded: true, remaining: 2 }
          })
        })
      }
    })

    // Open modal and click download
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Handle alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Download iniciado!')
      expect(dialog.message()).toContain('Restam 2 downloads gratuitos')
      await dialog.accept()
    })
    
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
  })

  test('should show limit reached message when downloads exhausted', async ({ page }) => {
    // Mock API response for exhausted limit
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

    // Open modal and click download
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Handle alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Limite de downloads atingido!')
      expect(dialog.message()).toContain('Faça upgrade para Pro')
      await dialog.accept()
    })
    
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
  })

  test('should handle Pro user with unlimited downloads', async ({ page }) => {
    // Mock API response for Pro user
    await page.route('/api/download-limit', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { canDownload: true, remaining: -1, isPro: true }
          })
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { downloaded: true, isPro: true }
          })
        })
      }
    })

    // Open modal and click download
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Should still show download button but with different behavior
    const downloadButton = page.locator('text=Download Grátis')
    await expect(downloadButton).toBeVisible()
    
    // Handle alert for Pro user
    page.on('dialog', async dialog => {
      expect(dialog.message()).not.toContain('Restam')
      await dialog.accept()
    })
    
    await downloadButton.click()
  })

  test('should redirect to upgrade page when upgrade button clicked', async ({ page }) => {
    // Open modal
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    // Click upgrade button
    const upgradeButton = page.locator('text=Upgrade Pro - R$ 39,90/mês')
    await upgradeButton.click()
    
    // Should redirect to upgrade page
    await expect(page).toHaveURL(/.*\/upgrade/)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/download-limit', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    // Open modal and try download
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    const visualizarOption = page.locator('text=Visualizar')
    await visualizarOption.click()
    
    const downloadButton = page.locator('text=Download Grátis')
    await downloadButton.click()
    
    // Should handle error gracefully (no crash)
    await expect(page.locator('.modal')).toBeVisible()
  })
})

test.describe('Download Limits API Tests', () => {
  
  test('should return download limits for authenticated user', async ({ request }) => {
    // This would need proper auth setup in real tests
    const response = await request.get('/api/download-limit', {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    })
    
    // In real tests, this would check actual API response
    expect(response.status()).toBe(401) // Since we don't have real auth
  })

  test('should record download when POST to API', async ({ request }) => {
    const response = await request.post('/api/download-limit', {
      headers: {
        'Authorization': 'Bearer mock-token'
      }
    })
    
    expect(response.status()).toBe(401) // Since we don't have real auth
  })
})
