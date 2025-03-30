// components/BillingPageClient.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import {SubscribeButton} from "@/components/SubscribeButton";

export function BillingPageClient({ isSubscribed }: { isSubscribed: boolean }) {
    const searchParams = useSearchParams();

    const showSuccessMessage = searchParams.get('success') === 'true';
    const showCanceledMessage = searchParams.get('canceled') === 'true';
    const showRequiredMessage = searchParams.get('required') === 'true';

    return (
        <div className="container mx-auto max-w-4xl py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">
                {showRequiredMessage
                    ? 'Subscription Required'
                    : 'Subscription Plan'}
            </h1>

            {showSuccessMessage && (
                <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg">
                    <p>Thank you for subscribing! Your subscription is now active.</p>
                </div>
            )}

            {showCanceledMessage && (
                <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                    <p>Your subscription process was canceled. Please try again when you're ready.</p>
                </div>
            )}

            {showRequiredMessage && (
                <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded-lg">
                    <p>A subscription is required to access FonoSaaS features. Please subscribe below to continue.</p>
                </div>
            )}

            <div className="border rounded-lg shadow-sm p-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold">FonoSaaS Pro</h2>
                        <p className="text-gray-600 mb-4">Full access to all phoneme exercises and tools</p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Unlimited patients
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                All phoneme exercises
                            </li>
                            <li className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Progress tracking
                            </li>
                        </ul>
                        <div className="text-2xl font-bold mb-6">$9.99<span className="text-base font-normal">/month</span></div>
                    </div>
                </div>

                {isSubscribed ? (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-center">
                        You are currently subscribed. Access all premium features.
                    </div>
                ) : (
                    <SubscribeButton />
                )}
            </div>
        </div>
    );
}