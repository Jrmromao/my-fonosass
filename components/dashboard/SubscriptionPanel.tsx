'use client';

import { UpgradeDialog } from '@/components/dashboard/UpgradeDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PRO_PLAN, formatBRL } from '@/lib/pricing';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface SubscriptionStatus {
  success: boolean;
  data?: {
    subscribed: boolean;
    isAdmin: boolean;
    status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canManage: boolean;
  };
}

// After checkout the Stripe webhook can arrive a few seconds late.
const POLL_MS = 3000;
const POLL_MAX_MS = 30000;

/** Plan, renewal and Stripe portal. Rendered in the Assinatura tab of Perfil. */
export function SubscriptionPanel() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get('checkout');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const { data, isLoading, isError } = useQuery<SubscriptionStatus>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) throw new Error('Falha ao carregar a assinatura');
      return res.json();
    },
    // Right after a successful payment, keep checking until the plan shows up.
    refetchInterval: (query) =>
      checkout === 'success' &&
      !query.state.data?.data?.subscribed &&
      Date.now() - startedAt < POLL_MAX_MS
        ? POLL_MS
        : false,
  });

  const sub = data?.data;

  const openPortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
    } catch {
      /* falls through to the error message */
    }
    setPortalError('Não foi possível abrir o portal. Tente novamente.');
    setPortalLoading(false);
  };

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-BR') : null;
  const periodEnd = formatDate(sub?.currentPeriodEnd ?? null);

  return (
    <div>
      <div className="max-w-2xl space-y-6">
        {checkout === 'success' && (
          <p
            role="status"
            className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {sub?.subscribed
              ? 'Pagamento confirmado. Sua assinatura está ativa.'
              : 'Pagamento recebido. Estamos ativando a sua assinatura, isso leva alguns segundos.'}
          </p>
        )}
        {checkout === 'canceled' && (
          <p
            role="status"
            className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900"
          >
            Pagamento cancelado. Nenhuma cobrança foi feita.
          </p>
        )}

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : isError || !sub ? (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar a sua assinatura. Atualize a página.
          </p>
        ) : sub.subscribed ? (
          <section className="rounded-md border border-neutral-200 p-6 space-y-4">
            <div>
              <p className="text-sm text-neutral-600">Plano atual</p>
              <p className="text-lg font-semibold text-neutral-900">
                {PRO_PLAN.name}
              </p>
            </div>
            {periodEnd && (
              <p className="text-sm text-neutral-600">
                {sub.cancelAtPeriodEnd
                  ? `Cancelada. Você mantém o acesso até ${periodEnd}.`
                  : `Renova em ${periodEnd}.`}
              </p>
            )}
            {sub.status === 'PAST_DUE' && (
              <p className="text-sm text-amber-800">
                Há um pagamento pendente. Atualize a forma de pagamento.
              </p>
            )}
            {portalError && (
              <p role="alert" className="text-sm text-destructive">
                {portalError}
              </p>
            )}
            {sub.canManage && (
              <div className="space-y-2">
                <Button
                  className="h-10 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold"
                  onClick={openPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? 'Abrindo...' : 'Gerenciar assinatura'}
                </Button>
                <p className="text-sm text-neutral-600">
                  No portal você atualiza o cartão, vê as faturas e cancela
                  quando quiser.
                </p>
              </div>
            )}
          </section>
        ) : sub.isAdmin ? (
          <section className="rounded-md border border-neutral-200 p-6">
            <p className="text-sm text-neutral-900">
              Sua conta é de administrador e tem acesso a toda a biblioteca.
            </p>
          </section>
        ) : (
          <section className="rounded-md border border-neutral-200 p-6 space-y-4">
            <div>
              <p className="text-sm text-neutral-600">Plano atual</p>
              <p className="text-lg font-semibold text-neutral-900">
                Sem assinatura
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Você pode baixar as amostras grátis. Assine para baixar toda a
                biblioteca.
              </p>
            </div>
            <div className="rounded-md bg-neutral-50 p-4 space-y-2">
              <p className="text-base font-semibold text-neutral-900">
                {PRO_PLAN.name}: {formatBRL(PRO_PLAN.monthlyPrice)}/mês
              </p>
              <p className="text-sm text-neutral-600">
                Ou {formatBRL(PRO_PLAN.yearlyPrice)} por ano.
              </p>
              <ul className="space-y-1.5 pt-1">
                {PRO_PLAN.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-neutral-900"
                  >
                    <Check
                      className="h-4 w-4 mt-0.5 shrink-0 text-neutral-900"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="h-10 bg-coral-700 hover:bg-coral-800 text-white text-sm font-semibold"
              onClick={() => setUpgradeOpen(true)}
            >
              Assinar
            </Button>
          </section>
        )}
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
