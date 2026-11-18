import { safeJsonLd } from '@/lib/security/jsonLd';
import Script from 'next/script';

interface FAQStructuredDataProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'Perguntas Frequentes - Almanaque da Fala',
    description:
      'FAQ da plataforma Almanaque da Fala para fonoaudiólogos brasileiros',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(structuredData),
      }}
    />
  );
}
