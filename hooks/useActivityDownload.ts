'use client';

import type { DownloadResponse } from '@/lib/activityLibrary';
import { useEffect, useState } from 'react';

// Browsers drop downloads started in the same tick; wait between pages.
const PAGE_DOWNLOAD_GAP_MS = 400;

/**
 * Downloads activity files through POST /api/files/[id]/download.
 * `onRequiresSubscription` runs when the server answers 403 for a free user.
 */
export function useActivityDownload(onRequiresSubscription: () => void) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Name of the last activity that started downloading, for a short confirmation.
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  useEffect(() => {
    if (!lastDownloaded) return;
    const t = window.setTimeout(() => setLastDownloaded(null), 4000);
    return () => window.clearTimeout(t);
  }, [lastDownloaded]);

  /** Starts one browser download. Returns false (and sets the error) on failure. */
  const save = async (fileId: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `/api/files/${encodeURIComponent(fileId)}/download`,
        { method: 'POST' }
      );
      const json: DownloadResponse = await res.json().catch(() => ({
        success: false,
      }));
      if (res.ok && json.success && json.data?.url) {
        const a = document.createElement('a');
        a.href = json.data.url;
        a.download = name;
        a.click();
        return true;
      }
      if (res.status === 403 && json.requiresSubscription) {
        onRequiresSubscription();
      } else if (res.status === 401) {
        setError('Sua sessão expirou. Entre novamente para baixar.');
      } else {
        setError(json.error || 'Não foi possível baixar. Tente de novo.');
      }
    } catch {
      setError('Não foi possível baixar. Tente de novo.');
    }
    return false;
  };

  /** `name` is the saved file name; `title` is what the confirmation shows. */
  const download = async (fileId: string, name: string, title = name) => {
    setDownloadingId(fileId);
    setError(null);
    setLastDownloaded(null);
    try {
      if (await save(fileId, name)) setLastDownloaded(title);
    } finally {
      setDownloadingId(null);
    }
  };

  /**
   * Downloads every page of an activity in order. While it runs,
   * `downloadingId` is the first page's id. Stops at the first failure.
   */
  const downloadAll = async (
    pages: { id: string; name: string }[],
    title: string
  ) => {
    if (pages.length === 0) return;
    setDownloadingId(pages[0].id);
    setError(null);
    setLastDownloaded(null);
    try {
      for (const [i, page] of pages.entries()) {
        if (i > 0) {
          await new Promise((r) => setTimeout(r, PAGE_DOWNLOAD_GAP_MS));
        }
        if (!(await save(page.id, page.name))) return;
      }
      setLastDownloaded(title);
    } finally {
      setDownloadingId(null);
    }
  };

  return { download, downloadAll, downloadingId, error, lastDownloaded };
}
