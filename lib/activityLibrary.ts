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
  /**
   * WebP preview (page 1) for any signed-in user, or null when the activity
   * has no PDF or image file. Served by /api/activities/[id]/preview;
   * append ?w=960 for the larger size.
   */
  previewUrl: string | null;
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

/** GET /api/library/counts: published activities per phoneme and type. */
export interface LibraryCountsResponse {
  success: boolean;
  data?: {
    total: number;
    phonemes: Record<string, number>;
    types: Record<string, number>;
  };
  error?: string;
}

export interface DownloadResponse {
  success: boolean;
  error?: string;
  requiresSubscription?: boolean;
  data?: { url: string; fileName: string };
}
