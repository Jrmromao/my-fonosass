'use client';

import { UpgradeDialog } from '@/components/dashboard/UpgradeDialog';
import {
  ActivityCard,
  ActivityRow,
  type ActivityItemProps,
} from '@/components/library/ActivityItems';
import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
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
import { ACTIVITY_CATEGORIES } from '@/lib/activityCategories';
import {
  type LibraryFilters,
  libraryQuery,
  parseLibraryParams,
} from '@/lib/libraryUrl';
import { PHONEME_GROUPS } from '@/lib/phonemes';
import { FREE_PHONEME } from '@/lib/pricing';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Lock,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

const ALL = 'all';

type LibraryView = 'grade' | 'lista';
const VIEW_STORAGE_KEY = 'almanaque:library-view';

export default function LibraryPage() {
  const queryClient = useQueryClient();
  // UI hint only; createActivity is enforced as admin-only on the server.
  const { role } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is in pt-BR (?categoria=fonema&idade=pre-escolar…); filters
  // below are the internal codes the API expects. See lib/libraryUrl.ts.
  const { filters: current, legacy } = parseLibraryParams(
    new URLSearchParams(searchParams.toString())
  );
  const { page, search, phoneme, type, difficulty, ageRange } = current;

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewActivity, setPreviewActivity] =
    useState<LibraryActivity | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  // Name of an activity just created (admins): it goes to review, not here.
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Grid or list, remembered per browser. Read after mount so the server
  // render and the first client render match.
  const [view, setView] = useState<LibraryView>('grade');
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === 'lista' || saved === 'grade') setView(saved);
    } catch {
      /* storage blocked: keep the default */
    }
  }, []);
  const chooseView = (next: LibraryView) => {
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* storage blocked: the choice lasts for this page view */
    }
  };

  // `updates` uses the internal filter names (phoneme, type, ageRange…).
  const updateParams = useCallback(
    (updates: Partial<Record<keyof LibraryFilters, string>>) => {
      const next: LibraryFilters = { ...current, page: 1 };
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'page') next.page = parseInt(value || '1') || 1;
        else (next as unknown as Record<string, string>)[key] = value ?? '';
      });
      const qs = libraryQuery(next);
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    // `current` is derived from searchParams on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname, router]
  );

  // Old English links (?phoneme=S&ageRange=PRESCHOOL) become pt-BR URLs.
  useEffect(() => {
    if (!legacy) return;
    const qs = libraryQuery(current);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legacy]);

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
  const categoryOrder = ACTIVITY_CATEGORIES.map((c) => c.type);
  const categoryOptions = [
    ...categoryOrder.filter((t) => filters.types.includes(t)),
    ...filters.types.filter((t) => !categoryOrder.includes(t)),
  ];

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
              onSuccess={(name) => {
                setCreatedName(name || 'Atividade');
                queryClient.invalidateQueries({ queryKey: ['activities'] });
              }}
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

        {createdName && (
          <div
            role="status"
            className="mx-6 mb-3 flex flex-col gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              &ldquo;{createdName}&rdquo; foi criada e está aguardando revisão.
              Ela aparece na biblioteca depois de aprovada.
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/dashboard/resources?tab=review"
                className="font-semibold underline underline-offset-2"
              >
                Ir para Revisão
              </Link>
              <button
                type="button"
                onClick={() => setCreatedName(null)}
                className="text-green-900"
                aria-label="Fechar aviso"
              >
                ×
              </button>
            </div>
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
            value={type || ALL}
            onValueChange={(v) => {
              const next = v === ALL ? '' : v;
              // Only the Fonema category has phonemes: drop the phoneme filter
              // for any other category so the two never contradict.
              updateParams(
                next && next !== 'SPEECH'
                  ? { type: next, phoneme: '' }
                  : { type: next }
              );
            }}
          >
            <SelectTrigger
              className={`${filterTrigger} w-48`}
              aria-label="Filtrar por categoria"
            >
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as categorias</SelectItem>
              {categoryOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {label(TYPE_LABELS, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={phoneme || ALL}
            disabled={!!type && type !== 'SPEECH'}
            onValueChange={(v) =>
              // Choosing a phoneme implies the Fonema category.
              updateParams(
                v === ALL ? { phoneme: '' } : { phoneme: v, type: 'SPEECH' }
              )
            }
          >
            <SelectTrigger
              className={`${filterTrigger} w-40`}
              aria-label="Filtrar por fonema"
            >
              <SelectValue
                placeholder={
                  type && type !== 'SPEECH' ? 'Sem fonema' : 'Fonema'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                {type && type !== 'SPEECH' ? 'Sem fonema' : 'Todos os fonemas'}
              </SelectItem>
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

          <div
            role="group"
            aria-label="Modo de exibição"
            className="ml-auto flex rounded-md border border-neutral-200 p-0.5"
          >
            {(
              [
                { value: 'grade', label: 'Grade', Icon: LayoutGrid },
                { value: 'lista', label: 'Lista', Icon: List },
              ] as const
            ).map(({ value, label: text, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => chooseView(value)}
                aria-pressed={view === value}
                title={text}
                className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 ${
                  view === value
                    ? 'bg-neutral-100 font-semibold text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{text}</span>
                <span className="sr-only sm:hidden">{text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-6 py-6">
        {isLoading ? (
          view === 'lista' ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 w-full" />
              ))}
            </div>
          )
        ) : activities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-600">
              Nenhuma atividade encontrada.
            </p>
          </div>
        ) : (
          <ul
            className={
              view === 'lista'
                ? 'divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white'
                : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }
          >
            {activities.map((activity) => {
              const props: ActivityItemProps = {
                activity,
                showFreeBadge: canDownloadAll === false,
                downloading: downloadingId === activity.files[0]?.id,
                onOpen: () => setPreviewActivity(activity),
                onDownload: () =>
                  handleDownload(activity.files[0].id, `${activity.name}.pdf`),
                onUpgrade: () => setUpgradeOpen(true),
              };
              return (
                <li key={activity.id}>
                  {view === 'lista' ? (
                    <ActivityRow {...props} />
                  ) : (
                    <ActivityCard {...props} />
                  )}
                </li>
              );
            })}
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
