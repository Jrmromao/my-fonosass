'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const CATEGORIES = ['Geral', 'Planos', 'Conteúdo'] as const;

const FAQ_DATA: Record<string, { question: string; answer: string }[]> = {
  Geral: [
    { question: 'O que é o Almanaque da Fala?', answer: 'Uma plataforma de materiais terapêuticos para fonoaudiólogos. Atividades imprimíveis organizadas por fonema, criadas e revisadas por profissional.' },
    { question: 'Para quem é a plataforma?', answer: 'Para fonoaudiólogos que atendem crianças de 4 a 12 anos e precisam de materiais prontos para usar em sessões.' },
    { question: 'Substitui a terapia presencial?', answer: 'Não. O Almanaque da Fala é uma ferramenta complementar. Os materiais são usados pelo profissional durante as sessões.' },
  ],
  Planos: [
    { question: 'Quanto custa?', answer: 'O plano gratuito inclui 3 downloads por mês. O plano Profissional oferece downloads ilimitados por R$39,90/mês ou R$399/ano.' },
    { question: 'Posso cancelar a qualquer momento?', answer: 'Sim. Sem multas ou taxas. O acesso permanece ativo até o fim do período pago.' },
    { question: 'Existe período de teste?', answer: 'O plano gratuito permite explorar a biblioteca e fazer até 3 downloads por mês, sem limite de tempo.' },
    { question: 'Como funciona o pagamento?', answer: 'Aceitamos cartão de crédito via Stripe. A cobrança é recorrente (mensal ou anual) e pode ser cancelada a qualquer momento.' },
  ],
  Conteúdo: [
    { question: 'Quem cria os materiais?', answer: 'Todos os exercícios são desenvolvidos e revisados por fonoaudióloga com experiência clínica em atendimento infantil.' },
    { question: 'Com que frequência novos materiais são adicionados?', answer: 'Toda semana. A biblioteca cresce continuamente com novos exercícios para diferentes fonemas.' },
    { question: 'Para qual faixa etária?', answer: 'Atividades para crianças de 4 a 12 anos, organizadas por nível de dificuldade e faixa etária.' },
    { question: 'Quantos fonemas estão disponíveis?', answer: 'Atualmente 16 fonemas cobertos, cada um com 4 tipos de atividade (encontre e circule, caça-palavras, jogo de tabuleiro, colorir e falar).' },
    { question: 'Posso imprimir os materiais?', answer: 'Sim. Todos os materiais vêm em formato pronto para impressão com a marca Almanaque da Fala.' },
  ],
};

export default function FAQClient() {
  const [activeCategory, setActiveCategory] = useState<string>('Geral');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = FAQ_DATA[activeCategory] || [];

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-[#f97066] font-medium uppercase tracking-wide mb-2">Suporte</p>
          <h1 className="text-3xl font-bold text-slate-900 font-display">
            Perguntas frequentes
          </h1>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="divide-y divide-gray-100">
          {questions.map((faq, i) => (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex justify-between items-center w-full text-left"
              >
                <span className="text-sm font-medium text-slate-900 pr-4">{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 rounded-lg bg-slate-900 text-center">
          <h2 className="text-lg font-bold text-white mb-2">Ainda tem dúvidas?</h2>
          <p className="text-sm text-gray-400 mb-5">Entre em contacto connosco.</p>
          <Link
            href="/contato"
            className="inline-flex px-5 py-2.5 rounded-md bg-[#f97066] text-white text-sm font-medium hover:bg-[#e5645b] transition-colors"
          >
            Fale connosco
          </Link>
        </div>
      </div>
    </div>
  );
}
