'use client';

import { Button } from '@/components/ui/button';
import { useAnalyticsConsent, writeConsent } from '@/lib/cookieConsent';
import Link from 'next/link';

/**
 * Asks once whether Google Analytics and browser error reports (Sentry) may run. Accept and Refuse have the same
 * weight on purpose. Essential cookies (login, security) need no consent.
 */
export default function AnalyticsConsentBanner() {
  const consent = useAnalyticsConsent();
  if (consent !== 'unset') return null;

  return (
    <div
      role="dialog"
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-text"
      className="fixed inset-x-4 bottom-4 z-50 rounded-md border border-neutral-200 bg-white p-5 sm:left-auto sm:right-4 sm:max-w-sm"
    >
      <h2
        id="analytics-consent-title"
        className="text-base font-semibold text-neutral-900"
      >
        Cookies de análise
      </h2>
      <p
        id="analytics-consent-text"
        className="mt-1.5 text-sm text-neutral-600"
      >
        Usamos o Google Analytics para entender como o site é usado e o Sentry
        para receber relatórios de erros do navegador, sem dados pessoais. Só
        ativamos se você aceitar. Os cookies essenciais, de login e segurança,
        funcionam sempre.{' '}
        <Link href="/cookies" className="underline underline-offset-2">
          Saiba mais
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          className="h-10 flex-1 border-neutral-900 text-sm font-semibold text-neutral-900"
          onClick={() => writeConsent('denied')}
        >
          Recusar
        </Button>
        <Button
          className="h-10 flex-1 bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
          onClick={() => writeConsent('granted')}
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}
