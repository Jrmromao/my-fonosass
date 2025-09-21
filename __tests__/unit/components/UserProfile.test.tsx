import { UserProfile } from '@/components/user/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('tab=profile'),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useCSRF hook
jest.mock('@/hooks/useCSRF', () => ({
  useCSRF: () => ({
    fetchCSRFToken: jest.fn().mockResolvedValue('mock-csrf-token'),
  }),
}));

const mockToast = jest.fn();
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockProfileData = {
  user: {
    id: 'user_123',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'USER',
    createdAt: '2024-01-01T00:00:00Z',
  },
  subscription: {
    tier: 'FREE',
    status: 'ACTIVE',
    currentPeriodEnd: null,
  },
  downloadLimits: {
    canDownload: true,
    remaining: 5,
    isPro: false,
  },
  stats: {
    totalDownloads: 10,
    uniqueActivities: 5,
    recentDownloads: 2,
  },
  recentDownloads: [
    {
      id: 'download_1',
      fileName: 'activity1.pdf',
      downloadedAt: '2024-01-15T10:00:00Z',
      activity: {
        id: 'activity_1',
        name: 'Test Activity',
        type: 'SPEECH',
        phoneme: 's',
        difficulty: 'BEGINNER',
      },
    },
  ],
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    });
    // Set up default fetch mock for all tests
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockProfileData }),
      ok: true,
      status: 200,
    });
  });

  it('renders profile information correctly', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('FREE')).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    render(<UserProfile />);
    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });
  });

  it('displays stats cards correctly', async () => {
    render(<UserProfile />);

    // Wait for the component to load data and render the profile content
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Wait for the stats cards to be rendered
    await waitFor(() => {
      expect(screen.getByText('Total Downloads')).toBeInTheDocument();
      expect(screen.getByText('Exercícios Únicos')).toBeInTheDocument();
      expect(screen.getByText('Downloads Restantes')).toBeInTheDocument();
    });

    // Now check for stats values
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // totalDownloads
      expect(screen.getAllByText('5')).toHaveLength(2); // uniqueActivities and remaining downloads
      expect(screen.getByText('/5')).toBeInTheDocument(); // remaining downloads format
    });
  });

  it('shows recent downloads', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Activity')).toBeInTheDocument();
      expect(screen.getByText('activity1.pdf')).toBeInTheDocument();
    });
  });

  it('enters edit mode when edit button is clicked', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Salvar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('cancels edit mode and resets form', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Modify form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Modified Name' } });

    // Cancel edit
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Should return to display mode with original values
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Modified Name')).not.toBeInTheDocument();
  });

  it('validates required fields before saving', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Clear required fields
    const nameInput = screen.getByDisplayValue('Test User');
    const emailInput = screen.getByDisplayValue('test@example.com');

    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.change(emailInput, { target: { value: '' } });

    // Try to save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // The validation should prevent the save, so no toast should be called
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('updates profile successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockProfileData }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            message: 'Profile updated successfully',
          }),
      });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Modify form
    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'mock-csrf-token',
        },
        body: JSON.stringify({
          fullName: 'Updated Name',
          email: 'test@example.com',
        }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Sucesso',
      description: 'Perfil atualizado com sucesso',
    });
  });

  it('handles profile update errors', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockProfileData }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ success: false, message: 'Update failed' }),
      });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);

    // Save
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil',
        variant: 'destructive',
      });
    });
  });

  it('handles fetch profile errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<UserProfile />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil',
        variant: 'destructive',
      });
    });
  });

  it('shows upgrade button for free users', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('Upgrade Pro')).toBeInTheDocument();
    });
  });

  it('displays download limits correctly for free users', async () => {
    render(<UserProfile />);

    // Wait for the component to load data and render the profile content
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Wait for the download limits card to be rendered
    await waitFor(() => {
      expect(screen.getByText('Downloads Restantes')).toBeInTheDocument();
    });

    // Now check for download limits
    await waitFor(() => {
      expect(screen.getByText('/5')).toBeInTheDocument(); // remaining downloads format
      expect(screen.getByText('Este mês')).toBeInTheDocument();
    });
  });

  it('displays unlimited downloads for pro users', async () => {
    const proProfileData = {
      ...mockProfileData,
      subscription: { ...mockProfileData.subscription, tier: 'PRO' },
      downloadLimits: {
        ...mockProfileData.downloadLimits,
        isPro: true,
        remaining: Infinity,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: proProfileData }),
    });

    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('∞')).toBeInTheDocument();
      expect(screen.getByText('Ilimitado')).toBeInTheDocument();
    });
  });
});
