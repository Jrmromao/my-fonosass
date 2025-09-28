import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { Metadata } from 'next';
import RecursosClient from './RecursosClient';

export const metadata: Metadata = {
  title: 'Recursos e Materiais - Almanaque da Fala',
  description:
    'Acesse biblioteca de exercícios, materiais didáticos e recursos para desenvolvimento da fala e linguagem.',
  keywords: [
    'recursos',
    'materiais',
    'exercícios',
    'desenvolvimento da fala',
    'fonoaudiologia',
    'almanaque da fala',
  ],
};

export default function ComunidadePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900">
      <SharedNavbar />
      <main className="pt-20">
        <RecursosClient />
      </main>
      <LandingFooter />
    </div>
  );
}
