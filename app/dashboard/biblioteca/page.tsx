'use client';

import { UpgradeDialog } from '@/components/dashboard/UpgradeDialog';
import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
import ExampleWord from '@/components/landing/ExampleWord';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useUserRole } from '@/hooks/useUserRole';
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  TYPE_LABELS,
  label,
  phonemeLabel,
} from '@/lib/activityLabels';
import type {
  DownloadResponse,
  LibraryActivity,
  LibraryResponse,
} from '@/lib/activityLibrary';
import { PHONEME_GROUPS, exampleWordFor } from '@/lib/phonemes';
import { FREE_PHONEME } from '@/lib/pricing';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  Search,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

const ALL = 'all';

export default function LibraryPage() {
  const queryClient = useQueryClient();
  // UI hint only; createActivity is enforced as admin-only on the server.
  const { role } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const phoneme = searchParams.get('phoneme') || '';
  const type = searchParams.get('type') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const ageRange = searchParams.get('ageRange') || '';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewActivity, setPreviewActivity] =
    useState<LibraryActivity | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (!('page' in updates)) params.set('page', '1');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Push the debounced search to the URL (an effect, not render, so it never
  // updates the router while React is rendering).
  useEffect(() => {
    if (debouncedSearch !== search) updateParams({ search: debouncedSearch });
    // Only react to the debounced value; `search` and `updateParams` change
    // right after the push and would retrigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery<LibraryResponse>({
    queryKey: ['activities', page, search, phoneme, type, difficulty, ageRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');
      if (search) params.set('search', search);
      if (phoneme) params.set('phoneme', phoneme);
      if (type) params.set('type', type);
      if (difficulty) params.set('difficulty', difficulty);
      if (ageRange) params.set('ageRange', ageRange);
      const res = await fetch(`/api/activities/search?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao carregar atividades');
      return res.json();
    },
  });

  const activities = data?.data ?? [];
  // Unknown until loaded: avoid flashing the upsell banner for subscribers.
  const canDownloadAll = data?.viewer?.canDownloadAll;
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1 };
  const filters = data?.filters ?? {
    phonemes: [],
    types: [],
    difficulties: [],
    ageRanges: [],
  };

  // Phoneme options in the landing taxonomy order; codes the taxonomy does not
  // know (e.g. legacy "R") go in a final group so nothing disappears.
  const available = new Set(filters.phonemes);
  const known = new Set(
    PHONEME_GROUPS.flatMap((g) => g.entries.map((e) => e.code))
  );
  const phonemeOptions = PHONEME_GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    codes: g.entries.map((e) => e.code).filter((c) => available.has(c)),
  })).filter((g) => g.codes.length > 0);
  const otherCodes = filters.phonemes.filter((p) => !known.has(p));
  if (otherCodes.length > 0) {
    phonemeOptions.push({
      id: 'outros-codigos',
      title: 'Outros',
      codes: otherCodes,
    });
  }

  const handleDownload = async (fileId: string, name: string) => {
    setDownloadingId(fileId);
    setDownloadError(null);
    try {
      const res = await fetch(
        `/api/files/${encodeURIComponent(fileId)}/download`,
        {
          method: 'POST',
        }
      );
      const json: DownloadResponse = await res.json().catch(() => ({
        success: false,
      }));
      if (res.ok && json.success && json.data?.url) {
        const a = document.createElement('a');
        a.href = json.data.url;
        a.download = name;
        a.click();
      } else if (res.status === 403 && json.requiresSubscription) {
        setPreviewActivity(null);
        setUpgradeOpen(true);
      } else if (res.status === 401) {
        setDownloadError('Sua sessão expirou. Entre novamente para baixar.');
      } else {
        setDownloadError(
          json.error || 'Não foi possível baixar. Tente de novo.'
        );
      }
    } catch {
      setDownloadError('Não foi possível baixar. Tente de novo.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filterTrigger = 'h-9 text-sm border-border';

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 font-display">
              Biblioteca
            </h1>
            <p className="text-sm text-neutral-600 mt-0.5">
              {pagination.total}{' '}
              {pagination.total === 1 ? 'atividade' : 'atividades'}
            </p>
          </div>
          {role === 'ADMIN' && (
            <NewActivityDialog
              onSuccess={() =>
                queryClient.invalidateQueries({ queryKey: ['activities'] })
              }
            />
          )}
        </div>

        {canDownloadAll === false && (
          <div className="mx-6 mb-3 flex flex-col gap-2 rounded-md border border-coral-200 bg-coral-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-neutral-700">
              Você pode baixar grátis {FREE_SAMPLE_COUNT} atividades do{' '}
              {phonemeLabel(FREE_PHONEME)}. Assine para baixar toda a
              biblioteca.
            </p>
            <Button
              size="sm"
              className="h-8 shrink-0 bg-coral-700 hover:bg-coral-800 text-white text-xs font-semibold"
              onClick={() => setUpgradeOpen(true)}
            >
              Ver planos
            </Button>
          </div>
        )}

        {downloadError && (
          <p
            role="alert"
            className="mx-6 mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {downloadError}
          </p>
        )}

        {/* Filters */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600"
              aria-hidden
            />
            <Input
              placeholder="Buscar atividade"
              aria-label="Buscar atividade"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 pl-8 text-sm bg-background border-border"
            />
          </div>
          <Select
            value={phoneme || ALL}
            onValueChange={(v) => updateParams({ phoneme: v === ALL ? '' : v })}
          >
            <SelectTrigger
              className={`${filterTrigger} w-40`}
              aria-label="Filtrar por fonema"
            >
              <SelectValue placeholder="Fonema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os fonemas</SelectItem>
              {phonemeOptions.map((group) => (
                <SelectGroup key={group.id}>
                  <SelectLabel>{group.title}</SelectLabel>
                  {group.codes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {phonemeLabel(code)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={ageRange || ALL}
            onValueChange={(v) =>
              updateParams({ ageRange: v === ALL ? '' : v })
            }
          >
            <SelectTrigger
              className={`${filterTrigger} w-44`}
              aria-label="Filtrar por idade"
            >
              <SelectValue placeholder="Idade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as idades</SelectItem>
              {filters.ageRanges.map((a) => (
                <SelectItem key={a} value={a}>
                  {label(AGE_LABELS, a)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={type || ALL}
            onValueChange={(v) => updateParams({ type: v === ALL ? '' : v })}
          >
            <SelectTrigger
              className={`${filterTrigger} w-44`}
              aria-label="Filtrar por tipo"
            >
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os tipos</SelectItem>
              {filters.types.map((t) => (
                <SelectItem key={t} value={t}>
                  {label(TYPE_LABELS, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={difficulty || ALL}
            onValueChange={(v) =>
              updateParams({ difficulty: v === ALL ? '' : v })
            }
          >
            <SelectTrigger
              className={`${filterTrigger} w-44`}
              aria-label="Filtrar por dificuldade"
            >
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as dificuldades</SelectItem>
              {filters.difficulties.map((d) => (
                <SelectItem key={d} value={d}>
                  {label(DIFFICULTY_LABELS, d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards */}
      <div className="px-6 py-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-600">
              Nenhuma atividade encontrada.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activities.map((activity) => (
              <li key={activity.id}>
                <ActivityCard
                  activity={activity}
                  showFreeBadge={canDownloadAll === false}
                  downloading={downloadingId === activity.files[0]?.id}
                  onOpen={() => setPreviewActivity(activity)}
                  onDownload={() =>
                    handleDownload(activity.files[0].id, `${activity.name}.pdf`)
                  }
                  onUpgrade={() => setUpgradeOpen(true)}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
            <span className="text-sm text-neutral-600">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Próxima página"
                disabled={page >= pagination.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview dialog */}
      <Dialog
        open={!!previewActivity}
        onOpenChange={() => setPreviewActivity(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  {previewActivity.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {previewActivity.thumbnailUrl ? (
                  <img
                    src={previewActivity.thumbnailUrl}
                    alt={`Prévia de ${previewActivity.name}`}
                    className="w-full rounded border border-neutral-200"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-600">
                    <Lock className="mr-2 h-4 w-4" aria-hidden />
                    Prévia disponível para assinantes
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                  <span className="font-mono">
                    {phonemeLabel(previewActivity.phoneme)}
                  </span>
                  <span>{label(TYPE_LABELS, previewActivity.type)}</span>
                  <span>
                    {label(DIFFICULTY_LABELS, previewActivity.difficulty)}
                  </span>
                  <span>{label(AGE_LABELS, previewActivity.ageRange)}</span>
                </div>
                <p className="text-sm text-neutral-600">
                  {previewActivity.description}
                </p>
                {previewActivity.files[0] && !previewActivity.canDownload && (
                  <Button
                    className="w-full bg-coral-700 hover:bg-coral-800 text-white text-sm h-10"
                    onClick={() => {
                      setPreviewActivity(null);
                      setUpgradeOpen(true);
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" aria-hidden />
                    Assinar para baixar
                  </Button>
                )}
                {previewActivity.files[0] && previewActivity.canDownload && (
                  <Button
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-sm h-10"
                    onClick={() =>
                      handleDownload(
                        previewActivity.files[0].id,
                        `${previewActivity.name}.pdf`
                      )
                    }
                    disabled={downloadingId === previewActivity.files[0].id}
                  >
                    <Download className="h-4 w-4 mr-2" aria-hidden />
                    Baixar
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}

interface ActivityCardProps {
  activity: LibraryActivity;
  showFreeBadge: boolean;
  downloading: boolean;
  onOpen: () => void;
  onDownload: () => void;
  onUpgrade: () => void;
}

function ActivityCard({
  activity,
  showFreeBadge,
  downloading,
  onOpen,
  onDownload,
  onUpgrade,
}: ActivityCardProps) {
  const example = exampleWordFor(activity.phoneme);
  const hasFile = activity.files.length > 0;

  return (
    <article className="flex h-full flex-col rounded-md border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col text-left rounded-t-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900"
        aria-label={`Ver detalhes de ${activity.name}`}
      >
        <div className="flex h-24 items-center justify-center rounded-t-md bg-neutral-50 px-3">
          {example ? (
            <ExampleWord
              word={example}
              decorationClass="decoration-coral-500"
              className="font-display text-2xl font-bold text-neutral-900"
            />
          ) : (
            <span className="font-mono text-2xl font-bold text-neutral-900">
              {phonemeLabel(activity.phoneme)}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-neutral-900">
              {activity.name}
            </h2>
            {activity.isFreeSample && showFreeBadge && (
              <span className="shrink-0 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Grátis
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600">
            <span className="font-mono">{phonemeLabel(activity.phoneme)}</span>
            {' · '}
            {label(AGE_LABELS, activity.ageRange)}
          </p>
          <p className="text-sm text-neutral-600">
            {label(TYPE_LABELS, activity.type)}
            {' · '}
            {label(DIFFICULTY_LABELS, activity.difficulty)}
          </p>
        </div>
      </button>
      {hasFile && (
        <div className="border-t border-neutral-100 p-3">
          {activity.canDownload ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full border-neutral-300 text-sm font-semibold"
              onClick={onDownload}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" aria-hidden />
              {downloading ? 'Baixando...' : 'Baixar'}
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 w-full bg-coral-700 text-sm font-semibold text-white hover:bg-coral-800"
              onClick={onUpgrade}
            >
              <Lock className="mr-2 h-4 w-4" aria-hidden />
              Assinar para baixar
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
