export interface Resource {
  id: string;
  title: string;
  description: string;
  type:
    | 'PDF'
    | 'VIDEO'
    | 'AUDIO'
    | 'GUIDE'
    | 'DOCUMENT'
    | 'PRESENTATION'
    | 'WORKSHEET'
    | 'IMAGE'
    | 'INTERACTIVE';
  category: string;
  ageGroup: string;
  duration?: string; // for videos/audio
  fileSize?: string;
  downloadCount: number;
  viewCount: number;
  slug: string;
  rating: number;
  tags: string[];
  downloadUrl: string;
  viewUrl: string; // URL to view resource within the app
  thumbnailUrl?: string;
  isFree: boolean; // Whether this is a free resource
  isPublished: boolean; // Whether this resource is published
  isFeatured: boolean;
  content?: string; // Rich text content for the resource
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    fullName: string;
  };
}

export interface ResourceFilters {
  type?: string;
  category?: string;
  ageGroup?: string;
  search?: string;
}

export interface ResourceStats {
  totalResources: number;
  totalDownloads: number;
  categories: { [key: string]: number };
  types: { [key: string]: number };
}

export class ResourcesService {
  private static instance: ResourcesService;
  private baseUrl = '/api/resources';

  private constructor() {}

  public static getInstance(): ResourcesService {
    if (!ResourcesService.instance) {
      ResourcesService.instance = new ResourcesService();
    }
    return ResourcesService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  public async getResources(filters?: ResourceFilters): Promise<Resource[]> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.ageGroup) params.append('ageGroup', filters.ageGroup);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    return this.makeRequest<Resource[]>(endpoint);
  }

  public async getResourceById(id: string): Promise<Resource | null> {
    try {
      return await this.makeRequest<Resource>(`/${id}`);
    } catch (error) {
      console.error('Error fetching resource:', error);
      return null;
    }
  }

  public async getStats(): Promise<ResourceStats> {
    const stats = await this.makeRequest<any>('/stats');
    return {
      totalResources: stats.totalResources,
      totalDownloads: stats.totalDownloads,
      categories: stats.categories,
      types: stats.types,
    };
  }

  public async getCategories(): Promise<string[]> {
    const stats = await this.getStats();
    return Object.keys(stats.categories);
  }

  public async getTypes(): Promise<string[]> {
    const stats = await this.getStats();
    return Object.keys(stats.types);
  }

  public async getAgeGroups(): Promise<string[]> {
    const resources = await this.getResources();
    const ageGroups = [
      ...new Set(resources.map((resource) => resource.ageGroup)),
    ];
    return ageGroups.sort();
  }

  public async viewResource(id: string): Promise<boolean> {
    try {
      await this.makeRequest(`/${id}/view`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error('Error recording view:', error);
      return false;
    }
  }

  public async downloadResource(id: string): Promise<boolean> {
    try {
      // First record the download
      await this.makeRequest(`/${id}/download`, {
        method: 'POST',
      });

      // Then trigger the actual file download
      const response = await fetch(`${this.baseUrl}/${id}/file`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `resource-${id}.pdf`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading resource:', error);
      return false;
    }
  }

  public async getFeaturedResources(limit: number = 3): Promise<Resource[]> {
    const params = new URLSearchParams();
    params.append('isFeatured', 'true');
    params.append('limit', limit.toString());

    return this.makeRequest<Resource[]>(`?${params.toString()}`);
  }

  public async getNewResources(limit: number = 2): Promise<Resource[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    return this.makeRequest<Resource[]>(`?${params.toString()}`);
  }

  public async getFreeResources(limit?: number): Promise<Resource[]> {
    const params = new URLSearchParams();
    params.append('isFree', 'true');
    if (limit) {
      params.append('limit', limit.toString());
    }

    return this.makeRequest<Resource[]>(`?${params.toString()}`);
  }

  public async getFreeResourcesWithStats(): Promise<{
    resources: Resource[];
    stats: {
      totalResources: number;
      totalDownloads: number;
      averageRating: number;
    };
  }> {
    return this.makeRequest<{
      resources: Resource[];
      stats: {
        totalResources: number;
        totalDownloads: number;
        averageRating: number;
      };
    }>('/free');
  }

  public async rateResource(
    id: string,
    rating: number,
    comment?: string
  ): Promise<boolean> {
    try {
      await this.makeRequest(`/${id}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      return true;
    } catch (error) {
      console.error('Error rating resource:', error);
      return false;
    }
  }

  public async getResourceRatings(id: string): Promise<any> {
    try {
      return await this.makeRequest(`/${id}/rate`);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      return null;
    }
  }
}

// Export singleton instance
export const resourcesService = ResourcesService.getInstance();
