'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Download, Printer, RefreshCw, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import BalloonOptimizedMinimal from '@/components/Balloon/BalloonOptimizedMinimal';
import EducationalToolbar from '@/components/Toolbar/EducationalToolbar';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import WaitingListAlert from '@/components/WaitingListAlert';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { BlogPost } from '@/lib/blog';
import { useAuth } from '@clerk/nextjs';

interface FomosaasLandingProps {
  featuredBlogPosts: BlogPost[];
}

export default function FomosaasLanding({ featuredBlogPosts }: FomosaasLandingProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {showWaitingList && <WaitingListAlert onClose={() => setShowWaitingList(false)} />}
      <SharedNavbar scrolled={scrolled} showWaitingList={showWaitingList} />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm font-medium text-[#f97066] mb-3 tracking-wide">
                Para fonoaudiólogos
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-[1.15] mb-5 font-display">
                Materiais terapêuticos prontos para a sua sessão
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-xl leading-relaxed">
                Biblioteca de atividades imprimíveis organizada por fonema. Novos materiais toda semana, criados e revisados por fonoaudióloga.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-up"
                  className="px-6 py-2.5 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  Começar grátis <ArrowRight size={15} />
                </Link>
                <Link
                  href="#como-funciona"
                  className="px-6 py-2.5 rounded-md border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Como funciona
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Balloon Demo */}
        <div className="max-w-6xl mx-auto px-6 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <BalloonOptimizedMinimal />
            </div>
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-100">
              <EducationalToolbar />
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Clique duas vezes num balão para explorar as atividades do fonema
            </p>
          </motion.div>
        </div>
      </section>

      {/* Numbers */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 font-display">
            Como funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i}>
                <div className="w-8 h-8 rounded-md bg-slate-900 text-white text-sm font-bold flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 font-display">
            Por que o Almanaque da Fala
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, i) => (
              <div key={i} className="p-5 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150">
                <div className="w-9 h-9 rounded-md bg-red-50 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">
                Criado por quem entende de fala
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Todos os materiais são desenvolvidos por fonoaudióloga com experiência clínica em atendimento infantil. A biblioteca cresce semanalmente com novos exercícios revisados antes da publicação.
              </p>
              <div className="space-y-3">
                {trustPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#f97066] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-lg border border-gray-100 bg-white">
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                "Cada exercício é desenvolvido com base em práticas clínicas reais. Eu reviso tudo antes de publicar para garantir que o material é adequado para cada faixa etária."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                  EL
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Eliane Lourenço</p>
                  <p className="text-xs text-gray-400">Fonoaudióloga — Revisora de conteúdo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="assinatura" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-3 font-display">
            Planos
          </h2>
          <p className="text-gray-500 mb-12">
            Acesso completo à biblioteca. Novos materiais toda semana.
          </p>
          <SubscriptionPlans />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 font-display">
            Perguntas frequentes
          </h2>
          <div className="max-w-2xl divide-y divide-gray-200">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 font-display">
              Otimize o tempo de preparação das suas sessões
            </h2>
            <p className="text-gray-500 mb-6">
              Acesse a biblioteca, escolha o fonema e imprima.
            </p>
            <Link
              href="/sign-up"
              className="px-6 py-2.5 rounded-md bg-[#f97066] text-white text-sm font-medium hover:bg-[#e5645b] transition-colors inline-flex items-center gap-2"
            >
              Criar conta gratuita <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-4">
      <button onClick={() => setOpen(!open)} className="flex justify-between items-center w-full text-left">
        <span className="text-sm font-medium text-slate-900">{question}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-3 text-sm text-gray-500 leading-relaxed">{answer}</p>}
    </div>
  );
}

const stats = [
  { value: '170+', label: 'Atividades disponíveis' },
  { value: '16', label: 'Fonemas cobertos' },
  { value: '4', label: 'Tipos de exercício' },
  { value: 'Semanal', label: 'Novos materiais' },
];

const steps = [
  { title: 'Escolha o fonema', description: 'Navegue pela biblioteca ou use os balões interativos para encontrar o fonema do seu paciente.' },
  { title: 'Baixe o material', description: 'Cada atividade vem em formato pronto para impressão. Download instantâneo.' },
  { title: 'Aplique na sessão', description: 'Use o material impresso com o seu paciente. Atividades lúdicas que trabalham o fonema de forma natural.' },
];

const differentiators = [
  { title: 'Biblioteca que cresce', description: 'Novos materiais adicionados toda semana. Acervo em constante expansão.', icon: <RefreshCw className="w-4 h-4 text-[#f97066]" /> },
  { title: 'Pronto para imprimir', description: "PDFs formatados com marca d'água. Imprima e use direto na sessão.", icon: <Printer className="w-4 h-4 text-[#f97066]" /> },
  { title: 'Validado por profissional', description: 'Cada material é criado e revisado por fonoaudióloga clínica.', icon: <Shield className="w-4 h-4 text-[#f97066]" /> },
  { title: 'Download instantâneo', description: 'Sem espera. Escolha, baixe e imprima em segundos.', icon: <Download className="w-4 h-4 text-[#f97066]" /> },
];

const trustPoints = [
  'Exercícios criados e revisados por profissional toda semana.',
  'Seguem diretrizes do Conselho Federal de Fonoaudiologia.',
  'Organizados por fonema, faixa etária e nível de dificuldade.',
  '16 fonemas cobertos com 4 tipos de atividade cada.',
];

const faqs = [
  { question: 'O que é o Almanaque da Fala?', answer: 'Uma plataforma de materiais terapêuticos para fonoaudiólogos. Atividades imprimíveis organizadas por fonema, criadas por profissional.' },
  { question: 'Quem cria os materiais?', answer: 'Todos os exercícios são desenvolvidos e revisados por fonoaudióloga com experiência clínica em atendimento infantil.' },
  { question: 'Para qual faixa etária?', answer: 'Atividades para crianças de 4 a 12 anos, organizadas por nível de dificuldade e faixa etária.' },
  { question: 'Posso cancelar?', answer: 'Sim, a qualquer momento. Sem multas. Acesso ativo até o fim do período pago.' },
  { question: 'Com que frequência novos materiais são adicionados?', answer: 'Toda semana. A biblioteca cresce continuamente com novos exercícios para diferentes fonemas.' },
];
