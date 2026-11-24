'use client';

import { LIBRARY_PATH } from '@/lib/libraryUrl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * After sign-up (or from a deep link), start Stripe checkout for the chosen
 * interval and leave this page. Already-subscribed users go to the library.
 */
export default function StartCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const raw = searchParams.get('interval');
  const interval = raw === 'monthly' || raw === 'yearly' ? raw : 'yearly';

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    (async () => {
      try {
        const statusRes = await fetch('/api/subscription/status');
        if (statusRes.ok) {
          const status = await statusRes.json();
          if (status?.data?.subscribed || status?.data?.isAdmin) {
            router.replace(LIBRARY_PATH);
            return;
          }
        }

        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interval }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.url) {
          window.location.href = json.url;
          return;
        }
      } catch {
        /* falls through */
      }
      if (!cancelled) {
        setError(
          'Não foi possível abrir o pagamento. Tente de novo a partir do perfil.'
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [interval, router]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {error ? (
        <>
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <a
            href="/dashboard/profile?tab=assinatura"
            className="mt-4 text-sm font-semibold text-coral-800 underline underline-offset-4"
          >
            Ir para assinatura
          </a>
        </>
      ) : (
        <>
          <p className="font-display text-lg font-bold text-violet-950">
            A abrir o pagamento…
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Plano {interval === 'yearly' ? 'anual' : 'mensal'}. Não feche esta
            página.
          </p>
        </>
      )}
    </div>
  );
}
