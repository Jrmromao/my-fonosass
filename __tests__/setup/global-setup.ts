import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const title = await page.title();
    console.log(`✅ Application is running. Title: ${title}`);
    
    // Optional: Set up test data or authentication state
    await setupTestData(page);
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  try {
    // Create test user if needed
    console.log('📝 Setting up test data...');
    
    // You can add test data setup here
    // For example, creating test users, seeding database, etc.
    
    console.log('✅ Test data setup completed');
  } catch (error) {
    console.warn('⚠️ Test data setup failed:', error);
    // Don't fail the entire setup if test data setup fails
  }
}

export default globalSetup;
