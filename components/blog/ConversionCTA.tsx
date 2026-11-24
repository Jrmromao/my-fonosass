'use client';

import { formatBRL, PRO_PLAN } from '@/lib/pricing';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ConversionCTAProps {
  variant?: 'default' | 'article' | 'mid' | 'topic';
  topic?: string;
  className?: string;
}

const COPY: Record<
  'default' | 'article' | 'mid' | 'topic',
  { title: string; body: string; primary: string }
> = {
  mid: {
    title: 'Quer aplicar isto na próxima sessão?',
    body: 'Na biblioteca há materiais de apoio à terapia, imprimíveis e organizados por fonema. Criados e revisados por fonoaudióloga.',
    primary: 'Ver atividades',
  },
  article: {
    title: 'Leve estas ideias para a sessão',
    body: 'Materiais de apoio à terapia, imprimíveis e organizados por fonema. Criados e revisados por fonoaudióloga.',
    primary: 'Ver a biblioteca',
  },
  default: {
    title: 'Biblioteca de atividades por fonema',
    body: 'Materiais de apoio à terapia, imprimíveis e organizados por fonema. Criados e revisados por fonoaudióloga.',
    primary: 'Ver a biblioteca',
  },
  topic: {
    title: 'Biblioteca de atividades por fonema',
    body: 'Materiais de apoio à terapia, imprimíveis e organizados por fonema. Criados e revisados por fonoaudióloga.',
    primary: 'Ver a biblioteca',
  },
};

export default function ConversionCTA({
  variant = 'default',
  className = '',
}: ConversionCTAProps) {
  const copy = COPY[variant] ?? COPY.default;
  return (
    <aside
      className={`rounded-2xl border-2 border-neutral-900 bg-violet-50 p-6 sm:p-7 ${className}`}
    >
      <h3 className="font-display text-lg font-bold text-violet-950">
        {copy.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        {copy.body} A partir de {formatBRL(PRO_PLAN.monthlyPrice)}/mês.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/#biblioteca"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
        >
          {copy.primary}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/#planos"
          className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
        >
          Ver planos
        </Link>
      </div>
    </aside>
  );
}
