'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TierType, SubStatus } from '@prisma/client';



export function useSubscription({billingInterval}: {billingInterval: string}) {
    // Get subscription status
    const {
        data: subscription,
        isLoading,
        refetch
    } = useQuery({
        queryKey: ['subscription'],
        queryFn: async () => {
            const response = await fetch('/api/user/subscription');
            if (!response.ok) {
                throw new Error('Failed to fetch subscription');
            }
            return response.json();
        },
    });

    // Create checkout session for new subscription
    const { mutate: createCheckout, isPending: isCreatingCheckout } = useMutation({
        mutationFn: async ({ priceId, tier }: { priceId: string; tier: TierType }) => {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId, tier, billingInterval }),
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Redirect to Stripe Checkout
            window.location.href = data.url;
        },
        onError: () => {
            toast.error('Failed to create checkout session');
        },
    });

    // Create portal session for managing subscription
    const { mutate: createPortal, isPending: isCreatingPortal } = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/stripe/create-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to create portal session');
            }

            return response.json();
        },
        onSuccess: (data) => {
            // Redirect to Stripe Customer Portal
            window.location.href = data.url;
        },
        onError: () => {
            toast.error('Failed to open billing portal');
        },
    });

    // Helper function to check if subscription is active
    const isActive = subscription?.status === SubStatus.ACTIVE;

    // Helper function to check if user has access to specific tier features
    const hasAccess = (requiredTier: TierType) => {
        if (!subscription) return false;
        if (!isActive) return false;

        // FREE < PRO
        const tierValues: Record<TierType, number> = {
            [TierType.FREE]: 0,
            [TierType.PRO]: 1
        };

        // Make sure subscription.tier is a valid key
        const currentTier = subscription.tier as TierType;

        return tierValues[currentTier] >= tierValues[requiredTier];
    };

    return {
        subscription,
        isLoading,
        refetch,
        createCheckout,
        isCreatingCheckout,
        createPortal,
        isCreatingPortal,
        // Helper properties
        isActive,
        hasBasicAccess: hasAccess(TierType.FREE),
        hasProAccess: hasAccess(TierType.PRO),
        tier: subscription?.tier || TierType.FREE,
    };
}