'use client';

import ResourceFileUpload from '@/components/admin/ResourceFileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Resource, resourcesService } from '@/services/resourcesService';
import {
  BookOpen,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Image,
  Plus,
  Presentation,
  Search,
  Star,
  Trash2,
  Video,
  Volume2,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const RESOURCE_TYPES = [
  { value: 'PDF', label: 'PDF', icon: FileText },
  { value: 'VIDEO', label: 'Vídeo', icon: Video },
  { value: 'AUDIO', label: 'Áudio', icon: Volume2 },
  { value: 'GUIDE', label: 'Guia', icon: BookOpen },
  { value: 'DOCUMENT', label: 'Documento', icon: FileText },
  { value: 'PRESENTATION', label: 'Apresentação', icon: Presentation },
  { value: 'WORKSHEET', label: 'Planilha', icon: FileSpreadsheet },
  { value: 'IMAGE', label: 'Imagem', icon: Image },
  { value: 'INTERACTIVE', label: 'Interativo', icon: Zap },
];

export default function AdminResourcesPage() {
  const { role, isLoading } = useUserRole();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PDF' as
      | 'PDF'
      | 'VIDEO'
      | 'AUDIO'
      | 'GUIDE'
      | 'DOCUMENT'
      | 'PRESENTATION'
      | 'WORKSHEET'
      | 'IMAGE'
      | 'INTERACTIVE',
    category: '',
    ageGroup: '',
    duration: '',
    fileSize: '',
    tags: [] as string[],
    downloadUrl: '',
    viewUrl: '',
    thumbnailUrl: '',
    isFree: true,
    isPublished: true,
    isFeatured: false,
  });

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      const data = await resourcesService.getResources();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os recursos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await resourcesService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadResources();
    loadCategories();
  }, [loadResources, loadCategories]);

  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          resource.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((resource) => resource.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (resource) => resource.category === selectedCategory
      );
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedType, selectedCategory]);

  // Redirect if not admin
  if (!isLoading && role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Acesso negado. Apenas administradores podem gerenciar recursos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleCreateResource = async () => {
    try {
      console.log('Creating resource with data:', formData);

      // Validate required fields
      if (
        !formData.title ||
        !formData.description ||
        !formData.type ||
        !formData.category ||
        !formData.ageGroup
      ) {
        toast({
          title: 'Erro',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(
          `Failed to create resource: ${errorData.message || response.statusText}`
        );
      }

      toast({
        title: 'Sucesso',
        description: 'Recurso criado com sucesso!',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      loadResources();
    } catch (error) {
      console.error('Error creating resource:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível criar o recurso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateResource = async () => {
    if (!editingResource) return;

    try {
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update resource');
      }

      toast({
        title: 'Sucesso',
        description: 'Recurso atualizado com sucesso!',
      });

      setEditingResource(null);
      resetForm();
      loadResources();
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o recurso.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      toast({
        title: 'Sucesso',
        description: 'Recurso excluído com sucesso!',
      });

      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o recurso.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'PDF',
      category: '',
      ageGroup: '',
      duration: '',
      fileSize: '',
      tags: [],
      downloadUrl: '',
      viewUrl: '',
      thumbnailUrl: '',
      isFree: true,
      isPublished: true,
      isFeatured: false,
    });
  };

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      category: resource.category,
      ageGroup: resource.ageGroup,
      duration: resource.duration || '',
      fileSize: resource.fileSize || '',
      tags: resource.tags,
      downloadUrl: resource.downloadUrl,
      viewUrl: resource.viewUrl,
      thumbnailUrl: resource.thumbnailUrl || '',
      isFree: resource.isFree,
      isPublished: resource.isPublished,
      isFeatured: resource.isFeatured,
    });
  };

  const getResourceIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find((t) => t.value === type);
    return resourceType ? resourceType.icon : FileText;
  };

  const getResourceBadgeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400';
      case 'VIDEO':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400';
      case 'AUDIO':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400';
      case 'GUIDE':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gerenciar Recursos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gerencie a biblioteca de recursos e materiais
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingResource(null);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Editar Recurso' : 'Criar Novo Recurso'}
              </DialogTitle>
            </DialogHeader>
            <ResourceForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              onSubmit={
                editingResource ? handleUpdateResource : handleCreateResource
              }
              isEditing={!!editingResource}
              editingResource={editingResource}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="resources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar recursos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources List */}
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Carregando recursos...
                </p>
              </div>
            ) : filteredResources.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">
                    Nenhum recurso encontrado.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <Card key={resource.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {resource.title}
                              </h3>
                              <Badge
                                className={getResourceBadgeColor(resource.type)}
                              >
                                {resource.type}
                              </Badge>
                              {resource.isFeatured && (
                                <Badge
                                  variant="outline"
                                  className="text-yellow-600 border-yellow-600"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Destaque
                                </Badge>
                              )}
                              {resource.isFree && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-600"
                                >
                                  Gratuito
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>
                                {resource.category} • {resource.ageGroup}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                {resource.downloadCount.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {resource.viewCount.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {resource.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(resource)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteResource(resource.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <h3 className="font-semibold">{category}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {resources.filter((r) => r.category === category).length}{' '}
                      recursos
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total de Recursos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {resources
                    .reduce((sum, r) => sum + r.downloadCount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total de Downloads
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {resources
                    .reduce((sum, r) => sum + r.viewCount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Total de Visualizações
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {(
                    resources.reduce((sum, r) => sum + r.rating, 0) /
                      resources.length || 0
                  ).toFixed(1)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Avaliação Média
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Resource Form Component
interface ResourceFormProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: string[];
  onSubmit: () => void;
  isEditing: boolean;
  editingResource?: Resource | null;
}

function ResourceForm({
  formData,
  setFormData,
  categories,
  onSubmit,
  isEditing,
  editingResource,
}: ResourceFormProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Título do recurso"
          />
        </div>
        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Descrição do recurso"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="Categoria do recurso"
          />
        </div>
        <div>
          <Label htmlFor="ageGroup">Faixa Etária *</Label>
          <Input
            id="ageGroup"
            value={formData.ageGroup}
            onChange={(e) =>
              setFormData({ ...formData, ageGroup: e.target.value })
            }
            placeholder="Ex: 4-6 anos"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duração</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            placeholder="Ex: 8 min"
          />
        </div>
        <div>
          <Label htmlFor="fileSize">Tamanho do Arquivo</Label>
          <Input
            id="fileSize"
            value={formData.fileSize}
            onChange={(e) =>
              setFormData({ ...formData, fileSize: e.target.value })
            }
            placeholder="Ex: 2.3 MB"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="downloadUrl">URL de Download *</Label>
          <Input
            id="downloadUrl"
            value={formData.downloadUrl}
            onChange={(e) =>
              setFormData({ ...formData, downloadUrl: e.target.value })
            }
            placeholder="/api/resources/download/1"
          />
        </div>
        <div>
          <Label htmlFor="viewUrl">URL de Visualização *</Label>
          <Input
            id="viewUrl"
            value={formData.viewUrl}
            onChange={(e) =>
              setFormData({ ...formData, viewUrl: e.target.value })
            }
            placeholder="/recursos/fonema-r"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">URL da Miniatura</Label>
        <Input
          id="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={(e) =>
            setFormData({ ...formData, thumbnailUrl: e.target.value })
          }
          placeholder="/images/resources/thumb.jpg"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Adicionar tag"
            onKeyPress={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addTag())
            }
          />
          <Button type="button" onClick={addTag} size="sm">
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFree"
            checked={formData.isFree}
            onChange={(e) =>
              setFormData({ ...formData, isFree: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="isFree">Recurso Gratuito</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="isPublished">Publicado</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) =>
              setFormData({ ...formData, isFeatured: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="isFeatured">Em Destaque</Label>
        </div>
      </div>

      <div>
        <Label>Arquivos do Recurso</Label>
        <ResourceFileUpload
          resourceId={editingResource?.id}
          maxFiles={5}
          acceptedTypes={['application/pdf', 'video/*', 'audio/*', 'image/*']}
          maxSize={50 * 1024 * 1024} // 50MB
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setFormData({})}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>
          {isEditing ? 'Atualizar' : 'Criar'} Recurso
        </Button>
      </div>
    </div>
  );
}
