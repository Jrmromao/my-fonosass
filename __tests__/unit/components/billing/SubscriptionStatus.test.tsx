import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('SubscriptionStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render free tier status correctly', async () => {
    // Arrange
    const mockData = {
      success: true,
      data: {
        isPro: false,
        remaining: 2,
        limit: 5,
        used: 3,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    // Act
    render(<SubscriptionStatus />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Gratuito')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Downloads remaining
      expect(screen.getByText('Downloads restantes')).toBeInTheDocument();
      expect(
        screen.getByText('Upgrade para Pro - R$ 39,90/mês')
      ).toBeInTheDocument();
    });
  });

  it('should render pro tier status correctly', async () => {
    // Arrange
    const mockData = {
      success: true,
      data: {
        isPro: true,
        remaining: 999999,
        limit: 999999,
        used: 150,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    // Act
    render(<SubscriptionStatus />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('∞')).toBeInTheDocument(); // Unlimited symbol
      expect(screen.getByText('Downloads ilimitados')).toBeInTheDocument();
    });
  });

  it('should handle upgrade button click', async () => {
    // Arrange
    const mockData = {
      success: true,
      data: {
        isPro: false,
        remaining: 2,
        limit: 5,
        used: 3,
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ url: 'https://checkout.stripe.com/session-123' }),
      });

    // Act
    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(
        screen.getByText('Upgrade para Pro - R$ 39,90/mês')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Upgrade para Pro - R$ 39,90/mês'));

    // Assert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  it('should handle error state', async () => {
    // Arrange
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Act
    render(<SubscriptionStatus />);

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar assinatura')
      ).toBeInTheDocument();
    });
  });

  it('should show progress bar for free tier', async () => {
    // Arrange
    const mockData = {
      success: true,
      data: {
        isPro: false,
        remaining: 2,
        limit: 5,
        used: 3,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    // Act
    render(<SubscriptionStatus />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Downloads remaining
      expect(screen.getByText('Downloads restantes')).toBeInTheDocument();
    });
  });

  it('should not show progress bar for pro tier', async () => {
    // Arrange
    const mockData = {
      success: true,
      data: {
        isPro: true,
        remaining: 999999,
        limit: 999999,
        used: 150,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    // Act
    render(<SubscriptionStatus />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('∞')).toBeInTheDocument(); // Unlimited symbol
      expect(screen.getByText('Downloads ilimitados')).toBeInTheDocument();
    });
  });
});
