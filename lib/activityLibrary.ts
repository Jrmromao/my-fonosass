// Types for GET /api/activities/search, shared by the library UI.
// Client-safe (no Prisma import).

export interface LibraryActivity {
  id: string;
  name: string;
  description: string;
  phoneme: string;
  type: string;
  createdAt: string;
  files: { id: string; fileType: string }[];
  /** Signed URL; null unless the viewer may download this activity. */
  thumbnailUrl: string | null;
  isFreeSample: boolean;
  canDownload: boolean;
}

export interface LibraryResponse {
  success: boolean;
  data: LibraryActivity[];
  viewer: { canDownloadAll: boolean };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    phonemes: string[];
    types: string[];
  };
}

export interface DownloadResponse {
  success: boolean;
  error?: string;
  requiresSubscription?: boolean;
  data?: { url: string; fileName: string };
}
