import { COMPANY } from '@/lib/legal/company';
import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'medicalBusiness';
}

export default function StructuredData({
  type = 'website',
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Almanaque da Fala',
      alternateName: 'Almanaque da Fala',
      url: 'https://almanaquedafala.com.br',
      logo: 'https://almanaquedafala.com.br/logo.png',
      description:
        'Biblioteca de atividades de fonoaudiologia para imprimir, organizadas por fonema, para fonoaudiólogos.',
      foundingDate: '2024',
      areaServed: {
        '@type': 'Country',
        name: 'Brasil',
      },
      knowsLanguage: 'pt-BR',
      serviceType: 'Software as a Service (SaaS)',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        category: 'Healthcare Software',
        eligibleRegion: {
          '@type': 'Country',
          name: 'Brasil',
        },
      },
    };

    if (type === 'medicalBusiness') {
      return {
        ...baseData,
        '@type': ['Organization', 'MedicalBusiness'],
        medicalSpecialty: 'Speech-Language Pathology',
        serviceType: 'Healthcare Software Platform',
        audience: {
          '@type': 'ProfessionalAudience',
          audienceType: 'Speech-Language Pathologists',
        },
      };
    }

    if (type === 'website') {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Almanaque da Fala',
        alternateName: 'Almanaque da Fala',
        url: 'https://www.almanaquedafala.com.br',
        description:
          'Atividades de fonoaudiologia para imprimir, organizadas por fonema',
        inLanguage: 'pt-BR',
        isAccessibleForFree: false,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://www.almanaquedafala.com.br/dashboard?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Almanaque da Fala',
          url: 'https://www.almanaquedafala.com.br',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.almanaquedafala.com.br/logo.png',
            width: 512,
            height: 512,
          },
          sameAs: [
            'https://www.linkedin.com/company/almanaque-da-fala',
            'https://www.instagram.com/almanaquedafala',
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            email: COMPANY.contactEmail,
            contactType: 'customer service',
            availableLanguage: 'Portuguese',
          },
        },
      };
    }

    return baseData;
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
