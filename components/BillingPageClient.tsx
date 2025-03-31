// components/BillingPageClient.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SubscribeButton } from "@/components/SubscribeButton";
import { Button } from "@/components/ui/button";
import {
    Check,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    CreditCard,
    BarChart,
    Sparkles,
    Calendar,
    Clock
} from "lucide-react";
import { motion } from 'framer-motion';

interface SubscriptionInfo {
    isSubscribed?: boolean;
    tier?: string;
    status?: string;
    currentPeriodEnd?: Date;
}

export function BillingPageClient({ subscription }: { subscription?: SubscriptionInfo }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

    // Safely handle undefined subscription
    const safeSubscription = subscription || {};

    const showSuccessMessage = searchParams.get('success') === 'true';
    const showCanceledMessage = searchParams.get('canceled') === 'true';
    const showRequiredMessage = searchParams.get('required') === 'true';

    const isActive = Boolean(safeSubscription.isSubscribed) && safeSubscription.status === 'ACTIVE';
    const isPastDue = safeSubscription.status === 'PAST_DUE';
    const isInactive = !safeSubscription.isSubscribed || safeSubscription.status === 'INACTIVE';

    const handleGoToDashboard = () => {
        setIsLoading(true);
        router.push('/dashboard');
    };

    // Format date for display
    const formatDate = (date?: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate yearly savings
    const monthlyPrice = 9.99;
    const yearlyPrice = 99.99;
    const yearlySavings = Math.round((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100);

    // Features list
    const features = [
        'Unlimited patients',
        'All phoneme exercises',
        'Progress tracking',
        'Priority support',
        'Material for printing'
    ];

    return (
        <div className="container mx-auto max-w-4xl py-10 px-4">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-white mb-2">
                {showRequiredMessage ? 'Subscription Required' : 'Subscription Plan'}
            </h1>

            {!isInactive && (
                <p className="text-blue-700 dark:text-blue-300 mb-6">
                    Manage your subscription and billing details
                </p>
            )}

            {/* Notification Banners */}
            {showSuccessMessage && (
                <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Thank you for subscribing!</p>
                        <p>Your subscription is now active. You can now access all premium features.</p>
                    </div>
                </div>
            )}

            {showCanceledMessage && (
                <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Checkout canceled</p>
                        <p>Your subscription process was canceled. Please try again when you're ready.</p>
                    </div>
                </div>
            )}

            {showRequiredMessage && (
                <div className="mb-8 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Subscription Required</p>
                        <p>A subscription is required to access premium features. Please subscribe below to continue.</p>
                    </div>
                </div>
            )}

            {isPastDue && (
                <div className="mb-8 p-4 bg-amber-50 text-amber-700 rounded-lg flex items-start">
                    <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Payment issue detected</p>
                        <p>There was a problem with your latest payment. Please update your payment method to avoid service interruption.</p>
                        <Button
                            variant="outline"
                            className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100"
                            onClick={() => {/* Add payment update flow */}}
                        >
                            Update payment method
                        </Button>
                    </div>
                </div>
            )}

            {/* Active Subscription Status Card */}
            {!isInactive && (
                <div className="rounded-xl border border-blue-200 dark:border-indigo-800 shadow-xl shadow-blue-500/5 dark:shadow-indigo-950/10 p-6 mb-8 bg-white dark:bg-indigo-900">
                    <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-white">Subscription Status</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-indigo-800/50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Plan</p>
                            <p className="font-medium flex items-center text-blue-900 dark:text-white">
                                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                                FonoSaaS Pro
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-indigo-800/50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Status</p>
                            <p className={`font-medium flex items-center ${isPastDue ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                                {isPastDue ? (
                                    <Clock className="h-4 w-4 mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                {isPastDue ? 'Payment required' : 'Active'}
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-indigo-800/50 p-4 rounded-lg">
                            <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Renewal date</p>
                            <p className="font-medium text-blue-900 dark:text-white">
                                {formatDate(safeSubscription.currentPeriodEnd)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleGoToDashboard}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20"
                            disabled={isLoading}
                        >
                            <BarChart className="h-4 w-4 mr-2" />
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-indigo-700"
                            onClick={() => {/* Add manage subscription flow */}}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage subscription
                        </Button>
                    </div>
                </div>
            )}

            {/* Billing Toggle (only for non-subscribed users) */}
            {isInactive && (
                <div className="flex justify-center mb-8">
                    <div className="bg-blue-50 dark:bg-indigo-900/40 p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
                                billingInterval === 'monthly'
                                    ? 'bg-white dark:bg-indigo-800 shadow-sm text-blue-700 dark:text-white font-medium'
                                    : 'text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white'
                            }`}
                        >
                            <Calendar size={16} className="mr-1.5" />
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`flex items-center px-4 py-2 rounded-full text-sm transition-all ${
                                billingInterval === 'yearly'
                                    ? 'bg-white dark:bg-indigo-800 shadow-sm text-blue-700 dark:text-white font-medium'
                                    : 'text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white'
                            }`}
                        >
                            <Calendar size={16} className="mr-1.5" />
                            Yearly
                            <span className="ml-1.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                -{yearlySavings}%
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Subscription Plan Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-blue-200 dark:border-indigo-800 bg-white dark:bg-indigo-900 shadow-xl shadow-blue-500/5 dark:shadow-indigo-950/10"
            >
                {/* Card Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-2">
                                Full Access
                            </span>
                            <h3 className="text-white text-xl font-bold">FonoSaaS Pro</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-yellow-300" />
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                    {isInactive && (
                        <div className="mb-6 text-center">
                            <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">
                                {billingInterval === 'monthly' ? 'Monthly billing' : 'Annual billing'}
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="text-5xl font-bold text-blue-900 dark:text-white">
                                    ${billingInterval === 'monthly' ? monthlyPrice : yearlyPrice}
                                </span>
                                <span className="text-blue-600 dark:text-blue-300 ml-1">
                                    /{billingInterval === 'monthly' ? 'month' : 'year'}
                                </span>
                            </div>
                            {billingInterval === 'yearly' && (
                                <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                                    Save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)} per year
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 uppercase tracking-wider mb-2">
                            Includes:
                        </div>
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-start">
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <Check size={14} />
                                    </div>
                                </div>
                                <span className="ml-3 text-blue-700 dark:text-blue-300">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {isActive ? (
                        <div className="space-y-3">
                            <Button
                                className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20 transition-all flex items-center justify-center"
                                onClick={handleGoToDashboard}
                                disabled={isLoading}
                            >
                                <BarChart size={18} className="mr-2" />
                                {isLoading ? 'Loading...' : 'Go to Dashboard'}
                            </Button>

                            <Button
                                className="w-full py-6 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-indigo-800/50 dark:hover:bg-indigo-800 text-blue-700 dark:text-blue-100 font-medium transition-all flex items-center justify-center"
                                onClick={() => {/* Add manage subscription flow */}}
                            >
                                <CreditCard size={18} className="mr-2" />
                                Manage Subscription
                            </Button>
                        </div>
                    ) : isPastDue ? (
                        <Button
                            className="w-full py-6 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center"
                            onClick={() => {/* Add payment update flow */}}
                        >
                            <CreditCard size={18} className="mr-2" />
                            Update Payment Method
                        </Button>
                    ) : (
                        <SubscribeButton
                            className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20 transition-all flex items-center justify-center"
                            priceId={billingInterval === 'monthly' ?
                                process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID :
                                process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID}
                        />
                    )}

                    <div className="mt-4 text-xs text-center text-blue-500 dark:text-blue-400">
                        Cancel anytime. No hidden fees.
                    </div>
                </div>
            </motion.div>
        </div>
    );
}