// Re-export everything from testing library
export * from '@testing-library/react';

// Import the custom render function from the JSX file
export { render } from './test-utils-render';

// Mock data generators
export const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'USER' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  subscriptions: {
    tier: 'FREE' as const,
    status: 'ACTIVE' as const,
    currentPeriodEnd: null,
  },
};

export const mockAdminUser = {
  ...mockUser,
  role: 'ADMIN' as const,
  subscriptions: {
    tier: 'PRO' as const,
    status: 'ACTIVE' as const,
    currentPeriodEnd: new Date('2025-12-31'),
  },
};

export const mockActivity = {
  id: 'activity_123',
  name: 'Test Activity',
  description: 'Test description',
  phoneme: '/p/',
  type: 'ANIMALS' as const,
  difficulty: 'EASY' as const,
  ageGroup: '3-5' as const,
  fileUrl: 'https://example.com/activity.pdf',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPatient = {
  id: 'patient_123',
  name: 'Test Patient',
  email: 'patient@example.com',
  phone: '+5511999999999',
  birthDate: new Date('2010-01-01'),
  diagnosis: 'Test diagnosis',
  notes: 'Test notes',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  userId: 'user_123',
};

// Mock functions
export const mockNavigate = jest.fn();
export const mockRouter = {
  push: mockNavigate,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// Mock error responses
export const mockApiError = (message: string, status = 500) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ error: message }),
  text: () => Promise.resolve(JSON.stringify({ error: message })),
});

// Test data factories
export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
});

export const createMockActivity = (
  overrides: Partial<typeof mockActivity> = {}
) => ({
  ...mockActivity,
  ...overrides,
});

export const createMockPatient = (
  overrides: Partial<typeof mockPatient> = {}
) => ({
  ...mockPatient,
  ...overrides,
});

// Wait for async operations
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock file upload
export const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock form data
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock sessionStorage
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

// Mock IntersectionObserver
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Mock matchMedia
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock fetch
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock;
};

// Mock fetch error
export const mockFetchError = (message: string, status = 500) => {
  global.fetch = jest.fn(() => Promise.reject(new Error(message))) as jest.Mock;
};

// Cleanup function
export const cleanup = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
