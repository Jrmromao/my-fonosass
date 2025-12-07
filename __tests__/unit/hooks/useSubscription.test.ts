import { useSubscription } from '@/hooks/useSubscription';
import { act, renderHook } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock Prisma enums
jest.mock('@prisma/client', () => ({
  TierType: {
    FREE: 'FREE',
    PRO: 'PRO',
  },
  SubStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    CANCELLED: 'CANCELLED',
    PAST_DUE: 'PAST_DUE',
  },
}));

describe('useSubscription', () => {
  const mockUseQuery = require('@tanstack/react-query').useQuery;
  const mockUseMutation = require('@tanstack/react-query').useMutation;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return subscription data for free user', () => {
    const mockSubscriptionData = {
      tier: 'FREE',
      status: 'ACTIVE',
      subscriptionId: null,
      currentPeriodEnd: null,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscriptionData,
      isLoading: false,
      refetch: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    expect(result.current.subscription).toEqual(mockSubscriptionData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isActive).toBe(true);
    expect(result.current.hasBasicAccess).toBe(true);
    expect(result.current.hasProAccess).toBe(false);
    expect(result.current.tier).toBe('FREE');
  });

  it('should return subscription data for pro user', () => {
    const mockSubscriptionData = {
      tier: 'PRO',
      status: 'ACTIVE',
      subscriptionId: 'sub_123',
      currentPeriodEnd: new Date('2024-12-31'),
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscriptionData,
      isLoading: false,
      refetch: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    expect(result.current.subscription).toEqual(mockSubscriptionData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isActive).toBe(true);
    expect(result.current.hasBasicAccess).toBe(true);
    expect(result.current.hasProAccess).toBe(true);
    expect(result.current.tier).toBe('PRO');
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      refetch: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    expect(result.current.subscription).toBe(null);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isActive).toBe(false);
    expect(result.current.hasBasicAccess).toBe(false);
    expect(result.current.hasProAccess).toBe(false);
    expect(result.current.tier).toBe('FREE');
  });

  it('should handle inactive subscription', () => {
    const mockSubscriptionData = {
      tier: 'PRO',
      status: 'INACTIVE',
      subscriptionId: 'sub_123',
      currentPeriodEnd: new Date('2024-01-01'),
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscriptionData,
      isLoading: false,
      refetch: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    expect(result.current.subscription).toEqual(mockSubscriptionData);
    expect(result.current.isActive).toBe(false);
    expect(result.current.hasBasicAccess).toBe(false);
    expect(result.current.hasProAccess).toBe(false);
  });

  it('should call refetch when refetch is called', () => {
    const mockRefetch = jest.fn();
    
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: mockRefetch,
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    act(() => {
      result.current.refetch();
    });

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle null subscription data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      refetch: jest.fn(),
    });

    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    const { result } = renderHook(() => useSubscription({ billingInterval: 'month' }));

    expect(result.current.subscription).toBe(null);
    expect(result.current.isActive).toBe(false);
    expect(result.current.hasBasicAccess).toBe(false);
    expect(result.current.hasProAccess).toBe(false);
    expect(result.current.tier).toBe('FREE');
  });
});
