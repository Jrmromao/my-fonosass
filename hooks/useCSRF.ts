import { useCallback, useEffect, useState } from 'react';

interface CSRFResponse {
  success: boolean;
  csrfToken: string;
  message: string;
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCSRFToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data: CSRFResponse = await response.json();

      if (data.success && data.csrfToken) {
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      } else {
        throw new Error('Invalid CSRF token response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching CSRF token:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHeaders = useCallback(() => {
    if (!csrfToken) {
      return {};
    }

    return {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    };
  }, [csrfToken]);

  const refreshToken = useCallback(() => {
    return fetchCSRFToken();
  }, [fetchCSRFToken]);

  // Auto-fetch token on mount
  useEffect(() => {
    fetchCSRFToken();
  }, [fetchCSRFToken]);

  return {
    csrfToken,
    isLoading,
    error,
    fetchCSRFToken,
    getHeaders,
    refreshToken,
  };
}
