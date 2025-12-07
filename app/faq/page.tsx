import FAQClient from '@/components/faq/FAQClient';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { Metadata } from 'next';
import Script from 'next/script';

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
    url: 'https://www.almanaquedafala.com.br/faq',
  },
};

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O que é o Almanaque da Fala?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O Almanaque da Fala é uma plataforma especializada em exercícios de fala para fonoaudiólogos brasileiros. Oferecemos uma biblioteca completa de exercícios terapêuticos organizados por fonemas, com materiais prontos para impressão e uso em consultas.',
        },
      },
      {
        '@type': 'Question',
        name: 'Para quem é destinado o Almanaque da Fala?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O Almanaque da Fala é destinado a fonoaudiólogos, terapeutas da fala e profissionais que trabalham com reabilitação de fala e linguagem, especialmente aqueles que atendem crianças com dificuldades de articulação.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quais são as principais funcionalidades?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nossa plataforma oferece gestão de pacientes, prontuários digitais, biblioteca de exercícios fonoaudiológicos, agendamento de consultas, relatórios de progresso e muito mais, tudo em conformidade com a LGPD.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona o sistema de downloads?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oferecemos 5 downloads gratuitos por mês no plano gratuito. Para downloads ilimitados, você pode fazer upgrade para o plano Pro por apenas R$ 29,90/mês.',
        },
      },
      {
        '@type': 'Question',
        name: 'Os dados dos pacientes são seguros?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, todos os dados são criptografados e armazenados com segurança. Nossa plataforma é 100% compatível com a LGPD e seguimos as melhores práticas de segurança da informação.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-indigo-800 dark:to-purple-900">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <SharedNavbar />
      <main className="pt-20">
        <FAQClient />
      </main>
      <LandingFooter />
    </div>
  );
}
