import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('http://localhost:3000');
  });

  test('should redirect unauthenticated user to sign-in page', async ({ page }) => {
    // Try to access protected route
    await page.goto('http://localhost:3000/dashboard');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
    await expect(page.locator('h1')).toContainText('Entrar');
  });

  test('should display sign-in form correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Check if sign-in form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for sign-up link
    await expect(page.locator('a[href*="sign-up"]')).toBeVisible();
  });

  test('should display sign-up form correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-up');
    
    // Check if sign-up form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for sign-in link
    await expect(page.locator('a[href*="sign-in"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Fill in invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=Email inválido')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
  });

  test('should navigate between sign-in and sign-up pages', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Click on sign-up link
    await page.click('a[href*="sign-up"]');
    await expect(page).toHaveURL(/.*sign-up/);
    
    // Click on sign-in link
    await page.click('a[href*="sign-in"]');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Fill in valid format but non-existent credentials
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });

  test('should remember user after successful login', async ({ page }) => {
    // Mock successful authentication
    await page.goto('http://localhost:3000/sign-in');
    
    // Fill in valid credentials (mocked)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Refresh page and should still be authenticated
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should logout user successfully', async ({ page }) => {
    // Mock authenticated state
    await page.goto('http://localhost:3000/dashboard');
    
    // Click logout button
    await page.click('button[data-testid="logout-button"]');
    
    // Should be redirected to home page
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Try to access protected route
    await page.goto('http://localhost:3000/dashboard');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should handle OAuth callback correctly', async ({ page }) => {
    // Mock OAuth callback
    await page.goto('http://localhost:3000/sso-callback?code=test-code&state=test-state');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should handle OAuth callback errors', async ({ page }) => {
    // Mock OAuth callback with error
    await page.goto('http://localhost:3000/sso-callback?error=access_denied');
    
    // Should be redirected to sign-in page with error
    await expect(page).toHaveURL(/.*sign-in/);
    await expect(page.locator('text=Erro na autenticação')).toBeVisible();
  });

  test('should show loading state during authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Click submit and check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading indicator
    await expect(page.locator('text=Entrando...')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000/sign-in');
    
    // Check if form is still usable on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check if text is readable
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should handle form submission with Enter key', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Should attempt to submit form
    await expect(page.locator('text=Entrando...')).toBeVisible();
  });
});
