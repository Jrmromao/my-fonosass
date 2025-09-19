import { test, expect } from '@playwright/test'

test.describe('Week 1 MVP Features - Integration Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
  })

  test('should display landing page and allow navigation to dashboard', async ({ page }) => {
    // Check landing page loads
    await expect(page).toHaveTitle(/FonoSaaS/)
    
    // Should have sign-in option
    const signInButton = page.locator('text=Entrar')
    await expect(signInButton).toBeVisible()
  })

  test('should display exercises in dashboard games page', async ({ page }) => {
    // Skip auth for testing - go directly to games page
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Should show exercises table
    await expect(page.locator('[data-testid="activities-table"]')).toBeVisible()
    
    // Should have search functionality
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await expect(searchInput).toBeVisible()
    
    // Should have filter tabs
    await expect(page.locator('text=Fonemas')).toBeVisible()
    await expect(page.locator('text=Tipos')).toBeVisible()
  })

  test('should show exercise preview when clicking actions', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Wait for table to load
    await page.waitForSelector('[data-testid="activities-table"]', { timeout: 10000 })
    
    // Click first action button (three dots)
    const actionButton = page.locator('button:has-text("⋯")').first()
    await actionButton.click()
    
    // Should show dropdown with Visualizar option
    const visualizarOption = page.locator('text=Visualizar')
    await expect(visualizarOption).toBeVisible()
    
    // Click Visualizar
    await visualizarOption.click()
    
    // Should show alert with exercise details
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Preview:')
      expect(dialog.message()).toContain('Descrição:')
      await dialog.accept()
    })
  })

  test('should filter exercises by phoneme', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Click on Fonemas tab
    await page.click('text=Fonemas')
    
    // Should show phoneme filters
    await expect(page.locator('text=/p/')).toBeVisible()
    await expect(page.locator('text=/k/')).toBeVisible()
    
    // Click on a specific phoneme
    await page.click('text=/p/')
    
    // Table should update with filtered results
    await page.waitForTimeout(1000) // Wait for filter to apply
    
    // Should show exercises with /p/ phoneme
    const tableRows = page.locator('tbody tr')
    await expect(tableRows).toHaveCountGreaterThan(0)
  })

  test('should search exercises by name', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Wait for table to load
    await page.waitForSelector('[data-testid="activities-table"]')
    
    // Search for specific exercise
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('Fonema')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Should show filtered results
    const tableRows = page.locator('tbody tr')
    await expect(tableRows).toHaveCountGreaterThan(0)
  })

  test('should display exercise categories and types', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Switch to Types tab
    await page.click('text=Tipos')
    
    // Should show different exercise types
    await expect(page.locator('text=ANIMALS')).toBeVisible()
    await expect(page.locator('text=COLOURS')).toBeVisible()
    await expect(page.locator('text=MEANS_OF_TRANSPORT')).toBeVisible()
    
    // Click on a type
    await page.click('text=ANIMALS')
    
    // Should filter by type
    await page.waitForTimeout(1000)
    const tableRows = page.locator('tbody tr')
    await expect(tableRows).toHaveCountGreaterThan(0)
  })

  test('should show exercise difficulty badges', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Wait for table to load
    await page.waitForSelector('[data-testid="activities-table"]')
    
    // Should show difficulty badges
    await expect(page.locator('text=BEGINNER')).toBeVisible()
    await expect(page.locator('text=INTERMEDIATE')).toBeVisible()
    await expect(page.locator('text=ADVANCED')).toBeVisible()
  })

  test('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Should show sidebar navigation
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Exercícios')).toBeVisible()
    
    // Click on Exercícios
    await page.click('text=Exercícios')
    
    // Should navigate to games page
    await expect(page).toHaveURL(/.*\/dashboard\/games/)
    
    // Should show exercises page content
    await expect(page.locator('text=Fonemas')).toBeVisible()
  })

  test('should display seeded exercise data', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="activities-table"]')
    
    // Should show at least 10 seeded exercises
    const tableRows = page.locator('tbody tr')
    await expect(tableRows).toHaveCountGreaterThanOrEqual(10)
    
    // Should show specific seeded exercises
    await expect(page.locator('text=Exercício de Fonema /P/')).toBeVisible()
    await expect(page.locator('text=Cores e Sons /K/')).toBeVisible()
  })

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/games')
    
    // Search for non-existent exercise
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill('NonExistentExercise123')
    
    // Wait for search
    await page.waitForTimeout(1000)
    
    // Should show empty state or no results
    const tableRows = page.locator('tbody tr')
    await expect(tableRows).toHaveCount(0)
  })
})

test.describe('Week 1 API Integration Tests', () => {
  
  test('should fetch exercises from API', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/exercises')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
    expect(data.data.length).toBeGreaterThan(0)
  })

  test('should filter exercises by query parameters', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/exercises?search=Fonema')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeInstanceOf(Array)
  })

  test('should handle unauthorized requests properly', async ({ request }) => {
    // Test without authentication
    const response = await request.post('http://localhost:3000/api/exercises', {
      data: {
        name: 'Test Exercise',
        description: 'Test Description'
      }
    })
    
    expect(response.status()).toBe(401)
  })
})
