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
import { useActivityDownload } from '@/hooks/useActivityDownload';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  label,
  subjectLabel,
} from '@/lib/activityLabels';
import type { LibraryActivity, LibraryResponse } from '@/lib/activityLibrary';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Download, Eye, FileText, Lock, Printer } from 'lucide-react';
import { useState } from 'react';

// Activities of one library topic (or a search): optional age / difficulty
// chips, a grid of thumbnails and "Mostrar mais". Clicking a thumbnail
// downloads the activity (or opens the plans for free users); the eye button
// opens the details with a larger preview and "Imprimir instruções".

const PAGE_SIZE = 24;
/** Below this many activities the age / difficulty chips are not shown. */
const CHIPS_FROM = 12;

export interface ActivityBrowserProps {
  /** Sent to /api/activities/search, e.g. { phoneme: 'S' } or { search }. */
  filter: Record<string, string>;
  /** Shown when there are no results. */
  emptyText: string;
  /** Show the topic under each name (useful in search results). */
  showSubject?: boolean;
}

export function ActivityBrowser({
  filter,
  emptyText,
  showSubject = false,
}: ActivityBrowserProps) {
  const [ageRange, setAgeRange] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [details, setDetails] = useState<LibraryActivity | null>(null);
  const { download, downloadingId, error, lastDownloaded } =
    useActivityDownload(() => {
      setDetails(null);
      setUpgradeOpen(true);
    });

  const query = { ...filter, ageRange, difficulty };
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
  const filtering = !!ageRange || !!difficulty;
  const showChips = filtering || total > CHIPS_FROM;

  const start = (activity: LibraryActivity) => {
    const file = activity.files[0];
    if (!file) return;
    if (!activity.canDownload) {
      setDetails(null);
      setUpgradeOpen(true);
      return;
    }
    download(file.id, `${activity.name}.pdf`, activity.name);
  };

  return (
    <>
      {!isLoading && !isError && (
        <p className="mb-4 text-sm text-neutral-600" aria-live="polite">
          {total} {total === 1 ? 'atividade' : 'atividades'}
          {filtering && ' com os filtros escolhidos'}
        </p>
      )}

      {showChips && first && (
        <div className="mb-5 space-y-2">
          <ChipRow
            label="Idade"
            options={first.filters.ageRanges}
            labels={AGE_LABELS}
            value={ageRange}
            onChange={setAgeRange}
          />
          <ChipRow
            label="Dificuldade"
            options={first.filters.difficulties}
            labels={DIFFICULTY_LABELS}
            value={difficulty}
            onChange={setDifficulty}
          />
        </div>
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
          <p>
            {filtering ? 'Nenhuma atividade com esses filtros.' : emptyText}
          </p>
          {filtering && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setAgeRange('');
                setDifficulty('');
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <Grid>
          {activities.map((activity) => (
            <li key={activity.id}>
              <ActivityThumb
                activity={activity}
                showFreeBadge={showFreeBadge}
                showSubject={showSubject}
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
                <Preview activity={details} large className="rounded border" />
                <p className="text-sm text-neutral-600">
                  {[
                    subjectLabel(details.phoneme, details.type),
                    label(AGE_LABELS, details.ageRange),
                    label(DIFFICULTY_LABELS, details.difficulty),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
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

function ChipRow({
  label: rowLabel,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  labels: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
}) {
  if (options.length < 2) return null;
  const chip = (active: boolean) =>
    `h-8 rounded-full border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 ${
      active
        ? 'border-sun-500 bg-sun-300 font-semibold text-violet-950'
        : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900'
    }`;
  return (
    <div
      role="group"
      aria-label={`Filtrar por ${rowLabel.toLowerCase()}`}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="w-24 text-sm font-semibold text-neutral-700">
        {rowLabel}
      </span>
      <button
        type="button"
        aria-pressed={!value}
        className={chip(!value)}
        onClick={() => onChange('')}
      >
        Todas
      </button>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          className={chip(value === o)}
          onClick={() => onChange(value === o ? '' : o)}
        >
          {label(labels, o)}
        </button>
      ))}
    </div>
  );
}

/** Thumbnail, or a placeholder for activities without an image (PDF only). */
function Preview({
  activity,
  large = false,
  className = '',
}: {
  activity: LibraryActivity;
  /** Details dialog size (960 px) instead of the card thumbnail (480 px). */
  large?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (activity.previewUrl && !failed) {
    return (
      // Plain <img>: the API already serves a small, resized WebP.
      <img
        src={large ? `${activity.previewUrl}?w=960` : activity.previewUrl}
        alt={`Prévia de ${activity.name}`}
        loading="lazy"
        onError={() => setFailed(true)}
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
  downloading,
  onDownload,
  onDetails,
}: {
  activity: LibraryActivity;
  showFreeBadge: boolean;
  showSubject: boolean;
  downloading: boolean;
  onDownload: () => void;
  onDetails: () => void;
}) {
  const hasFile = activity.files.length > 0;
  const meta = [
    showSubject ? subjectLabel(activity.phoneme, activity.type) : '',
    label(AGE_LABELS, activity.ageRange),
    label(DIFFICULTY_LABELS, activity.difficulty),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-violet-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-violet-300">
      <button
        type="button"
        onClick={onDownload}
        disabled={!hasFile || downloading}
        aria-label={
          activity.canDownload
            ? `Baixar ${activity.name}`
            : `${activity.name}: assine para baixar`
        }
        className="flex flex-1 flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-wait"
      >
        <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden border-b border-neutral-100 bg-neutral-50">
          <Preview activity={activity} className="h-full" />
          {!activity.canDownload && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-sm bg-white/95 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-800 shadow-sm">
              <Lock className="h-3 w-3" aria-hidden />
              Assinantes
            </span>
          )}
          {activity.isFreeSample && showFreeBadge && (
            <span className="absolute left-2 top-2 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Grátis
            </span>
          )}
          {activity.canDownload && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-sm bg-neutral-900 px-2 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Download className="h-3.5 w-3.5" aria-hidden />
              {downloading ? 'Baixando…' : 'Baixar'}
            </span>
          )}
        </div>
        <span className="flex flex-col gap-0.5 p-3">
          <span className="text-sm font-semibold text-neutral-900">
            {activity.name}
          </span>
          <span className="text-xs text-neutral-600">{meta}</span>
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
