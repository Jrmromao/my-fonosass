// Single source of truth for public plan details (landing page + checkout UI).
// Stripe price IDs stay in env vars; only display values live here.
// These must match the Stripe prices (docs/stripe-brazil-setup.md, step 5):
// the checkout charges the Stripe amount, the site only displays these.

export const PRO_PLAN = {
  name: 'Profissional',
  description: 'Para fonoaudiólogos trabalhando com exercícios de fonemas',
  monthlyPrice: 39.9,
  yearlyPrice: 299,
  features: [
    'Todas as atividades da biblioteca',
    'Downloads ilimitados, prontos para imprimir',
    'Atividades novas todo mês, sem custo extra',
  ],
} as const;

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Yearly plan compared with paying monthly for 12 months. Amounts in cents to
// avoid floating-point noise. The percentage is rounded down so the site never
// advertises a bigger discount than the real one (CDC: clear, accurate offers).
const monthlyYearCents = Math.round(PRO_PLAN.monthlyPrice * 100) * 12;
const yearlyCents = Math.round(PRO_PLAN.yearlyPrice * 100);

export const YEARLY_DISCOUNT = {
  /** 12 × monthly price, e.g. R$ 478,80. */
  monthlyForAYear: monthlyYearCents / 100,
  /** How much the yearly plan saves, e.g. R$ 179,80. */
  amount: (monthlyYearCents - yearlyCents) / 100,
  /** Whole percent, rounded down, e.g. 37. */
  percent: Math.floor(
    ((monthlyYearCents - yearlyCents) / monthlyYearCents) * 100
  ),
  /** Yearly price per month, e.g. R$ 24,92. */
  perMonth: Math.round(yearlyCents / 12) / 100,
} as const;

/** "37% de desconto (economia de R$ 179,80 por ano)". */
export function yearlyDiscountText(): string {
  return `${YEARLY_DISCOUNT.percent}% de desconto (economia de ${formatBRL(
    YEARLY_DISCOUNT.amount
  )} por ano)`;
}
