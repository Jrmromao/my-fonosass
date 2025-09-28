import { ResourceFilters, ResourcesService } from '@/services/resourcesService';

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(() => {
    // Get a fresh instance for each test
    service = ResourcesService.getInstance();
  });

  describe('getResources', () => {
    it('should return all resources when no filters are provided', async () => {
      const resources = await service.getResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources)).toBe(true);
      expect(resources.length).toBeGreaterThan(0);
    });

    it('should filter resources by type', async () => {
      const filters: ResourceFilters = { type: 'pdf' };
      const resources = await service.getResources(filters);

      expect(resources).toBeDefined();
      expect(resources.every((resource) => resource.type === 'pdf')).toBe(true);
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
      expect(
        resources.every(
          (resource) =>
            resource.ageGroup === '4-6 anos' ||
            resource.ageGroup === 'Todas as idades'
        )
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
            resource.type === 'pdf' &&
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
      const resources = await service.getResources();
      const firstResource = resources[0];

      const resource = await service.getResourceById(firstResource.id);
      expect(resource).toBeDefined();
      expect(resource?.id).toBe(firstResource.id);
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
      expect(stats.totalResources).toBeGreaterThan(0);
      expect(stats.totalDownloads).toBeGreaterThan(0);
      expect(stats.categories).toBeDefined();
      expect(stats.types).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('should return array of categories', async () => {
      const categories = await service.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe('getTypes', () => {
    it('should return array of types', async () => {
      const types = await service.getTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });
  });

  describe('getAgeGroups', () => {
    it('should return array of age groups', async () => {
      const ageGroups = await service.getAgeGroups();

      expect(Array.isArray(ageGroups)).toBe(true);
      expect(ageGroups.length).toBeGreaterThan(0);
    });
  });

  describe('downloadResource', () => {
    it('should increment download count for valid resource', async () => {
      const resources = await service.getResources();
      const firstResource = resources[0];
      const initialDownloadCount = firstResource.downloadCount;

      const success = await service.downloadResource(firstResource.id);
      expect(success).toBe(true);

      // Verify download count increased
      const updatedResource = await service.getResourceById(firstResource.id);
      expect(updatedResource?.downloadCount).toBe(initialDownloadCount + 1);
    });

    it('should return false for invalid resource ID', async () => {
      const success = await service.downloadResource('invalid-id');
      expect(success).toBe(false);
    });
  });

  describe('getFeaturedResources', () => {
    it('should return featured resources sorted by download count', async () => {
      const featuredResources = await service.getFeaturedResources(3);

      expect(Array.isArray(featuredResources)).toBe(true);
      expect(featuredResources.length).toBeLessThanOrEqual(3);

      // Verify they are sorted by download count (descending)
      for (let i = 1; i < featuredResources.length; i++) {
        expect(featuredResources[i - 1].downloadCount).toBeGreaterThanOrEqual(
          featuredResources[i].downloadCount
        );
      }
    });
  });

  describe('getNewResources', () => {
    it('should return new resources sorted by creation date', async () => {
      const newResources = await service.getNewResources(2);

      expect(Array.isArray(newResources)).toBe(true);
      expect(newResources.length).toBeLessThanOrEqual(2);

      // Verify they are sorted by creation date (newest first)
      for (let i = 1; i < newResources.length; i++) {
        expect(newResources[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          newResources[i].createdAt.getTime()
        );
      }
    });
  });

  describe('getFreeResources', () => {
    it('should return only free resources', async () => {
      const freeResources = await service.getFreeResources();

      expect(Array.isArray(freeResources)).toBe(true);
      expect(freeResources.every((resource) => resource.isFree === true)).toBe(
        true
      );
    });

    it('should return limited number of free resources when limit is provided', async () => {
      const freeResources = await service.getFreeResources(3);

      expect(Array.isArray(freeResources)).toBe(true);
      expect(freeResources.length).toBeLessThanOrEqual(3);
      expect(freeResources.every((resource) => resource.isFree === true)).toBe(
        true
      );
    });
  });

  describe('viewResource', () => {
    it('should increment view count for valid resource', async () => {
      const resources = await service.getResources();
      const firstResource = resources[0];
      const initialViewCount = firstResource.downloadCount;

      const success = await service.viewResource(firstResource.id);
      expect(success).toBe(true);

      // Verify view count increased
      const updatedResource = await service.getResourceById(firstResource.id);
      expect(updatedResource?.downloadCount).toBe(initialViewCount + 1);
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
      expect(['pdf', 'video', 'audio', 'guide']).toContain(resource.type);
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
