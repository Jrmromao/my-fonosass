'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Resource,
  ResourceFilters,
  ResourceStats,
  resourcesService,
} from '@/services/resourcesService';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Download,
  FileText,
  Heart,
  Play,
  Search,
  Star,
  TrendingUp,
  Users,
  Video,
  Volume2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function RecursosClient() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [newResources, setNewResources] = useState<Resource[]>([]);
  const [freeResources, setFreeResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const loadFilteredResources = useCallback(async () => {
    try {
      const filters: ResourceFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedType !== 'all') filters.type = selectedType;
      if (selectedCategory !== 'all') filters.category = selectedCategory;

      const filteredResources = await resourcesService.getResources(filters);
      setResources(filteredResources);
    } catch (error) {
      console.error('Error filtering resources:', error);
    }
  }, [searchTerm, selectedType, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resourcesData, featuredData, newData, freeData, statsData] =
        await Promise.all([
          resourcesService.getResources(),
          resourcesService.getFeaturedResources(3),
          resourcesService.getNewResources(2),
          resourcesService.getFreeResources(6),
          resourcesService.getStats(),
        ]);

      setResources(resourcesData);
      setFeaturedResources(featuredData);
      setNewResources(newData);
      setFreeResources(freeData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadFilteredResources();
  }, [loadFilteredResources]);

  const handleView = async (resourceId: string, viewUrl: string) => {
    try {
      const success = await resourcesService.viewResource(resourceId);
      if (success) {
        // Update local state
        setResources((prev) =>
          prev.map((resource) =>
            resource.id === resourceId
              ? { ...resource, downloadCount: resource.downloadCount + 1 }
              : resource
          )
        );

        // Navigate to the resource view page
        window.open(viewUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing resource:', error);
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      const success = await resourcesService.downloadResource(resourceId);
      if (success) {
        // Update local state
        setResources((prev) =>
          prev.map((resource) =>
            resource.id === resourceId
              ? { ...resource, downloadCount: resource.downloadCount + 1 }
              : resource
          )
        );
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
    }
  };

  const handleFavorite = (resourceId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(resourceId)) {
        newFavorites.delete(resourceId);
      } else {
        newFavorites.add(resourceId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Volume2 className="h-6 w-6" />;
      case 'guide':
        return <BookOpen className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getResourceBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'video':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'audio':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
      case 'guide':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Carregando recursos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Recursos e Materiais
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Biblioteca completa de exercícios, materiais didáticos e recursos para
          desenvolvimento da fala e linguagem
        </p>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {freeResources.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Recursos Gratuitos
              </p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalDownloads.toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Downloads</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {Object.keys(stats.categories).length}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Categorias</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                4.7
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Avaliação Média
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="pdf">PDF</option>
                  <option value="video">Vídeo</option>
                  <option value="audio">Áudio</option>
                  <option value="guide">Guia</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Todas as categorias</option>
                  {stats &&
                    Object.keys(stats.categories).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>

                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Recursos em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {featuredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {resource.ageGroup}
                          </p>
                        </div>
                      </div>
                      <Badge className={getResourceBadgeColor(resource.type)}>
                        {resource.type.toUpperCase()}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {resource.description}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {resource.downloadCount.toLocaleString()} downloads
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {resource.rating} avaliação
                      </span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Free Resources */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  Recursos Gratuitos ({freeResources.length})
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  Acesse nossos recursos gratuitos e mantenha-se dentro do nosso
                  ecossistema
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {freeResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {resource.title}
                            </h4>
                            <Badge className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 text-xs">
                              GRATUITO
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {resource.category} • {resource.ageGroup}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {resource.description.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFavorite(resource.id)}
                          className={
                            favorites.has(resource.id)
                              ? 'text-red-500 border-red-500'
                              : ''
                          }
                        >
                          <Heart
                            className={`h-4 w-4 ${favorites.has(resource.id) ? 'fill-current' : ''}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleView(resource.id, resource.viewUrl)
                          }
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(resource.id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Access Resources */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    Acesse Todos os Recursos
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Desbloqueie nossa biblioteca completa de exercícios e
                    materiais
                  </p>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold transition-colors">
                    Começar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Categories */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Categorias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats.categories).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
