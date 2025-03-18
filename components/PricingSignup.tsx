'use client'

import React, {useState} from 'react'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Award, Check, Clock, Info, Shield, Star, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import PlanSelectionButton from "@/components/PlanSelectionButton";
import {SignUpDialog} from "@/components/dialogs/sign-up-dialog";
import {Feature} from "@/types/types";


const plans: Plan[] = [
    {
        id: "basic",
        name: "Básico",
        description: "Ideal para profissionais autônomos iniciando na área",
        price: "R$ 97",
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
    {  id: "professional",
        name: "Profissional",
        description: "Perfeito para clínicas em crescimento",
        price: "R$ 197",
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
        cta: "Assinar Agora - joao@me.com.br",
        trial: "30 dias grátis"
    },
    {
        id: "enterprise",
        name: "Clínica",
        description: "Solução completa para clínicas estabelecidas",
        price: "R$ 497",
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

    const trustBadges = [
        { icon: Shield, text: "Dados seguros LGPD" },
        { icon: Award, text: "Certificado CFM" },
        { icon: Clock, text: "Suporte 24/7" }
    ]

    const faqs = [
        {
            question: "Posso mudar de plano depois?",
            answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento."
        },
        {
            question: "Como funciona o período de teste?",
            answer: "Você tem acesso completo a todas as funcionalidades durante o período de teste, sem compromisso."
        },
        {
            question: "Preciso fornecer cartão de crédito?",
            answer: "Não é necessário cartão de crédito para começar seu período de teste gratuito."
        }
    ]

    const testimonials = [
        {
            name: "Dra. Maria Silva",
            role: "Clínica Bem Estar",
            text: "Revolucionou o atendimento na minha clínica",
            // : "/api/placeholder/48/48"
        }
    ]

function handlePlanSelect(planId: String) {
    console.log(planId)
}

const PricingSignup = () => {
    const [billingPeriod, setBillingPeriod] = useState('monthly')

    return (
        <section id="preços" className="py-20 md:py-32 bg-gradient-to-b from-white to-purple-50">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    Planos Flexíveis
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Escolha o plano ideal para o seu momento profissional. Todos incluem atualizações
                    gratuitas e suporte técnico.
                </p>
            </div>

            <div className="container mx-auto px-4">

                {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">*/}
                {/*    {trustBadges.map((badge, index) => (*/}
                {/*        <div key={index} className="flex flex-col items-center text-center p-4">*/}
                {/*            <div className="rounded-full bg-indigo-50 p-2 mb-3">*/}
                {/*                <badge.icon className="size-5 text-indigo-600"/>*/}
                {/*            </div>*/}
                {/*            <span className="text-sm font-medium text-gray-800">{badge.text}</span>*/}
                {/*            <span className="text-sm text-gray-500 mt-1">test</span>*/}
                {/*        </div>*/}
                {/*    ))}*/}
                {/*</div>*/}

            </div>
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
                                <div
                                    className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                                    POPULAR
                                </div>
                            )}
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-600">
                                    {plan.description}
                                </CardDescription>
                                <div className="pt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-gray-500 ml-1">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature: Feature, fIndex: number) => (
                                        <li key={fIndex} className="flex items-start gap-3">
                                            <Check className="size-5 text-indigo-600 mt-0.5 flex-shrink-0"/>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-700">{feature.text}</span>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="size-4 text-gray-400 hover:text-indigo-600"/>
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
                                        {plan.additionalFeatures.map((feature: Feature, index: number) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="size-1.5 rounded-full bg-indigo-600"/>
                                                {/*{feature}*/}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-6">
                                    {/*<Button*/}
                                    {/*    onClick={() => handlePlanSelect(plan.id)}*/}
                                    {/*    className={`w-full ${*/}
                                    {/*        plan.highlight*/}
                                    {/*            ? 'bg-indigo-600 text-white hover:bg-indigo-700'*/}
                                    {/*            : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'*/}
                                    {/*    } transition-all duration-300 text-sm font-medium`}*/}
                                    {/*>*/}
                                    {/*    {plan.cta}*/}
                                    {/*</Button>*/}

                                    {/*<PlanSelectionButton plan={plan} handlePlanSelect={async () => {handlePlanSelect(plan.id)}} />*/}

                                    <SignUpDialog plan={plan} />

                                    <p className="text-xs text-center text-gray-500 mt-3">
                                        {plan.trial}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TooltipProvider>
            </div>
            <

                div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-8">
                <Lock className="size-4"/>
                <span>Pagamento seguro via PIX ou cartão</span>
            </div>

            {/* Testimonials */}
            <div className="mt-16 max-w-3xl mx-auto">
                <div className="grid gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                {/*<img*/}
                                {/*    src={testimonial.image}*/}
                                {/*    alt={testimonial.name}*/}
                                {/*    className="rounded-full"*/}
                                {/*/>*/}
                                <div>
                                    <h4 className="font-semibold">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic">{testimonial.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div className="mt-16 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h3>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent>
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <div className="mt-16 text-center">
                <div className="mb-8">
                    <div className="flex justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="size-5 text-yellow-400 fill-yellow-400"/>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        Mais de 2.000 profissionais confiam em nossa plataforma
                    </p>
                </div>


                <div className="max-w-2xl mx-auto p-6 bg-indigo-50 rounded-2xl">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Precisa de um plano personalizado para sua clínica?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Nossa equipe está pronta para criar uma solução sob medida para suas necessidades
                    </p>
                    <Button
                        variant="outline"
                        className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-100"
                    >
                        Entre em Contato
                    </Button>
                </div>
            </div>

            {/* Social Proof Footer */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 px-4 py-8 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">2000+</div>
                    <div className="text-sm text-gray-600">Profissionais Ativos</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">50k+</div>
                    <div className="text-sm text-gray-600">Pacientes Atendidos</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">4.9/5</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                </div>
            </div>
        </section>

    )
}

export default PricingSignup
