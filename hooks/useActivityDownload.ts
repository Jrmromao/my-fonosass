'use client';

import type { DownloadResponse } from '@/lib/activityLibrary';
import { useEffect, useState } from 'react';

/**
 * Downloads an activity file through POST /api/files/[id]/download.
 * `onRequiresSubscription` runs when the server answers 403 for a free user.
 */
export function useActivityDownload(onRequiresSubscription: () => void) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Name of the last file that started downloading, for a short confirmation.
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  useEffect(() => {
    if (!lastDownloaded) return;
    const t = window.setTimeout(() => setLastDownloaded(null), 4000);
    return () => window.clearTimeout(t);
  }, [lastDownloaded]);

  /** `name` is the saved file name; `title` is what the confirmation shows. */
  const download = async (fileId: string, name: string, title = name) => {
    setDownloadingId(fileId);
    setError(null);
    setLastDownloaded(null);
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
        setLastDownloaded(title);
      } else if (res.status === 403 && json.requiresSubscription) {
        onRequiresSubscription();
      } else if (res.status === 401) {
        setError('Sua sessão expirou. Entre novamente para baixar.');
      } else {
        setError(json.error || 'Não foi possível baixar. Tente de novo.');
      }
    } catch {
      setError('Não foi possível baixar. Tente de novo.');
    } finally {
      setDownloadingId(null);
    }
  };

  return { download, downloadingId, error, lastDownloaded };
}
