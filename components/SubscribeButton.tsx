// components/SubscribeButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SubscribeButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call the API route to create a checkout session
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.url) {
                throw new Error('No checkout URL returned');
            }

            // Redirect to Stripe checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Error:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
            </Button>
        </div>
    );
}