// Single source of truth for public plan details (landing page + checkout UI).
// Stripe price IDs stay in env vars; only display values live here.

export const PRO_PLAN = {
  name: 'Profissional',
  description: 'Para fonoaudiólogos trabalhando com exercícios de fonemas',
  monthlyPrice: 39.9,
  yearlyPrice: 399.9,
  features: [
    'Todas as atividades da biblioteca',
    'Downloads ilimitados, prontos para imprimir',
    'Novas atividades toda semana',
  ],
} as const;

// Phoneme of the free samples (see FREE_SAMPLE_COUNT in lib/access-constants).
// Must match Activity.phoneme values in the DB (uppercase, e.g. 'S').
export const FREE_PHONEME = 'S';

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
