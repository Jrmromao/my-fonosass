'use client'
import React, {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Check, Info} from "lucide-react";
import {Button} from "@/components/ui/button";

const plans = [
    {
        name: "Básico",
        description: "Ideal para profissionais autônomos iniciando na área",
        price: {
            monthly: "R$ 97",
            annual: "R$ 970"  // 2 months free: 97 * 10
        },
        period: "mensal",
        highlight: false,
        features: [
            {
                text: "Até 50 pacientes",
                tooltip: "Gerenciamento simplificado para sua base inicial de pacientes"
            },
            {
                text: "Agendamento básico",
                tooltip: "Sistema de agendamento com confirmação automática por email"
            },
            {
                text: "Prontuário digital",
                tooltip: "Registro completo do histórico médico dos pacientes"
            },
            {
                text: "Suporte por email",
                tooltip: "Atendimento em horário comercial com resposta em até 24h"
            },
        ],
        additionalFeatures: [
            "Backups diários",
            "Acesso via app móvel",
            "Pagamentos online básico"
        ],
        cta: "Começar Gratuitamente",
        trial: "14 dias grátis"
    },
    {
        name: "Profissional",
        description: "Perfeito para clínicas em crescimento",
        price: {
            monthly: "R$ 197",
            annual: "R$ 1.970"  // 2 months free: 197 * 10
        },
        period: "mensal",
        highlight: true,
        features: [
            {
                text: "Pacientes ilimitados",
                tooltip: "Sem limites para crescer sua clínica"
            },
            {
                text: "Agendamento avançado",
                tooltip: "Inclui lembretes por WhatsApp e confirmação automática"
            },
            {
                text: "Prontuário digital completo",
                tooltip: "Com anexos, exames e histórico completo"
            },
            {
                text: "Relatórios e análises",
                tooltip: "Dashboard completo com métricas de desempenho"
            },
            {
                text: "Suporte prioritário",
                tooltip: "Atendimento preferencial com resposta em até 4h"
            }
        ],
        additionalFeatures: [
            "Integração com WhatsApp",
            "Teleconsulta integrada",
            "Múltiplos usuários",
            "Faturamento TISS"
        ],
        cta: "Assinar Agora",
        trial: "30 dias grátis"
    },
    {
        name: "Clínica",
        description: "Solução completa para clínicas estabelecidas",
        price: {
            monthly: "R$ 497",
            annual: "R$ 4.970"  // 2 months free: 497 * 10
        },
        period: "mensal",
        highlight: false,
        features: [
            {
                text: "Múltiplos profissionais",
                tooltip: "Ideal para equipes médicas e multidisciplinares"
            },
            {
                text: "Gestão completa",
                tooltip: "Sistema completo de gestão financeira e administrativa"
            },
            {
                text: "Telemedicina integrada",
                tooltip: "Plataforma própria para consultas online"
            },
            {
                text: "Personalização avançada",
                tooltip: "Customização completa de formulários e documentos"
            },
            {
                text: "Suporte VIP",
                tooltip: "Atendimento 24/7 com gerente de conta dedicado"
            }
        ],
        additionalFeatures: [
            "Business Intelligence",
            "API disponível",
            "Ambiente LGPD compliant",
            "Backup em tempo real",
            "Suporte à certificação digital"
        ],
        cta: "Falar com Consultor",
        trial: "Demo personalizada"
    }
]

const PricingSection = () => {
    const [billingPeriod, setBillingPeriod] = useState('monthly')

    return (
        <>
            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            billingPeriod === 'monthly'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-indigo-600'
                        }`}
                    >
                        Mensal
                    </button>
                    <button
                        onClick={() => setBillingPeriod('annual')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            billingPeriod === 'annual'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:text-indigo-600'
                        }`}
                    >
                        Anual (2 meses grátis)
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <TooltipProvider>
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg ${
                                plan.highlight ? 'border-indigo-600 shadow-xl md:scale-105' : ''
                            }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                                    POPULAR
                                </div>
                            )}
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-600">
                                    {plan.description}
                                </CardDescription>
                                <div className="pt-4">
                                    <span className="text-4xl font-bold">
                                        {billingPeriod === 'monthly' ? plan.price.monthly : plan.price.annual}
                                    </span>
                                    <span className="text-gray-500 ml-1">
                                        /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                                    </span>
                                    {billingPeriod === 'annual' && (
                                        <div className="text-sm text-green-600 mt-1">
                                            Economia de 2 meses
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            <Check className="size-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-700">{feature.text}</span>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="size-4 text-gray-400 hover:text-indigo-600" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        {feature.tooltip}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Também inclui:
                                    </p>
                                    <ul className="space-y-2">
                                        {plan.additionalFeatures.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="size-1.5 rounded-full bg-indigo-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        className={`w-full ${
                                            plan.highlight
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                                        } transition-all duration-300 text-sm font-medium`}
                                    >
                                        {plan.cta}
                                    </Button>
                                    <p className="text-xs text-center text-gray-500 mt-3">
                                        {plan.trial}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TooltipProvider>
            </div>
        </>
    )
}