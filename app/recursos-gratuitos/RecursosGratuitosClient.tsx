'use client';

import WaitingListAlert from '@/components/WaitingListAlert';
import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Resource, resourcesService } from '@/services/resourcesService';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Star,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Use the Resource interface from the service
type FreeResource = Resource;

// Sample content for resources (this could also come from the database)
const RESOURCE_CONTENT: { [key: string]: string } = {
  // Content will be loaded from database or static files
};

const CATEGORIES = [
  'Todos',
  'Exercícios',
  'Avaliação',
  'Estimulação',
  'Consciência Fonológica',
  'Fonemas',
  'Fluência',
];

const AGE_GROUPS = [
  'Todas as idades',
  '0-3 anos',
  '3-6 anos',
  '4-8 anos',
  '6-12 anos',
];

export default function RecursosGratuitosClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('Todas as idades');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedResource, setSelectedResource] = useState<FreeResource | null>(
    null
  );
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalDownloads: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await resourcesService.getFreeResourcesWithStats();
        setResources(data.resources);
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Erro ao carregar recursos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'Todos' || resource.category === selectedCategory;
    const matchesAgeGroup =
      selectedAgeGroup === 'Todas as idades' ||
      resource.ageGroup === selectedAgeGroup;

    return matchesSearch && matchesCategory && matchesAgeGroup;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloadCount - a.downloadCount;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const featuredResources = resources.filter((r) => r.isFeatured);

  const handleDownload = async (resource: FreeResource) => {
    try {
      setDownloading(resource.id);

      // Download the resource (this will record the download and trigger file download)
      const success = await resourcesService.downloadResource(resource.id);

      if (success) {
        // Refresh the resources to update download counts
        const data = await resourcesService.getFreeResourcesWithStats();
        setResources(data.resources);
        setStats(data.stats);
      } else {
        alert('Erro ao baixar o arquivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      alert('Erro ao baixar o arquivo. Tente novamente.');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewContent = (resource: FreeResource) => {
    setSelectedResource(resource);
  };

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Recursos Gratuitos de Fonoaudiologia',
    description:
      'Baixe gratuitamente exercícios de fonoaudiologia, planilhas de avaliação e materiais didáticos para fonoaudiólogos.',
    url: 'https://www.almanaquedafala.com.br/recursos-gratuitos',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: resources.map((resource, index) => ({
        '@type': 'CreativeWork',
        position: index + 1,
        name: resource.title,
        description: resource.description,
        url: `https://www.almanaquedafala.com.br/recursos-gratuitos/${resource.slug || resource.id}`,
        author: {
          '@type': 'Organization',
          name: 'Almanaque da Fala',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Almanaque da Fala',
        },
        datePublished: resource.createdAt,
        fileFormat: 'application/pdf',
        contentSize: resource.fileSize,
        keywords: resource.tags.join(', '),
        audience: {
          '@type': 'Audience',
          audienceType: 'Fonoaudiólogos',
        },
      })),
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando recursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Shared Navbar */}
        <SharedNavbar />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 pt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Recursos Gratuitos', href: '/recursos-gratuitos' },
              ]}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 to-yellow-50 pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <span className="inline-block px-3 py-1.5 mb-4 sm:mb-6 text-xs sm:text-sm font-medium rounded-full bg-pink-100 text-pink-600">
                  Recursos Gratuitos
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                  Recursos Gratuitos de Fonoaudiologia
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto px-2">
                  Baixe gratuitamente exercícios, planilhas de avaliação e
                  materiais didáticos desenvolvidos por especialistas em
                  fonoaudiologia para terapia da fala.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>{stats.totalResources}+ Recursos PDF</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {Math.round(stats.totalDownloads / 1000)}k+ Downloads
                  </span>
                </div>
                <div className="flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white text-gray-600">
                  <Star className="w-4 h-4" aria-hidden="true" />
                  <span>Avaliação {stats.averageRating}/5</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Featured Resources */}
            {featuredResources.length > 0 && (
              <section className="mb-12" aria-labelledby="featured-resources">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
                  <h2
                    id="featured-resources"
                    className="text-2xl font-bold text-gray-900"
                  >
                    Recursos em Destaque para Fonoaudiólogos
                  </h2>
                </div>
                <p className="text-gray-600 mb-8 max-w-3xl">
                  Nossos materiais mais populares e recomendados para terapia da
                  fala, desenvolvimento da linguagem e avaliação
                  fonoaudiológica.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-pink-200 flex flex-col h-full"
                      itemScope
                      itemType="https://schema.org/CreativeWork"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              href={`/recursos-gratuitos/${resource.slug || resource.id}`}
                            >
                              <h3
                                className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors cursor-pointer"
                                itemProp="name"
                              >
                                {resource.title}
                              </h3>
                            </Link>
                            <p
                              className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[3.5rem]"
                              itemProp="description"
                            >
                              {resource.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-600 ml-2">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.ageGroup}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 min-h-[1.5rem]">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {resource.downloadCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {resource.rating}
                          </span>
                          <span>{resource.fileSize}</span>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                          <Button
                            onClick={() => handleViewContent(resource)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Conteúdo
                          </Button>
                          <Button
                            onClick={() => handleDownload(resource)}
                            disabled={downloading === resource.id}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
                          >
                            {downloading === resource.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Baixando...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Baixar PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Filters */}
            <div className="mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar recursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Faixa Etária
                    </label>
                    <select
                      value={selectedAgeGroup}
                      onChange={(e) => setSelectedAgeGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      {AGE_GROUPS.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="popular">Mais Baixados</option>
                      <option value="rating">Melhor Avaliados</option>
                      <option value="newest">Mais Recentes</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid */}
            <section aria-labelledby="all-resources">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
                <h2
                  id="all-resources"
                  className="text-2xl font-bold text-gray-900"
                >
                  Biblioteca Completa de Recursos Fonoaudiológicos (
                  {sortedResources.length})
                </h2>
              </div>
              <p className="text-gray-600 mb-8 max-w-3xl">
                Explore nossa coleção completa de materiais para fonoaudiologia,
                incluindo exercícios terapêuticos, protocolos de avaliação e
                guias de desenvolvimento da linguagem.
              </p>

              {sortedResources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum recurso encontrado
                  </h3>
                  <p className="text-gray-500">
                    Tente ajustar os filtros para encontrar o que procura.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedResources.map((resource) => (
                    <article
                      key={resource.id}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-pink-200 flex flex-col h-full"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Link
                              href={`/recursos-gratuitos/${resource.slug || resource.id}`}
                            >
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                                {resource.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed min-h-[3.5rem]">
                              {resource.description}
                            </p>
                          </div>
                          {resource.isFeatured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-600 ml-2">
                              <Star className="w-3 h-3 mr-1" />
                              Destaque
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.ageGroup}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 min-h-[1.5rem]">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {resource.downloadCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {resource.rating}
                          </span>
                          <span>{resource.fileSize}</span>
                        </div>

                        <div className="flex gap-2 w-full mt-auto">
                          <Button
                            onClick={() => handleViewContent(resource)}
                            variant="outline"
                            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Conteúdo
                          </Button>
                          <Button
                            onClick={() => handleDownload(resource)}
                            disabled={downloading === resource.id}
                            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
                          >
                            {downloading === resource.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Baixando...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Baixar PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* CTA Section */}
        <WaitingListAlert />
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl p-8 text-center text-white mt-16">
          <h2 className="text-2xl font-bold mb-4">
            Quer Acesso a Mais Recursos?
          </h2>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            Junte-se à nossa plataforma e tenha acesso a centenas de exercícios,
            planilhas de avaliação e ferramentas profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-gray-50"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explorar Plataforma
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-gray-50"
            >
              <Users className="w-5 h-5 mr-2" />
              Ver Comunidade
            </Button>
          </div>
        </div>

        {/* Content Modal */}
        <Dialog
          open={!!selectedResource}
          onOpenChange={() => setSelectedResource(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
            <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4">
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                {selectedResource?.title}
              </DialogTitle>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <FileText className="w-4 h-4" />
                  {selectedResource?.category}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Star className="w-4 h-4" />
                  {selectedResource?.ageGroup}
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full">
                  {selectedResource?.fileSize}
                </span>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedResource && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedResource.description}
                  </p>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Download Count:</strong>{' '}
                      {selectedResource.downloadCount} |
                      <strong> Rating:</strong> {selectedResource.rating}/5 |
                      <strong> File Size:</strong> {selectedResource.fileSize}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {selectedResource?.downloadCount} downloads • Avaliação{' '}
                {selectedResource?.rating}/5
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    selectedResource && handleDownload(selectedResource)
                  }
                  disabled={
                    selectedResource
                      ? downloading === selectedResource.id
                      : false
                  }
                  className="bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50"
                >
                  {selectedResource && downloading === selectedResource.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedResource(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <LandingFooter />
    </>
  );
}
