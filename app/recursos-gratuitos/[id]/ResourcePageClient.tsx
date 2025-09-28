'use client';

import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Resource, resourcesService } from '@/services/resourcesService';
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  FileText,
  Star,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ResourcePageClientProps {
  resource: Resource;
}

export default function ResourcePageClient({
  resource,
}: ResourcePageClientProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const success = await resourcesService.downloadResource(resource.id);

      if (!success) {
        alert('Erro ao baixar o arquivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Erro ao baixar o arquivo. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  // Generate structured data for this specific resource
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `https://www.almanaquedafala.com.br/recursos-gratuitos/${resource.slug}`,
    name: resource.title,
    description: resource.description,
    url: `https://www.almanaquedafala.com.br/recursos-gratuitos/${resource.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Almanaque da Fala',
      url: 'https://www.almanaquedafala.com.br',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Almanaque da Fala',
      url: 'https://www.almanaquedafala.com.br',
    },
    datePublished: resource.createdAt,
    dateModified: resource.updatedAt,
    fileFormat: 'application/pdf',
    contentSize: resource.fileSize,
    keywords: resource.tags.join(', '),
    audience: {
      '@type': 'Audience',
      audienceType: 'Fonoaudiólogos',
    },
    isAccessibleForFree: resource.isFree,
    downloadUrl: `https://www.almanaquedafala.com.br/api/resources/${resource.id}/file`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: resource.rating,
      ratingCount: Math.floor(resource.downloadCount / 10), // Estimate based on downloads
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/DownloadAction',
        userInteractionCount: resource.downloadCount,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: resource.viewCount,
      },
    ],
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Navigation */}
        <SharedNavbar />

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Recursos Gratuitos', href: '/recursos-gratuitos' },
                {
                  name: resource.title,
                  href: `/recursos-gratuitos/${resource.slug}`,
                },
              ]}
            />
          </div>
        </div>

        {/* Back Button */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/recursos-gratuitos"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Recursos Gratuitos
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="prose prose-lg max-w-none">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-600">
                  {resource.category}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {resource.ageGroup}
                </span>
                {resource.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {resource.title}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {resource.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{resource.downloadCount} downloads</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{resource.rating}/5</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{resource.viewCount} visualizações</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(resource.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {resource.fileSize && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{resource.fileSize}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Tags */}
            {resource.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Tags:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content Section */}
            {resource.content && resource.content.trim() && (
              <div className="mb-8">
                <div
                  className="prose prose-lg max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:border-b prose-h1:border-pink-200 prose-h1:pb-3
                    prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                    prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-gray-800
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:marker:text-pink-500
                    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:mb-1
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                    prose-blockquote:border-l-4 prose-blockquote:border-pink-200 prose-blockquote:pl-4 prose-blockquote:italic
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: resource.content
                      .replace(
                        /^# (.*$)/gim,
                        '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8 border-b border-pink-200 pb-3">$1</h1>'
                      )
                      .replace(
                        /^## (.*$)/gim,
                        '<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8 border-b border-gray-200 pb-2">$1</h2>'
                      )
                      .replace(
                        /^### (.*$)/gim,
                        '<h3 class="text-xl font-medium text-gray-800 mb-3 mt-6">$1</h3>'
                      )
                      .replace(
                        /^- (.*$)/gim,
                        '<li class="text-gray-700 leading-relaxed mb-1">$1</li>'
                      )
                      .replace(
                        /^\d+\. (.*$)/gim,
                        '<li class="text-gray-700 leading-relaxed mb-1">$1</li>'
                      )
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="font-semibold text-gray-900">$1</strong>'
                      )
                      .replace(
                        /\*(.*?)\*/g,
                        '<em class="italic text-gray-800">$1</em>'
                      )
                      .replace(
                        /\n\n/g,
                        '</p><p class="text-gray-700 leading-relaxed mb-4">'
                      )
                      .replace(
                        /^(?!<[h|l]|<div|<table)/gm,
                        '<p class="text-gray-700 leading-relaxed mb-4">'
                      )
                      .replace(
                        /<p class="text-gray-700 leading-relaxed mb-4"><\/p>/g,
                        ''
                      ),
                  }}
                />
              </div>
            )}

            {/* Download Section */}
            <div className="bg-gray-50 rounded-xl p-8 text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Baixar Recurso Gratuito
              </h2>
              <p className="text-gray-600 mb-6">
                Este recurso é totalmente gratuito e pode ser baixado
                imediatamente.
              </p>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Baixando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Baixar PDF Gratuito
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                {resource.downloadCount} pessoas já baixaram este recurso
              </p>
            </div>

            {/* Resource Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações do Recurso
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900">Categoria</dt>
                  <dd className="text-gray-600">{resource.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Faixa Etária</dt>
                  <dd className="text-gray-600">{resource.ageGroup}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Tipo</dt>
                  <dd className="text-gray-600">{resource.type}</dd>
                </div>
                {resource.fileSize && (
                  <div>
                    <dt className="font-medium text-gray-900">
                      Tamanho do Arquivo
                    </dt>
                    <dd className="text-gray-600">{resource.fileSize}</dd>
                  </div>
                )}
                {resource.duration && (
                  <div>
                    <dt className="font-medium text-gray-900">Duração</dt>
                    <dd className="text-gray-600">{resource.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-gray-900">Downloads</dt>
                  <dd className="text-gray-600">{resource.downloadCount}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Avaliação</dt>
                  <dd className="text-gray-600">{resource.rating}/5</dd>
                </div>
              </dl>
            </div>
          </article>
        </main>
      </div>
      <LandingFooter />
    </>
  );
}
