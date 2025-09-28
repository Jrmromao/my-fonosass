import { Metadata } from 'next';
import RecursosGratuitosClient from './RecursosGratuitosClient';

export const metadata: Metadata = {
  title:
    'Recursos Gratuitos - Exercícios de Fonoaudiologia | Almanaque da Fala',
  description:
    'Baixe gratuitamente exercícios de fonoaudiologia, planilhas de avaliação, guias de desenvolvimento da fala e materiais didáticos para fonoaudiólogos.',
  keywords: [
    'recursos gratuitos fonoaudiologia',
    'exercícios fonoaudiológicos grátis',
    'materiais fonoaudiologia',
    'planilhas avaliação fala',
    'guias desenvolvimento linguagem',
    'exercícios crianças',
    'terapia da fala',
    'download grátis',
  ],
  openGraph: {
    title: 'Recursos Gratuitos - Exercícios de Fonoaudiologia',
    description:
      'Baixe gratuitamente exercícios de fonoaudiologia, planilhas de avaliação e guias de desenvolvimento da fala.',
    type: 'website',
    url: 'https://www.almanaquedafala.com.br/recursos-gratuitos',
  },
};

export default function RecursosGratuitosPage() {
  return <RecursosGratuitosClient />;
}
