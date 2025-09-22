import FAQClient from '@/components/faq/FAQClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes - Almanaque da Fala',
  description:
    'Encontre respostas para as principais dúvidas sobre a plataforma Almanaque da Fala. Saiba como funciona, preços, funcionalidades e muito mais.',
  keywords: [
    'FAQ fonoaudiologia',
    'dúvidas Almanaque da Fala',
    'como funciona plataforma fonoaudiólogo',
    'preços Almanaque da Fala',
    'funcionalidades Almanaque da Fala',
    'suporte fonoaudiólogo',
  ],
  openGraph: {
    title: 'Perguntas Frequentes - Almanaque da Fala',
    description:
      'Encontre respostas para as principais dúvidas sobre a plataforma Almanaque da Fala.',
    url: 'https://almanaquedafala.com.br/faq',
  },
};

export default function FAQPage() {
  return <FAQClient />;
}
