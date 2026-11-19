'use client';

import { UpgradeDialog } from '@/components/dashboard/UpgradeDialog';
import {
  PrintableInstructions,
  printInstructions,
} from '@/components/library/PrintableInstructions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TONES, type ToneClasses } from '@/components/library/tones';
import { useActivityDownload } from '@/hooks/useActivityDownload';
import { label, subjectLabel } from '@/lib/activityLabels';
import type { LibraryActivity, LibraryResponse } from '@/lib/activityLibrary';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Download, Eye, FileText, Lock, Printer } from 'lucide-react';
import { useState } from 'react';

// Activities of one library topic (or a search): a grid of thumbnails and
// "Mostrar mais". Clicking a thumbnail
// downloads the activity (or opens the plans for free users); the eye button
// opens the details with a larger preview and "Imprimir instruções".

const PAGE_SIZE = 24;

export interface ActivityBrowserProps {
  /** Sent to /api/activities/search, e.g. { phoneme: 'S' } or { search }. */
  filter: Record<string, string>;
  /** Shown when there are no results. */
  emptyText: string;
  /** Show the topic under each name (useful in search results). */
  showSubject?: boolean;
  /** Group color of the topic: frames the thumbnails. Default: sky. */
  tone?: ToneClasses;
}

export function ActivityBrowser({
  filter,
  emptyText,
  showSubject = false,
  tone = TONES.sky,
}: ActivityBrowserProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [details, setDetails] = useState<LibraryActivity | null>(null);
  const { download, downloadAll, downloadingId, error, lastDownloaded } =
    useActivityDownload(() => {
      setDetails(null);
      setUpgradeOpen(true);
    });

  const query = filter;
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<LibraryResponse>({
    queryKey: ['activities', 'browse', query],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_SIZE),
      });
      Object.entries(query).forEach(([k, v]) => v && params.set(k, v));
      const res = await fetch(`/api/activities/search?${params}`);
      if (!res.ok) throw new Error('Falha ao carregar atividades');
      return res.json();
    },
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  });

  const first = data?.pages[0];
  const activities = data?.pages.flatMap((p) => p.data) ?? [];
  const total = first?.pagination.total ?? 0;
  const showFreeBadge = first?.viewer?.canDownloadAll === false;

  const start = (activity: LibraryActivity) => {
    const pages = activity.files;
    if (pages.length === 0) return;
    if (!activity.canDownload) {
      setDetails(null);
      setUpgradeOpen(true);
      return;
    }
    if (pages.length === 1) {
      download(
        pages[0].id,
        `${activity.name}.${extensionFor(pages[0].fileType)}`,
        activity.name
      );
      return;
    }
    // Several pages: "Nome - página 1.pdf", "Nome - página 2.png"...
    downloadAll(
      pages.map((p, i) => ({
        id: p.id,
        name: `${activity.name} - página ${i + 1}.${extensionFor(p.fileType)}`,
      })),
      activity.name
    );
  };

  return (
    <>
      {!isLoading && !isError && (
        <p className="mb-4 text-sm text-neutral-600" aria-live="polite">
          {total} {total === 1 ? 'atividade' : 'atividades'}
        </p>
      )}

      {lastDownloaded && (
        <p
          role="status"
          className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-900"
        >
          &ldquo;{lastDownloaded}&rdquo; baixada. Confira a pasta de downloads.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <Grid>
          {Array.from({ length: 10 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[3/4] w-full" />
            </li>
          ))}
        </Grid>
      ) : isError ? (
        <div className="py-16 text-center text-sm text-neutral-600">
          <p>Não foi possível carregar as atividades.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
          >
            Tentar de novo
          </Button>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-16 text-center text-sm text-neutral-600">
          <p>{emptyText}</p>
        </div>
      ) : (
        <Grid>
          {activities.map((activity) => (
            <li key={activity.id}>
              <ActivityThumb
                activity={activity}
                showFreeBadge={showFreeBadge}
                showSubject={showSubject}
                tone={tone}
                downloading={downloadingId === activity.files[0]?.id}
                onDownload={() => start(activity)}
                onDetails={() => setDetails(activity)}
              />
            </li>
          ))}
        </Grid>
      )}

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Carregando…' : 'Mostrar mais'}
          </Button>
        </div>
      )}

      <Dialog open={!!details} onOpenChange={() => setDetails(null)}>
        {/* Header and actions stay put; only the middle scrolls. */}
        <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
          {details && (
            <>
              <DialogHeader className="shrink-0 border-b border-neutral-200 px-6 py-4 pr-12">
                <DialogTitle className="text-base font-semibold">
                  {details.name}
                </DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <DetailsPages key={details.id} activity={details} />
                <p className="text-sm text-neutral-600">
                  {subjectLabel(details.phoneme, details.type)}
                </p>
                {details.description.trim() && (
                  <p className="whitespace-pre-line text-sm text-neutral-600">
                    {details.description}
                  </p>
                )}
              </div>
              {(details.files[0] || details.description.trim()) && (
                <div className="flex shrink-0 flex-col gap-2 border-t border-neutral-200 bg-white px-6 py-4 sm:flex-row">
                  {details.files[0] &&
                    (details.canDownload ? (
                      <Button
                        className="h-10 flex-1 bg-neutral-900 text-sm text-white hover:bg-neutral-800"
                        onClick={() => start(details)}
                        disabled={downloadingId === details.files[0].id}
                      >
                        <Download className="mr-2 h-4 w-4" aria-hidden />
                        {downloadingId === details.files[0].id
                          ? 'Baixando…'
                          : details.files.length > 1
                            ? `Baixar ${details.files.length} páginas`
                            : 'Baixar'}
                      </Button>
                    ) : (
                      <Button
                        className="h-10 flex-1 bg-coral-700 text-sm text-white hover:bg-coral-800"
                        onClick={() => start(details)}
                      >
                        <Lock className="mr-2 h-4 w-4" aria-hidden />
                        Assinar para baixar
                      </Button>
                    ))}
                  {details.description.trim() && (
                    <Button
                      variant="outline"
                      className="h-10 flex-1 border-neutral-300 text-sm font-semibold"
                      onClick={printInstructions}
                    >
                      <Printer className="mr-2 h-4 w-4" aria-hidden />
                      Imprimir instruções
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {details && <PrintableInstructions activity={details} />}

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </ul>
  );
}

const PREVIEWABLE = (fileType: string) =>
  fileType === 'application/pdf' || fileType.startsWith('image/');

/** File extension for a saved download, from its MIME type. */
function extensionFor(fileType: string): string {
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType === 'image/png') return 'png';
  if (fileType === 'image/jpeg') return 'jpg';
  if (fileType === 'image/webp') return 'webp';
  return 'pdf';
}

/**
 * Details preview. One page: the large preview, as before. Several pages:
 * the selected page large, and a strip of page thumbnails to switch.
 */
function DetailsPages({ activity }: { activity: LibraryActivity }) {
  const pages = activity.files;
  const [selected, setSelected] = useState(0);
  const current = pages[Math.min(selected, pages.length - 1)];

  if (pages.length <= 1) {
    return <Preview activity={activity} large className="rounded border" />;
  }

  return (
    <div className="space-y-3">
      <Preview
        activity={activity}
        fileId={
          current && PREVIEWABLE(current.fileType) ? current.id : undefined
        }
        large
        className="rounded border"
      />
      <p className="text-xs text-neutral-600" aria-live="polite">
        Página {selected + 1} de {pages.length}
      </p>
      <ul
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Páginas da atividade"
      >
        {pages.map((page, i) => (
          <li key={page.id} className="w-16 shrink-0">
            <button
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Ver página ${i + 1}`}
              aria-current={i === selected ? 'true' : undefined}
              className={`block w-full overflow-hidden rounded border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950 ${
                i === selected
                  ? 'border-violet-950'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              {PREVIEWABLE(page.fileType) ? (
                <Preview
                  activity={activity}
                  fileId={page.id}
                  className="aspect-[3/4]"
                />
              ) : (
                <span className="flex aspect-[3/4] items-center justify-center bg-neutral-50 text-xs text-neutral-500">
                  {i + 1}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Thumbnail, or a placeholder for activities without an image (PDF only). */
function Preview({
  activity,
  fileId,
  large = false,
  className = '',
}: {
  activity: LibraryActivity;
  /** One page (file) of the activity. Default: the activity's cover. */
  fileId?: string;
  /** Details dialog size (960 px) instead of the card thumbnail (480 px). */
  large?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const params = new URLSearchParams();
  if (large) params.set('w', '960');
  if (fileId) params.set('file', fileId);
  const qs = params.toString();
  const src = activity.previewUrl
    ? `${activity.previewUrl}${qs ? `?${qs}` : ''}`
    : null;
  if (src && failedSrc !== src) {
    return (
      // Plain <img>: the API already serves a small, resized WebP.
      <img
        src={src}
        alt={`Prévia de ${activity.name}`}
        loading="lazy"
        onError={() => setFailedSrc(src)}
        className={`w-full bg-white object-contain ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 bg-neutral-50 px-3 text-center ${className}`}
    >
      <FileText className="h-8 w-8 text-neutral-400" aria-hidden />
      <span className="text-xs text-neutral-500">Prévia indisponível</span>
    </div>
  );
}

function ActivityThumb({
  activity,
  showFreeBadge,
  showSubject,
  tone,
  downloading,
  onDownload,
  onDetails,
}: {
  activity: LibraryActivity;
  showFreeBadge: boolean;
  showSubject: boolean;
  tone: ToneClasses;
  downloading: boolean;
  onDownload: () => void;
  onDetails: () => void;
}) {
  const hasFile = activity.files.length > 0;

  return (
    <article className="group relative flex h-full flex-col">
      <button
        type="button"
        onClick={onDownload}
        disabled={!hasFile || downloading}
        aria-label={
          activity.canDownload
            ? `Baixar ${activity.name}`
            : `${activity.name}: assine para baixar`
        }
        className="flex flex-1 flex-col rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950 disabled:cursor-wait"
      >
        <div
          className={`relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl ring-2 transition-transform group-hover:-translate-y-1 motion-reduce:transition-none ${tone.tile}`}
        >
          <Preview activity={activity} className="h-full" />
          {!activity.canDownload && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-violet-950 shadow-sm">
              <Lock className="h-3 w-3" aria-hidden />
              Assinantes
            </span>
          )}
          {activity.isFreeSample && showFreeBadge && (
            <span className="absolute left-2 top-2 rounded-full bg-coral-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Grátis
            </span>
          )}
          {activity.canDownload && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-violet-950 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Download className="h-3.5 w-3.5" aria-hidden />
              {downloading ? 'Baixando…' : 'Baixar'}
            </span>
          )}
        </div>
        <span className="flex flex-col gap-0.5 px-1 pt-2">
          <span className="text-sm font-bold text-violet-950">
            {activity.name}
          </span>
          {showSubject && (
            <span className="text-xs text-neutral-600">
              {subjectLabel(activity.phoneme, activity.type)}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={onDetails}
        aria-label={`Ver detalhes de ${activity.name}`}
        title="Ver detalhes"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-sm transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
      >
        <Eye className="h-4 w-4" aria-hidden />
      </button>
    </article>
  );
}
