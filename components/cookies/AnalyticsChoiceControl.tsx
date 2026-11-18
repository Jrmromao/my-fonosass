'use client';

import { Button } from '@/components/ui/button';
import { useAnalyticsConsent, writeConsent } from '@/lib/cookieConsent';

/**
 * Lets anyone (signed in or not) see and change the analytics and error-report choice
 * made in the banner. Withdrawing must be as easy as accepting (LGPD art. 8,
 * § 5º). Shown on /cookies.
 */
export function AnalyticsChoiceControl({ enabled }: { enabled: boolean }) {
  const consent = useAnalyticsConsent();

  if (!enabled) {
    return (
      <p className="rounded-md border border-neutral-200 p-4 text-sm dark:border-neutral-800">
        A análise de uso e os relatórios de erros estão desativados neste site
        no momento.
      </p>
    );
  }

  const status =
    consent === 'granted'
      ? 'Você aceitou a análise de uso e os relatórios de erros neste navegador.'
      : consent === 'denied'
        ? 'Você recusou a análise de uso e os relatórios de erros neste navegador.'
        : consent === 'unset'
          ? 'Você ainda não escolheu. A análise de uso e os relatórios de erros ficam desligados até você aceitar.'
          : 'Carregando sua escolha...';

  return (
    <div className="rounded-md border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <p role="status">{status}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 border-neutral-900 font-semibold dark:border-neutral-300"
          disabled={consent === 'denied' || consent === 'loading'}
          onClick={() => writeConsent('denied')}
        >
          Recusar
        </Button>
        <Button
          size="sm"
          className="h-9 bg-neutral-900 font-semibold text-white hover:bg-neutral-800"
          disabled={consent === 'granted' || consent === 'loading'}
          onClick={() => writeConsent('granted')}
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}
