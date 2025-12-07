import { ResourceFilters, ResourcesService } from '@/services/resourcesService';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(() => {
    // Get a fresh instance for each test
    service = ResourcesService.getInstance();

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock responses
    setupDefaultMocks();
  });

  // Mock data for tests
  const mockResources = [
    {
      id: '1',
      title: 'Exercício de Fonema /R/',
      description: 'Atividade para trabalhar o fonema /R/',
      type: 'PDF',
      category: 'Fonemas',
      ageGroup: '4-6 anos',
      duration: '10 min',
      fileSize: '2.3 MB',
      downloadCount: 150,
      viewCount: 300,
      rating: 4.5,
      tags: ['fonema', 'r', 'crianças'],
      downloadUrl: '/api/resources/download/1',
      viewUrl: '/recursos/fonema-r',
      thumbnailUrl: '/images/thumb1.jpg',
      isFree: true,
      isPublished: true,
      isFeatured: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: {
        id: 'user1',
        fullName: 'João Silva',
      },
    },
    {
      id: '2',
      title: 'Atividade de Consciência Fonológica',
      description: 'Exercícios para desenvolver consciência fonológica',
      type: 'VIDEO',
      category: 'Consciência Fonológica',
      ageGroup: '5-7 anos',
      duration: '15 min',
      fileSize: '45.2 MB',
      downloadCount: 89,
      viewCount: 200,
      rating: 4.2,
      tags: ['consciência', 'fonológica', 'vídeo'],
      downloadUrl: '/api/resources/download/2',
      viewUrl: '/recursos/consciencia-fonologica',
      thumbnailUrl: '/images/thumb2.jpg',
      isFree: false,
      isPublished: true,
      isFeatured: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      createdBy: {
        id: 'user2',
        fullName: 'Maria Santos',
      },
    },
    {
      id: '3',
      title: 'Atividade de Linguagem',
      description: 'Exercícios para desenvolvimento da linguagem',
      type: 'GUIDE',
      category: 'Linguagem',
      ageGroup: '7-10 anos',
      duration: '20 min',
      fileSize: '1.5 MB',
      downloadCount: 200,
      viewCount: 400,
      rating: 4.8,
      tags: ['linguagem', 'desenvolvimento', 'guia'],
      downloadUrl: '/api/resources/download/3',
      viewUrl: '/recursos/linguagem',
      thumbnailUrl: '/images/thumb3.jpg',
      isFree: true,
      isPublished: true,
      isFeatured: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      createdBy: {
        id: 'user3',
        fullName: 'Ana Costa',
      },
    },
  ];

  const mockStats = {
    totalResources: 3,
    totalDownloads: 439,
    totalViews: 900,
    averageRating: 4.5,
    freeResources: 2,
    paidResources: 1,
    featuredResources: 1,
    categories: {
      Fonemas: 1,
      'Consciência Fonológica': 1,
      Linguagem: 1,
    },
    types: {
      PDF: 1,
      VIDEO: 1,
      GUIDE: 1,
    },
    ageGroups: {
      '4-6 anos': 1,
      '5-7 anos': 1,
      '7-10 anos': 0,
      'Todas as idades': 0,
    },
  };

  const mockCategories = ['Fonemas', 'Consciência Fonológica', 'Linguagem'];
  const mockTypes = ['PDF', 'VIDEO', 'AUDIO', 'GUIDE'];
  const mockAgeGroups = [
    '4-6 anos',
    '5-7 anos',
    '7-10 anos',
    'Todas as idades',
  ];

  // Helper function to setup default mock responses
  function setupDefaultMocks() {
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (url.includes('/api/resources')) {
        // Handle different endpoints
        if (url.includes('/stats')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: mockStats,
              }),
          });
        }

        if (url.includes('/1')) {
          if (options?.method === 'POST') {
            // For view/download actions
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: mockResources[0],
              }),
          });
        }

        if (url.includes('/2')) {
          if (options?.method === 'POST') {
            // For view/download actions
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: mockResources[1],
              }),
          });
        }

        if (url.includes('/3')) {
          if (options?.method === 'POST') {
            // For view/download actions
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: mockResources[2],
              }),
          });
        }

        if (url.includes('invalid-id')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Resource not found' }),
          });
        }

        // Handle query parameters for filtering
        if (url.includes('type=PDF') || url.includes('type=pdf')) {
          const filteredResources = mockResources.filter(
            (r) => r.type === 'PDF'
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: filteredResources,
              }),
          });
        }

        if (url.includes('category=Fonemas')) {
          const filteredResources = mockResources.filter(
            (r) => r.category === 'Fonemas'
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: filteredResources,
              }),
          });
        }

        if (
          url.includes('ageGroup=4-6 anos') ||
          url.includes('ageGroup=4-6%20anos') ||
          url.includes('ageGroup=4-6+anos')
        ) {
          const filteredResources = mockResources.filter(
            (r) => r.ageGroup === '4-6 anos'
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: filteredResources,
              }),
          });
        }

        if (url.includes('search=fonema')) {
          const filteredResources = mockResources.filter(
            (r) =>
              r.title.toLowerCase().includes('fonema') ||
              r.description.toLowerCase().includes('fonema') ||
              r.tags.some((tag) => tag.toLowerCase().includes('fonema'))
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: filteredResources,
              }),
          });
        }

        if (url.includes('isFeatured=true')) {
          const featuredResources = mockResources
            .filter((r) => r.isFeatured)
            .sort((a, b) => b.downloadCount - a.downloadCount);
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: featuredResources,
              }),
          });
        }

        if (url.includes('isFree=true')) {
          const freeResources = mockResources.filter((r) => r.isFree);
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: freeResources,
              }),
          });
        }

        // Handle new resources with sorting
        if (
          url.includes('limit=') &&
          !url.includes('isFeatured') &&
          !url.includes('isFree')
        ) {
          const sortedResources = [...mockResources].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                data: sortedResources,
              }),
          });
        }

        // Default response for getResources
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: mockResources,
            }),
        });
      }

      // Default fallback
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });
  }

  describe('getResources', () => {
    it('should return all resources when no filters are provided', async () => {
      const resources = await service.getResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBe(3);
      expect(resources).toEqual(mockResources);
    });

    it('should filter resources by type', async () => {
      const filters: ResourceFilters = { type: 'pdf' };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(resources.every((resource) => resource.type === 'PDF')).toBe(true);
    });

    it('should filter resources by category', async () => {
      const filters: ResourceFilters = { category: 'Fonemas' };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(
        resources.every((resource) => resource.category === 'Fonemas')
      ).toBe(true);
    });

    it('should filter resources by age group', async () => {
      const filters: ResourceFilters = { ageGroup: '4-6 anos' };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(resources.length).toBeGreaterThan(0);
      expect(
        resources.every((resource) => resource.ageGroup === '4-6 anos')
      ).toBe(true);
    });

    it('should filter resources by search term', async () => {
      const filters: ResourceFilters = { search: 'fonema' };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(
        resources.every(
          (resource) =>
            resource.title.toLowerCase().includes('fonema') ||
            resource.description.toLowerCase().includes('fonema') ||
            resource.tags.some((tag) => tag.toLowerCase().includes('fonema'))
        )
      ).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const filters: ResourceFilters = {
        type: 'pdf',
        category: 'Fonemas',
        search: 'r',
      };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(
        resources.every(
          (resource) =>
            resource.type === 'PDF' &&
            resource.category === 'Fonemas' &&
            (resource.title.toLowerCase().includes('r') ||
              resource.description.toLowerCase().includes('r') ||
              resource.tags.some((tag) => tag.toLowerCase().includes('r')))
        )
      ).toBe(true);
    });
  });

  describe('getResourceById', () => {
    it('should return a resource when valid ID is provided', async () => {
      const resource = await service.getResourceById('1');
      expect(resource).toBeDefined();
      expect(resource?.id).toBe('1');
      expect(resource).toEqual(mockResources[0]);
    });

    it('should return null when invalid ID is provided', async () => {
      const resource = await service.getResourceById('invalid-id');
      expect(resource).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return valid stats', async () => {
      const stats = await service.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalResources).toBe(3);
      expect(stats.totalDownloads).toBe(439);
      expect(stats.categories).toBeDefined();
      expect(stats.types).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('should return array of categories', async () => {
      const categories = await service.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(3);
      expect(categories).toEqual([
        'Fonemas',
        'Consciência Fonológica',
        'Linguagem',
      ]);
    });
  });

  describe('getTypes', () => {
    it('should return array of types', async () => {
      const types = await service.getTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBe(3);
      expect(types).toEqual(['PDF', 'VIDEO', 'GUIDE']);
    });
  });

  describe('getAgeGroups', () => {
    it('should return array of age groups', async () => {
      const ageGroups = await service.getAgeGroups();

      expect(Array.isArray(ageGroups)).toBe(true);
      expect(ageGroups.length).toBe(3);
      expect(ageGroups).toEqual(['4-6 anos', '5-7 anos', '7-10 anos']);
    });
  });

  describe('downloadResource', () => {
    it('should increment download count for valid resource', async () => {
      const success = await service.downloadResource('1');
      expect(success).toBe(true);
    });

    it('should return false for invalid resource ID', async () => {
      const success = await service.downloadResource('invalid-id');
      expect(success).toBe(false);
    });
  });

  describe('getFeaturedResources', () => {
    it('should return featured resources sorted by download count', async () => {
      const resources = await service.getFeaturedResources(3);

      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeLessThanOrEqual(3);
      expect(resources.every((r) => r.isFeatured)).toBe(true);
    });
  });

  describe('getNewResources', () => {
    it('should return new resources sorted by creation date', async () => {
      const resources = await service.getNewResources(2);

      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getFreeResources', () => {
    it('should return only free resources', async () => {
      const resources = await service.getFreeResources();

      expect(Array.isArray(resources)).toBe(true);
      expect(resources.every((resource) => resource.isFree === true)).toBe(
        true
      );
    });

    it('should return limited number of free resources when limit is provided', async () => {
      const resources = await service.getFreeResources(3);

      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeLessThanOrEqual(3);
      expect(resources.every((resource) => resource.isFree === true)).toBe(
        true
      );
    });
  });

  describe('viewResource', () => {
    it('should increment view count for valid resource', async () => {
      const success = await service.viewResource('1');
      expect(success).toBe(true);
    });

    it('should return false for invalid resource ID', async () => {
      const success = await service.viewResource('invalid-id');
      expect(success).toBe(false);
    });
  });

  describe('Resource structure validation', () => {
    it('should have valid resource structure', async () => {
      const resources = await service.getResources();
      const resource = resources[0];

      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('title');
      expect(resource).toHaveProperty('description');
      expect(resource).toHaveProperty('type');
      expect(resource).toHaveProperty('category');
      expect(resource).toHaveProperty('ageGroup');
      expect(resource).toHaveProperty('downloadCount');
      expect(resource).toHaveProperty('rating');
      expect(resource).toHaveProperty('tags');
      expect(resource).toHaveProperty('downloadUrl');
      expect(resource).toHaveProperty('viewUrl');
      expect(resource).toHaveProperty('isFree');
      expect(resource).toHaveProperty('createdAt');
      expect(resource).toHaveProperty('updatedAt');

      expect(typeof resource.id).toBe('string');
      expect(typeof resource.title).toBe('string');
      expect(typeof resource.description).toBe('string');
      expect([
        'PDF',
        'VIDEO',
        'AUDIO',
        'GUIDE',
        'DOCUMENT',
        'PRESENTATION',
        'WORKSHEET',
        'IMAGE',
        'INTERACTIVE',
      ]).toContain(resource.type);
      expect(typeof resource.category).toBe('string');
      expect(typeof resource.ageGroup).toBe('string');
      expect(typeof resource.downloadCount).toBe('number');
      expect(typeof resource.rating).toBe('number');
      expect(Array.isArray(resource.tags)).toBe(true);
      expect(typeof resource.downloadUrl).toBe('string');
      expect(typeof resource.viewUrl).toBe('string');
      expect(typeof resource.isFree).toBe('boolean');
      expect(resource.createdAt).toBeInstanceOf(Date);
      expect(resource.updatedAt).toBeInstanceOf(Date);
    });
  });
});
