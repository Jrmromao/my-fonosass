import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Crown, Sparkles, Calendar, CreditCard } from 'lucide-react';
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
    const {
        isLoading,
        createCheckout,
        isCreatingCheckout,
        createPortal,
        isCreatingPortal,
        isActive
    } = useSubscription();
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

    // Calculate yearly savings
    const yearlySavings = Math.round((PLAN.monthlyPrice * 12 - PLAN.yearlyPrice) / (PLAN.monthlyPrice * 12) * 100);

    return (
        <div className="space-y-10 py-8 px-4">
            {/* Title Section */}
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-white mb-2">Escolha seu plano</h2>
                <p className="text-blue-700 dark:text-blue-300 max-w-md mx-auto">
                    Acesso completo a todos os recursos para aprimorar sua prática profissional
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center">
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
                        Mensal
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
                        Anual
                        <span className="ml-1.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            -{yearlySavings}%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plan Card */}
            <div className="max-w-md mx-auto">
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
                                    Acesso Total
                                </span>
                                <h3 className="text-white text-xl font-bold">{PLAN.name}</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </div>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                        <div className="mb-6 text-center">
                            <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">
                                {billingInterval === 'monthly' ? 'Cobrança mensal' : 'Cobrança anual'}
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="text-5xl font-bold text-blue-900 dark:text-white">
                                    R${billingInterval === 'monthly' ? PLAN.monthlyPrice : PLAN.yearlyPrice}
                                </span>
                                <span className="text-blue-600 dark:text-blue-300 ml-1">
                                    /{billingInterval === 'monthly' ? 'mês' : 'ano'}
                                </span>
                            </div>
                            {billingInterval === 'yearly' && (
                                <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                                    Economia de R${(PLAN.monthlyPrice * 12 - PLAN.yearlyPrice).toFixed(2)} por ano
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 uppercase tracking-wider mb-2">
                                Inclui:
                            </div>
                            {PLAN.features.map((feature, i) => (
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
                            <Button
                                className="w-full py-6 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-indigo-800/50 dark:hover:bg-indigo-800 text-blue-700 dark:text-blue-100 font-medium transition-all flex items-center justify-center"
                                disabled={isCreatingPortal}
                                onClick={() => createPortal()}
                            >
                                <CreditCard size={18} className="mr-2" />
                                {isCreatingPortal ? 'Carregando...' : 'Gerenciar Assinatura'}
                            </Button>
                        ) : (
                            <Button
                                className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20 transition-all flex items-center justify-center"
                                disabled={isCreatingCheckout}
                                onClick={() => createCheckout({
                                    priceId: billingInterval === 'monthly'
                                        ? PLAN.monthlyPriceId
                                        : PLAN.yearlyPriceId,
                                    tier: TierType.PRO
                                })}
                            >
                                <Sparkles size={18} className="mr-2" />
                                {isCreatingCheckout ? 'Processando...' : 'Assinar Agora'}
                            </Button>
                        )}

                        <div className="mt-4 text-xs text-center text-blue-500 dark:text-blue-400">
                            Cancele a qualquer momento. Sem taxas ocultas.
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}