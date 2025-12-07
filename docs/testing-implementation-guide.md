# 🛠️ Testing Implementation Guide

**Created**: January 2025  
**Purpose**: Step-by-step implementation guide for the comprehensive test plan  
**Status**: Ready for Implementation  

---

## 📋 **Implementation Overview**

This guide provides detailed instructions for implementing the comprehensive test plan for Almanaque da Fala. It includes setup instructions, code examples, and best practices for each testing category.

---

## 🚀 **Phase 1: Foundation Setup (Week 1-2)**

### **1.1 Install Testing Dependencies**

```bash
# Core testing libraries
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev jest jest-environment-jsdom @types/jest
npm install --save-dev @testing-library/react-hooks

# E2E testing
npm install --save-dev playwright @playwright/test

# API testing
npm install --save-dev supertest @types/supertest

# Coverage and reporting
npm install --save-dev jest-html-reporters
npm install --save-dev @jest/globals

# Mocking utilities
npm install --save-dev jest-mock-extended
```

### **1.2 Jest Configuration**

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
```

### **1.3 Test Setup Files**

```typescript
// __tests__/setup/jest.setup.js
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure testing library
configure({ testIdAttribute: 'data-testid' })

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isSignedIn: true,
    userId: 'user_123',
    sessionId: 'session_123',
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  auth: () => ({
    userId: 'user_123',
  }),
}))

// Mock external services
jest.mock('@/services/S3Service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getInstance: jest.fn().mockReturnThis(),
    uploadFile: jest.fn().mockResolvedValue({}),
    deleteFile: jest.fn().mockResolvedValue({}),
  })),
}))

jest.mock('@/services/PDFService', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getInstance: jest.fn().mockReturnThis(),
    generatePDF: jest.fn().mockResolvedValue(Buffer.from('mock pdf')),
  })),
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_ACCESS_KEY_ID = 'test-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
```

### **1.4 Test Utilities**

```typescript
// __tests__/utils/test-utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/nextjs'

// Mock Clerk provider
const MockClerkProvider = ({ children }: { children: React.ReactNode }) => (
  <ClerkProvider publishableKey="pk_test_mock">
    {children}
  </ClerkProvider>
)

// Create a custom render function
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockClerkProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MockClerkProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock user data
export const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER' as const,
}

// Mock activity data
export const mockActivity = {
  id: 'activity_123',
  name: 'Test Activity',
  description: 'Test Description',
  type: 'SPEECH' as const,
  difficulty: 'BEGINNER' as const,
  ageRange: 'CHILD' as const,
  isPublic: true,
  createdById: 'user_123',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
```

---

## 🧩 **Phase 2: Component Testing (Week 3-4)**

### **2.1 UI Component Tests**

```typescript
// __tests__/unit/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@/__tests__/utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

### **2.2 Form Component Tests**

```typescript
// __tests__/unit/components/auth/CustomSignInForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { CustomSignInForm } from '@/components/auth/CustomSignInForm'

// Mock the sign-in hook
jest.mock('@clerk/nextjs', () => ({
  ...jest.requireActual('@clerk/nextjs'),
  useSignIn: () => ({
    signIn: {
      create: jest.fn().mockResolvedValue({
        status: 'complete',
        createdSessionId: 'session_123',
      }),
    },
    setActive: jest.fn(),
    isLoaded: true,
  }),
}))

describe('CustomSignInForm', () => {
  it('renders sign-in form fields', () => {
    render(<CustomSignInForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<CustomSignInForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<CustomSignInForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      status: 'complete',
      createdSessionId: 'session_123',
    })

    jest.doMock('@clerk/nextjs', () => ({
      useSignIn: () => ({
        signIn: { create: mockSignIn },
        setActive: jest.fn(),
        isLoaded: true,
      }),
    }))

    render(<CustomSignInForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123',
      })
    })
  })
})
```

### **2.3 Page Component Tests**

```typescript
// __tests__/unit/pages/dashboard/Dashboard.test.tsx
import { render, screen } from '@/__tests__/utils/test-utils'
import Dashboard from '@/app/dashboard/page'

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

describe('Dashboard', () => {
  it('renders dashboard with all sections', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/overview/i)).toBeInTheDocument()
    expect(screen.getByText(/activities/i)).toBeInTheDocument()
    expect(screen.getByText(/patients/i)).toBeInTheDocument()
  })

  it('shows user statistics', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/total activities/i)).toBeInTheDocument()
    expect(screen.getByText(/active patients/i)).toBeInTheDocument()
    expect(screen.getByText(/completed sessions/i)).toBeInTheDocument()
  })

  it('displays recent activities', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/recent activities/i)).toBeInTheDocument()
  })

  it('shows quick actions', () => {
    render(<Dashboard />)
    
    expect(screen.getByText(/create activity/i)).toBeInTheDocument()
    expect(screen.getByText(/add patient/i)).toBeInTheDocument()
  })
})
```

---

## 🔌 **Phase 3: API Testing (Week 5-6)**

### **3.1 API Route Tests**

```typescript
// __tests__/integration/api/waiting-list/waiting-list.test.ts
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/waiting-list/route'

// Mock S3Service
jest.mock('@/services/S3Service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getInstance: jest.fn().mockReturnThis(),
    uploadFile: jest.fn().mockResolvedValue({}),
  })),
}))

describe('/api/waiting-list', () => {
  it('should add email to waiting list', async () => {
    const request = new NextRequest('http://localhost:3000/api/waiting-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Email adicionado à lista de espera com sucesso!')
  })

  it('should validate email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/waiting-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email inválido')
  })

  it('should handle missing email', async () => {
    const request = new NextRequest('http://localhost:3000/api/waiting-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email inválido')
  })
})
```

### **3.2 Database Integration Tests**

```typescript
// __tests__/integration/database/user-operations.test.ts
import { prisma } from '@/app/db'
import { createUser, getUserById, updateUser, deleteUser } from '@/lib/actions/user.action'

describe('User Database Operations', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    // Clean up after all tests
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should create a new user', async () => {
    const userData = {
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER' as const,
    }

    const user = await createUser(userData)

    expect(user).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.fullName).toBe(userData.fullName)
    expect(user.role).toBe(userData.role)
  })

  it('should get user by ID', async () => {
    const userData = {
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER' as const,
    }

    const createdUser = await createUser(userData)
    const retrievedUser = await getUserById(createdUser.id)

    expect(retrievedUser).toBeDefined()
    expect(retrievedUser?.id).toBe(createdUser.id)
    expect(retrievedUser?.email).toBe(userData.email)
  })

  it('should update user', async () => {
    const userData = {
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER' as const,
    }

    const createdUser = await createUser(userData)
    const updatedUser = await updateUser(createdUser.id, {
      fullName: 'Updated User',
    })

    expect(updatedUser).toBeDefined()
    expect(updatedUser.fullName).toBe('Updated User')
    expect(updatedUser.email).toBe(userData.email)
  })

  it('should delete user', async () => {
    const userData = {
      clerkUserId: 'clerk_123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER' as const,
    }

    const createdUser = await createUser(userData)
    await deleteUser(createdUser.id)

    const deletedUser = await getUserById(createdUser.id)
    expect(deletedUser).toBeNull()
  })
})
```

---

## 🔒 **Phase 4: Security Testing (Week 7)**

### **4.1 Authentication Tests**

```typescript
// __tests__/security/auth/authentication.test.ts
import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

describe('Authentication Security', () => {
  it('should require authentication for protected routes', async () => {
    const mockAuth = auth as jest.MockedFunction<typeof auth>
    mockAuth.mockResolvedValue({ userId: null })

    // Test protected API route
    const request = new NextRequest('http://localhost:3000/api/admin/waiting-list')
    const response = await GET(request)
    
    expect(response.status).toBe(401)
  })

  it('should allow authenticated users to access protected routes', async () => {
    const mockAuth = auth as jest.MockedFunction<typeof auth>
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    const request = new NextRequest('http://localhost:3000/api/admin/waiting-list')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
  })

  it('should validate user roles', async () => {
    // Test role-based access control
    const mockAuth = auth as jest.MockedFunction<typeof auth>
    mockAuth.mockResolvedValue({ userId: 'user_123' })

    // Mock user with USER role trying to access ADMIN route
    // This should be handled by role validation
  })
})
```

### **4.2 Input Validation Tests**

```typescript
// __tests__/security/input-validation/sql-injection.test.ts
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/waiting-list/route'

describe('SQL Injection Prevention', () => {
  it('should prevent SQL injection in email field', async () => {
    const maliciousInput = "test@example.com'; DROP TABLE users; --"
    
    const request = new NextRequest('http://localhost:3000/api/waiting-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: maliciousInput }),
    })

    const response = await POST(request)
    
    // Should not cause database error
    expect(response.status).not.toBe(500)
  })

  it('should sanitize XSS attempts', async () => {
    const xssPayload = '<script>alert("XSS")</script>@example.com'
    
    const request = new NextRequest('http://localhost:3000/api/waiting-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: xssPayload }),
    })

    const response = await POST(request)
    const data = await response.json()
    
    // Should sanitize the input
    expect(data.message).not.toContain('<script>')
  })
})
```

---

## 🎭 **Phase 5: E2E Testing (Week 8)**

### **5.1 Playwright Configuration**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### **5.2 E2E Test Examples**

```typescript
// __tests__/e2e/auth/sign-up-flow.test.ts
import { test, expect } from '@playwright/test'

test.describe('User Sign Up Flow', () => {
  test('should complete user registration', async ({ page }) => {
    await page.goto('/sign-up')

    // Fill out the form
    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.fill('[data-testid="email"]', 'john.doe@example.com')
    await page.fill('[data-testid="password"]', 'SecurePassword123!')
    await page.fill('[data-testid="confirm-password"]', 'SecurePassword123!')

    // Submit the form
    await page.click('[data-testid="sign-up-button"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/sign-up')

    // Try to submit empty form
    await page.click('[data-testid="sign-up-button"]')

    // Check for validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible()
  })

  test('should handle password mismatch', async ({ page }) => {
    await page.goto('/sign-up')

    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.fill('[data-testid="confirm-password"]', 'differentpassword')

    await page.click('[data-testid="sign-up-button"]')

    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible()
  })
})
```

---

## 📊 **Test Execution & Reporting**

### **Package.json Scripts**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=__tests__/unit",
    "test:integration": "jest --testPathPattern=__tests__/integration",
    "test:security": "jest --testPathPattern=__tests__/security",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:security && npm run test:e2e",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

### **Coverage Configuration**

```javascript
// jest.config.js - Coverage settings
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  './app/': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
  './components/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

---

## 🚀 **Implementation Timeline**

### **Week 1-2: Foundation**
- [ ] Setup testing infrastructure
- [ ] Configure Jest and Playwright
- [ ] Create test utilities and helpers
- [ ] Setup CI/CD integration

### **Week 3-4: Component Testing**
- [ ] Test all UI components (50+ components)
- [ ] Test form components
- [ ] Test page components
- [ ] Test custom hooks

### **Week 5-6: API Testing**
- [ ] Test all API routes (15+ endpoints)
- [ ] Test database operations
- [ ] Test external service integration
- [ ] Test webhook processing

### **Week 7: Security Testing**
- [ ] Test authentication/authorization
- [ ] Test input validation
- [ ] Test data protection
- [ ] Test API security

### **Week 8: E2E Testing**
- [ ] Test critical user journeys
- [ ] Test cross-browser compatibility
- [ ] Test mobile responsiveness
- [ ] Performance testing

---

## 📈 **Success Metrics**

### **Coverage Targets**
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: 100% API endpoint coverage
- **Security Tests**: 100% security scenario coverage
- **E2E Tests**: 100% critical user journey coverage

### **Quality Metrics**
- **Test Execution Time**: < 10 minutes for full suite
- **Test Reliability**: 99%+ pass rate
- **Bug Detection**: 95%+ of bugs caught before production

---

## 🎯 **Next Steps**

1. **Review and approve** this implementation guide
2. **Setup testing infrastructure** following Phase 1
3. **Begin component testing** following Phase 2
4. **Implement API testing** following Phase 3
5. **Add security testing** following Phase 4
6. **Complete E2E testing** following Phase 5
7. **Monitor and maintain** test coverage

**Total Estimated Effort**: 8 weeks (2 developers)  
**Expected Outcome**: 95%+ test coverage with comprehensive quality assurance

---

*This implementation guide provides the detailed steps needed to achieve comprehensive test coverage for the Almanaque da Fala application.*
