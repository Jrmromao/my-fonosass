'use client';

import BalloonOptimizedMinimal from '@/components/Balloon/BalloonOptimizedMinimal';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LandingPageV2() {
  return (
    <div className="min-h-screen bg-white">
      <SharedNavbar />

      {/* Hero — balloon-first */}
      <section className="pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display leading-tight">
              Materiais terapêuticos prontos para sua sessão
            </h1>
            <p className="mt-4 text-base text-gray-500">
              Escolha o fonema, baixe a atividade ilustrada e imprima. Novos
              exercícios toda semana, validados por fonoaudióloga.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
              >
                Começar grátis <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Como funciona?
              </a>
            </div>
          </div>

          {/* Balloons as hero visual */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <BalloonOptimizedMinimal />
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Clique duas vezes num balão para explorar as atividades do fonema
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6 mt-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-gray-400">
          <span>✓ Criado por fonoaudióloga</span>
          <span>✓ Baseado em evidências</span>
          <span>✓ Conformidade LGPD</span>
          <span>✓ Novos materiais toda semana</span>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-8">
            Como funciona
          </h2>
          <div className="space-y-6">
            {[
              [
                'Escolha o fonema',
                'Cada balão representa um fonema. Clique para ver as atividades disponíveis.',
              ],
              [
                'Baixe a atividade',
                'Caça-palavras, trilhas, jogos de colorir — tudo ilustrado e pronto para imprimir.',
              ],
              [
                'Use na sessão',
                'PDF em A4. Use no consultório ou envie para os pais praticarem em casa.',
              ],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-8">
            O que está incluído
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Atividades para todos os 22 fonemas',
              'Novos exercícios toda semana',
              'PDFs ilustrados para imprimir',
              'Exercícios por faixa etária (3-14 anos)',
              'Materiais validados por fonoaudióloga',
              'Temas variados: animais, comida, transporte e mais',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — simple */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-sm mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 font-display mb-2">
              Um plano. Tudo incluído.
            </h2>
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">R$39</span>
              <span className="text-gray-500">,90/mês</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Cancele quando quiser. Sem taxa de cancelamento.
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
            >
              Assinar agora
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 font-display mb-6">
            Dúvidas
          </h2>
          <FAQList />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg font-semibold text-gray-900 font-display">
            Pare de perder horas preparando material.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Crie sua conta e comece a gerar atividades agora.
          </p>
          <Link
            href="/sign-up"
            className="mt-5 inline-flex items-center px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
          >
            Criar conta grátis <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

const faqs = [
  {
    q: 'O que é o Almanaque da Fala?',
    a: 'Uma plataforma com atividades terapêuticas ilustradas para fonoaudiólogos. Cada exercício é validado por fonoaudióloga antes de ser publicado.',
  },
  {
    q: 'Preciso saber usar tecnologia?',
    a: 'Não. Escolha o fonema e a idade do paciente, baixe o PDF e imprima. Leva menos de um minuto.',
  },
  {
    q: 'As atividades são baseadas em evidências?',
    a: 'Sim. Seguem diretrizes do CFFa e são revisadas por Eliane Mota, fonoaudióloga clínica.',
  },
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Sem multa, sem burocracia.',
  },
  {
    q: 'Com que frequência saem materiais novos?',
    a: 'Toda semana adicionamos novos exercícios para diferentes fonemas, idades e temas.',
  },
];

function FAQList() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200">
      {faqs.map((faq, i) => (
        <div key={i} className="py-3">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-gray-900">{faq.q}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && <p className="mt-2 text-sm text-gray-500">{faq.a}</p>}
        </div>
      ))}
    </div>
  );
}
