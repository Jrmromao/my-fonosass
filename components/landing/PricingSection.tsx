'use client';

import { PRO_PLAN, YEARLY_DISCOUNT, formatBRL } from '@/lib/pricing';
import { useAuth } from '@clerk/nextjs';
import { Check } from 'lucide-react';
import { useState } from 'react';

type Interval = 'monthly' | 'yearly';

/**
 * Landing pricing: one plan, choose monthly or yearly, then Assinar.
 * Yearly is the default. Signed-in → Stripe; visitors → sign-up then
 * /dashboard/subscribe?interval=… which starts checkout automatically.
 */
export default function PricingSection() {
  const { isSignedIn } = useAuth();
  const [interval, setInterval] = useState<Interval>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctaLabel =
    interval === 'yearly'
      ? `Assinar anual · ${formatBRL(PRO_PLAN.yearlyPrice)}/ano`
      : `Assinar mensal · ${formatBRL(PRO_PLAN.monthlyPrice)}/mês`;

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
    } catch {
      /* falls through */
    }
    setError('Não foi possível abrir o pagamento. Tente novamente.');
    setLoading(false);
  };

  const onAssinar = () => {
    if (!isSignedIn) {
      const to = `/dashboard/subscribe?interval=${interval}`;
      window.location.href = `/sign-up?redirect_url=${encodeURIComponent(to)}`;
      return;
    }
    void startCheckout();
  };

  return (
    <section
      id="planos"
      className="border-t border-violet-200 bg-violet-50 py-20"
    >
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="font-display text-3xl font-bold">
          Um plano. Sem créditos, sem adicionais.
        </h2>
        <p className="mt-3 text-neutral-600">
          Acesso completo à biblioteca, com atividades novas todo mês.
        </p>

        <div className="mt-10 rounded-lg border-2 border-neutral-900 bg-white p-7 md:p-9">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-600">
                {PRO_PLAN.name}
              </p>
              <ul className="mt-4 space-y-3">
                {PRO_PLAN.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-neutral-900"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-coral-700"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-neutral-900">
                Como prefere pagar?
              </p>

              <fieldset className="space-y-3">
                <legend className="sr-only">Intervalo de cobrança</legend>
                <PriceChoice
                  selected={interval === 'yearly'}
                  onSelect={() => setInterval('yearly')}
                  label="Anual"
                  price={formatBRL(PRO_PLAN.yearlyPrice)}
                  period="/ano"
                  badge={`${YEARLY_DISCOUNT.percent}% de desconto`}
                  note={`Equivale a ${formatBRL(YEARLY_DISCOUNT.perMonth)}/mês · economia de ${formatBRL(YEARLY_DISCOUNT.amount)} por ano`}
                />
                <PriceChoice
                  selected={interval === 'monthly'}
                  onSelect={() => setInterval('monthly')}
                  label="Mensal"
                  price={formatBRL(PRO_PLAN.monthlyPrice)}
                  period="/mês"
                />
              </fieldset>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={onAssinar}
                disabled={loading}
                className="mt-2 block w-full rounded-md bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {loading ? 'Abrindo pagamento…' : ctaLabel}
              </button>
              <p className="text-center text-xs text-neutral-600">
                Cancele quando quiser, sem multa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceChoice({
  selected,
  onSelect,
  label,
  price,
  period,
  badge,
  note,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  price: string;
  period: string;
  badge?: string;
  note?: string;
}) {
  return (
    <label
      className={`block cursor-pointer rounded-md border px-5 py-4 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-coral-700 focus-within:ring-offset-2 ${
        selected
          ? 'border-neutral-900 bg-violet-50 ring-1 ring-neutral-900'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <input
        type="radio"
        name="billing-interval"
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">
              {label}
            </span>
            {badge && (
              <span className="rounded-full bg-sun-300 px-2 py-0.5 text-[11px] font-bold text-violet-950">
                {badge}
              </span>
            )}
          </div>
          {note && (
            <p className="mt-1 text-xs leading-snug text-neutral-600">{note}</p>
          )}
        </div>
        <span className="shrink-0 font-display text-2xl font-bold text-neutral-900">
          {price}
          <span className="ml-1 font-sans text-sm font-normal text-neutral-600">
            {period}
          </span>
        </span>
      </div>
    </label>
  );
}
