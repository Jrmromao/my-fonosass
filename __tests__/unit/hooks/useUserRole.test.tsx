import { useUserRole } from '@/hooks/useUserRole';
import { renderHook, waitFor } from '@testing-library/react';

// Mock Clerk
jest.mock('@clerk/nextjs', () => {
  const mockUseUser = jest.fn();
  return {
    useUser: mockUseUser,
    mockUseUser,
  };
});

// Mock the server action
jest.mock('@/utils', () => {
  const mockGetCurrentUserRole = jest.fn();
  return {
    getCurrentUserRole: mockGetCurrentUserRole,
    mockGetCurrentUserRole,
  };
});

describe('useUserRole', () => {
  const { mockUseUser } = require('@clerk/nextjs');
  const { mockGetCurrentUserRole } = require('@/utils');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user role for regular user', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockGetCurrentUserRole.mockResolvedValue('USER');

    const { result } = renderHook(() => useUserRole());

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.role).toBe('USER');
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 3000 });

    expect(mockGetCurrentUserRole).toHaveBeenCalled();
  });

  it('should return admin role for admin user', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockGetCurrentUserRole.mockResolvedValue('ADMIN');

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.role).toBe('ADMIN');
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 3000 });

    expect(mockGetCurrentUserRole).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
    });

    const { result } = renderHook(() => useUserRole());

    expect(result.current.role).toBe('GUEST');
    expect(result.current.isLoading).toBe(true);
  });

  it('should handle user not signed in', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.role).toBe('GUEST');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle server action error', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    mockGetCurrentUserRole.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useUserRole());

    await waitFor(() => {
      expect(result.current.role).toBe('USER'); // Default fallback
      expect(result.current.isLoading).toBe(false);
    });
  });
});
