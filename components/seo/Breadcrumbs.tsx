'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  items,
  className = '',
}: BreadcrumbsProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.almanaquedafala.com.br${item.href}`,
    })),
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-1 text-sm text-gray-500 ${className}`}
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index === 0 ? (
              <Link
                href={item.href}
                className="flex items-center hover:text-pink-600 transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                <span className="sr-only">{item.name}</span>
              </Link>
            ) : (
              <>
                <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
                {index === items.length - 1 ? (
                  <span
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-pink-600 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
