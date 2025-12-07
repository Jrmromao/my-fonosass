import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { Metadata } from 'next';
import ContatoClient from './ContatoClient';

export const metadata: Metadata = {
  title: 'Contato - Almanaque da Fala',
  description:
    'Entre em contato conosco para dúvidas, suporte ou informações sobre nossos serviços de fonoaudiologia.',
  keywords: [
    'contato',
    'suporte',
    'fonoaudiologia',
    'almanaque da fala',
    'atendimento',
  ],
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900">
      <SharedNavbar />
      <main className="pt-20">
        <ContatoClient />
      </main>
      <LandingFooter />
    </div>
  );
}
