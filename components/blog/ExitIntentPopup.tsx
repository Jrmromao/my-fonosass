'use client';

import { formatBRL, PRO_PLAN } from '@/lib/pricing';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ExitIntentPopupProps {
  currentArticle?: {
    title: string;
    slug: string;
    tags?: string[];
  };
}

/** Optional exit-intent modal. Kept for call sites; not mounted on the new blog shell by default. */
export default function ExitIntentPopup({
  currentArticle,
}: ExitIntentPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const popupShown = sessionStorage.getItem('exitIntentShown');
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!showPopup) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center">
        <button
          type="button"
          onClick={() => setShowPopup(false)}
          className="absolute right-4 top-4 rounded-md p-2 text-neutral-600 hover:bg-violet-50 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <h3
          id="exit-intent-title"
          className="font-display text-2xl font-bold text-violet-950"
        >
          Antes de sair
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          {currentArticle
            ? `Veja a biblioteca de atividades do Almanaque da Fala — a partir de ${formatBRL(PRO_PLAN.monthlyPrice)}/mês.`
            : `Atividades imprimíveis por fonema, a partir de ${formatBRL(PRO_PLAN.monthlyPrice)}/mês.`}
        </p>

        <div className="mt-6 space-y-3">
          <Link
            href="/#biblioteca"
            className="flex w-full items-center justify-center rounded-md bg-coral-700 px-6 py-3 text-sm font-semibold text-white hover:bg-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
            onClick={() => setShowPopup(false)}
          >
            Ver a biblioteca
          </Link>
          <Link
            href="/blog"
            className="flex w-full items-center justify-center rounded-md border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
            onClick={() => setShowPopup(false)}
          >
            Continuar no blog
          </Link>
        </div>
      </div>
    </div>
  );
}
