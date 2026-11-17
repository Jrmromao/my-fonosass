// Single source of truth for public plan details (landing page + checkout UI).
// Stripe price IDs stay in env vars; only display values live here.

export const FREE_PLAN = {
  name: 'Gratuito',
  monthlyPrice: 0,
  features: [
    '3 downloads por mês',
    'Acesso à biblioteca de fonemas',
    'Visualização de atividades',
  ],
} as const;

export const PRO_PLAN = {
  name: 'Profissional',
  description: 'Para fonoaudiólogos trabalhando com exercícios de fonemas',
  monthlyPrice: 39.9,
  yearlyPrice: 399.9,
  features: [
    'Acesso a todos os exercícios de fonemas',
    'Biblioteca completa de recursos',
    'Material para imprimir',
    'Materiais de referência estendidos',
    'Suporte por email prioritário',
  ],
} as const;

// Phoneme whose activities are free for any signed-in user (trial access).
// Must match Activity.phoneme values in the DB (uppercase, e.g. 'S').
export const FREE_PHONEME = 'S';

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
