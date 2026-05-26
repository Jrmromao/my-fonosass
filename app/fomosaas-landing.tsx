'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Printer,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react';
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

export default function FomosaasLanding({
  featuredBlogPosts,
}: FomosaasLandingProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showWaitingList, setShowWaitingList] = useState(true);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {showWaitingList && (
        <WaitingListAlert onClose={() => setShowWaitingList(false)} />
      )}
      <SharedNavbar scrolled={scrolled} showWaitingList={showWaitingList} />

      {/* Hero */}
      <section
        className={`${showWaitingList ? 'pt-48 pb-20 md:pt-56 md:pb-28' : 'pt-32 pb-20 md:pt-40 md:pb-28'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm font-medium text-indigo-600 mb-4 tracking-wide uppercase">
                Para fonoaudiólogos
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5 font-display">
                Atividades terapêuticas prontas para a sua sessão
              </h1>
              <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                Biblioteca de materiais imprimíveis que cresce toda semana.
                Criados por fonoaudióloga, prontos para usar. Escolha o fonema,
                imprima e aplique.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/sign-up"
                  className="px-7 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  Começar grátis <ArrowRight size={16} />
                </Link>
                <Link
                  href="#como-funciona"
                  className="px-7 py-3 rounded-lg text-gray-600 font-medium hover:text-gray-900 transition-colors w-full sm:w-auto text-center"
                >
                  Como funciona?
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Interactive Demo */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto px-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <BalloonOptimizedMinimal />
          </div>
          <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <EducationalToolbar />
          </div>
          <p className="text-center text-sm text-gray-400 mt-3">
            Clique duas vezes num balão para ver as atividades disponíveis
          </p>
        </motion.div>
      </section>

      {/* Numbers */}
      <section className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">170+</p>
              <p className="text-sm text-gray-500 mt-1">
                Atividades disponíveis
              </p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-3xl font-bold text-gray-900">16</p>
              <p className="text-sm text-gray-500 mt-1">Fonemas cobertos</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-3xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-500 mt-1">Tipos de exercício</p>
            </div>
            <div className="w-px h-10 bg-gray-200 hidden md:block" />
            <div>
              <p className="text-3xl font-bold text-gray-900">2x</p>
              <p className="text-sm text-gray-500 mt-1">
                Novos materiais por semana
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">
              Como funciona
            </h2>
            <p className="text-gray-500 mt-3">
              Materiais prontos em menos de 1 minuto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">
              Por que o Almanaque da Fala
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {differentiators.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-5 border border-gray-100 hover:border-indigo-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-display">
                  Criado por quem entende de fala
                </h2>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Todos os materiais são desenvolvidos por fonoaudióloga com
                  experiência clínica em atendimento infantil. A biblioteca
                  cresce semanalmente com novos exercícios revisados antes da
                  publicação.
                </p>
                <div className="space-y-3">
                  {trustPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  "Cada exercício é desenvolvido com base em práticas clínicas
                  reais. Eu reviso tudo antes de publicar para garantir que o
                  material é adequado para cada faixa etária."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                    EL
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Eliane Lourenço
                    </p>
                    <p className="text-xs text-gray-400">
                      Fonoaudióloga — Revisora de conteúdo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="assinatura" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">
              Planos
            </h2>
            <p className="text-gray-500 mt-3">
              Acesso completo a toda a biblioteca. Novos materiais toda a
              semana.
            </p>
          </div>
          <SubscriptionPlans />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display">
              Perguntas frequentes
            </h2>
          </div>
          <div className="max-w-2xl mx-auto divide-y divide-gray-200">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-display">
              Otimize o tempo de preparação das suas sessões
            </h2>
            <p className="text-gray-500 mb-8">
              Acesse a biblioteca, escolha o fonema e imprima. Simples.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center px-7 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors gap-2"
            >
              Criar conta gratuita <ArrowRight size={16} />
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
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-sm font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

const steps = [
  {
    title: 'Escolha o fonema',
    description:
      'Navegue pela biblioteca ou use os balões interativos para encontrar o fonema do seu paciente.',
  },
  {
    title: 'Baixe o material',
    description:
      'Cada atividade vem em formato pronto para impressão. Download instantâneo.',
  },
  {
    title: 'Aplique na sessão',
    description:
      'Use o material impresso com o seu paciente. Atividades lúdicas que trabalham o fonema de forma natural.',
  },
];

const differentiators = [
  {
    title: 'Biblioteca que cresce',
    description:
      'Novos materiais adicionados toda semana. Acervo em constante expansão.',
    icon: <RefreshCw className="w-4 h-4 text-indigo-600" />,
  },
  {
    title: 'Pronto para imprimir',
    description:
      "PDFs formatados com marca d'água. Imprima e use direto na sessão.",
    icon: <Printer className="w-4 h-4 text-indigo-600" />,
  },
  {
    title: 'Validado por profissional',
    description: 'Cada material é criado e revisado por fonoaudióloga clínica.',
    icon: <Shield className="w-4 h-4 text-indigo-600" />,
  },
  {
    title: 'Organizado por fonema',
    description: 'Encontre rapidamente o material certo para cada paciente.',
    icon: <Search className="w-4 h-4 text-indigo-600" />,
  },
];

const trustPoints = [
  'Novos materiais criados e revisados por profissional toda a semana.',
  'Exercícios seguem diretrizes do Conselho Federal de Fonoaudiologia.',
  'Organizados por fonema, faixa etária e nível de dificuldade.',
  '16 fonemas cobertos com 4 tipos de atividade cada.',
];

const faqs = [
  {
    question: 'O que é o Almanaque da Fala?',
    answer:
      'Uma plataforma de materiais terapêuticos para fonoaudiólogos. Atividades imprimíveis organizadas por fonema, criadas por profissional.',
  },
  {
    question: 'Quem cria os materiais?',
    answer:
      'Todos os exercícios são desenvolvidos e revisados por fonoaudióloga com experiência clínica em atendimento infantil.',
  },
  {
    question: 'Para qual faixa etária?',
    answer:
      'Atividades para crianças de 4 a 12 anos, organizadas por nível de dificuldade e faixa etária.',
  },
  {
    question: 'Posso cancelar?',
    answer:
      'Sim, a qualquer momento. Sem multas. Acesso ativo até o fim do período pago.',
  },
  {
    question: 'Com que frequência novos materiais são adicionados?',
    answer:
      'Toda semana. A biblioteca cresce continuamente com novos exercícios para diferentes fonemas.',
  },
];
