import { UiVariants } from '@/components/dev/UiVariants';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Design exploration for the signed-in area: the same Biblioteca screens in
// several visual directions, with mock data, to choose one with Eliane.
// Development only: 404 in production. Delete once a direction is chosen.

export const metadata: Metadata = {
  title: 'Estilos (rascunho)',
  robots: { index: false, follow: false },
};

export default function EstilosPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <UiVariants />;
}
