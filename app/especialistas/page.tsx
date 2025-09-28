import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { Metadata } from 'next';
import EspecialistasClient from './EspecialistasClient';

export const metadata: Metadata = {
  title: 'Especialistas - Almanaque da Fala',
  description:
    'Conecte-se com fonoaudiólogos especialistas e receba orientação profissional personalizada.',
  keywords: [
    'especialistas',
    'fonoaudiólogos',
    'consulta online',
    'orientação profissional',
    'almanaque da fala',
  ],
};

export default function EspecialistasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900">
      <SharedNavbar />
      <main className="pt-20">
        <EspecialistasClient />
      </main>
      <LandingFooter />
    </div>
  );
}
