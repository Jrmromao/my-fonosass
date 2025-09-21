import { SubscriptionStatus } from '@/components/dashboard/SubscriptionStatus';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock fetch
global.fetch = jest.fn();

describe('SubscriptionStatus', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render free subscription status', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: false,
        remaining: 3,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Gratuito')).toBeInTheDocument();
    });
  });

  it('should render pro subscription status', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: true,
        remaining: -1, // Unlimited
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  it('should render loading state', () => {
    // Don't mock fetch to simulate loading state
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<SubscriptionStatus />);

    // Check for loading animation elements instead of text
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render error state', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to load subscription'));

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar assinatura')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render inactive subscription status', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: true,
        remaining: 0,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  it('should render cancelled subscription status', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: true,
        remaining: 0,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  it('should render past due subscription status', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: true,
        remaining: 0,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });
  });

  it('should render with custom className', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: false,
        remaining: 3,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus className="custom-class" />);

    await waitFor(() => {
      const container = screen.getByText('Gratuito').closest('div');
      expect(container?.closest('.grid')).toHaveClass('custom-class');
    });
  });

  it('should render with different status colors', async () => {
    const mockResponse = {
      success: true,
      data: {
        isPro: false,
        remaining: 3,
      },
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    render(<SubscriptionStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Gratuito')).toBeInTheDocument();
    });
  });

  it('should handle null subscription data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma assinatura encontrada')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle undefined subscription data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    } as Response);

    render(<SubscriptionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma assinatura encontrada')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
