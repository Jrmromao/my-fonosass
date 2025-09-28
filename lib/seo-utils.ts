/**
 * SEO Utilities for Almanaque da Fala
 * Provides helper functions for SEO optimization
 */

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Generate meta tags for better SEO
 */
export function generateMetaTags(seoData: SEOData) {
  const {
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage = '/og-image.png',
    noindex = false,
  } = seoData;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    canonical: canonicalUrl,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * Generate structured data for different page types
 */
export function generateStructuredData(
  type: 'website' | 'article' | 'organization',
  data: any
) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return baseData;
}

/**
 * Target keywords for different page types
 */
export const TARGET_KEYWORDS = {
  homepage: [
    'fonoaudiologia',
    'fonoaudiólogo',
    'plataforma fonoaudiologia',
    'software fonoaudiologia',
    'prontuários digitais',
    'exercícios fonoaudiológicos',
    'terapia da fala',
    'Brasil',
    'LGPD',
    'CFFa',
  ],
  blog: [
    'exercícios de fonoaudiologia para crianças',
    'terapia da fala online',
    'exercícios fonoaudiológicos',
    'desenvolvimento da fala',
    'fonemas para crianças',
    'terapia fonoaudiológica',
  ],
  contact: [
    'contato fonoaudiologia',
    'suporte fonoaudiologia',
    'ajuda fonoaudiólogo',
    'atendimento fonoaudiologia',
  ],
  community: [
    'comunidade fonoaudiólogos',
    'rede fonoaudiologia',
    'profissionais fonoaudiologia',
    'comunidade fonoaudiológica',
  ],
  specialists: [
    'especialistas fonoaudiologia',
    'profissionais fonoaudiologia',
    'fonoaudiólogos especialistas',
    'equipe fonoaudiologia',
  ],
};

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string = '') {
  const baseUrl = 'https://www.almanaquedafala.com.br';
  return `${baseUrl}${path}`;
}

/**
 * Validate SEO data
 */
export function validateSEOData(seoData: SEOData): string[] {
  const errors: string[] = [];

  if (!seoData.title || seoData.title.length < 30) {
    errors.push('Title should be at least 30 characters long');
  }

  if (seoData.title && seoData.title.length > 60) {
    errors.push('Title should be less than 60 characters');
  }

  if (!seoData.description || seoData.description.length < 120) {
    errors.push('Description should be at least 120 characters long');
  }

  if (seoData.description && seoData.description.length > 160) {
    errors.push('Description should be less than 160 characters');
  }

  if (!seoData.keywords || seoData.keywords.length === 0) {
    errors.push('Keywords array should not be empty');
  }

  if (!seoData.canonicalUrl) {
    errors.push('Canonical URL is required');
  }

  return errors;
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
