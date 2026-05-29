import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, CreditCard } from 'lucide-react';
import { SubStatus, TierType } from '@prisma/client';
import Link from 'next/link';

// Define your price IDs from Stripe
const PLAN = {
    name: 'Profissional',
    description: 'Para fonoaudiólogos trabalhando com exercícios de fonemas',
    features: [
        'Acesso a todos os exercícios de fonemas',
        'Biblioteca completa de recursos',
        'Material para imprimir',
        'Materiais de referência estendidos',
        'Suporte por email prioritário'
    ],
    monthlyPriceId: process.env.STRIPE_MONTLY_PRICE_ID as string,
    yearlyPriceId: process.env.STRIPE_ANNUAL_PRICE_ID as string,
    monthlyPrice: 39.90,
    yearlyPrice: 399.90
};

export function SubscriptionPlans() {
    const [billingInterval, setBillingInterval] = useState<string>('monthly');


    const {
        isLoading,
        createCheckout,
        isCreatingCheckout,
        createPortal,
        isCreatingPortal,
        isActive
    } = useSubscription({
        billingInterval
    });
    // Calculate yearly savings
    const yearlySavings = Math.round((PLAN.monthlyPrice * 12 - PLAN.yearlyPrice) / (PLAN.monthlyPrice * 12) * 100);

    return (
        <div className="space-y-8 py-4">
            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setBillingInterval('monthly')}
                        className={`px-4 py-2 rounded-md text-sm transition-all ${
                            billingInterval === 'monthly'
                                ? 'bg-white shadow-sm text-slate-900 font-medium'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Mensal
                    </button>
                    <button
                        onClick={() => setBillingInterval('yearly')}
                        className={`px-4 py-2 rounded-md text-sm transition-all ${
                            billingInterval === 'yearly'
                                ? 'bg-white shadow-sm text-slate-900 font-medium'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Anual
                        <span className="ml-1.5 text-[#f97066] text-xs font-medium">
                            -{yearlySavings}%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plan Card */}
            <div className="max-w-sm mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-lg overflow-hidden border border-gray-200 bg-white"
                >
                    {/* Card Header */}
                    <div className="bg-slate-900 px-6 py-5">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Acesso Total</p>
                        <h3 className="text-white text-lg font-bold">{PLAN.name}</h3>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-1">
                                {billingInterval === 'monthly' ? 'Cobrança mensal' : 'Cobrança anual'}
                            </p>
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold text-slate-900">
                                    R${billingInterval === 'monthly' ? PLAN.monthlyPrice : PLAN.yearlyPrice}
                                </span>
                                <span className="text-gray-500 ml-1 text-sm">
                                    /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                                </span>
                            </div>
                            {billingInterval === 'yearly' && (
                                <p className="mt-1 text-xs text-[#f97066]">
                                    Economia de R${(PLAN.monthlyPrice * 12 - PLAN.yearlyPrice).toFixed(2)} por ano
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                            {PLAN.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <Check size={14} className="text-[#f97066] mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-600">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {isActive ? (
                            <Button
                                className="w-full py-3 rounded-md bg-gray-100 hover:bg-gray-200 text-slate-900 text-sm font-medium transition-colors flex items-center justify-center"
                                disabled={isCreatingPortal}
                                onClick={() => createPortal()}
                            >
                                <CreditCard size={16} className="mr-2" />
                                {isCreatingPortal ? 'Carregando...' : 'Gerenciar Assinatura'}
                            </Button>
                        ) : (
                            <Button
                                className="w-full py-3 rounded-md bg-[#f97066] hover:bg-[#e5645b] text-white text-sm font-medium transition-colors flex items-center justify-center"
                                disabled={isCreatingCheckout}
                                onClick={() => createCheckout({
                                    priceId: billingInterval === 'monthly'
                                        ? PLAN.monthlyPriceId
                                        : PLAN.yearlyPriceId,
                                    tier: TierType.PRO
                                })}
                            >
                                {isCreatingCheckout ? 'Processando...' : 'Assinar Agora'}
                            </Button>
                        )}

                        <p className="mt-3 text-xs text-center text-gray-400">
                            Cancele a qualquer momento.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}