'use client';

import { NewActivityDialog } from '@/components/dialogs/new-activity-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Search,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

const queryClient = new QueryClient();

export default function ActivitiesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActivitiesContent />
    </QueryClientProvider>
  );
}

function ActivitiesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read filters from URL
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const phoneme = searchParams.get('phoneme') || '';
  const type = searchParams.get('type') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const ageRange = searchParams.get('ageRange') || '';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      // Reset to page 1 when filters change (unless page itself is changing)
      if (!('page' in updates)) params.set('page', '1');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Sync debounced search to URL
  const effectiveSearch = debouncedSearch !== search ? debouncedSearch : search;
  if (debouncedSearch !== search) {
    updateParams({ search: debouncedSearch });
  }

  // Fetch data server-side
  const { data, isLoading } = useQuery({
    queryKey: [
      'activities',
      page,
      effectiveSearch,
      phoneme,
      type,
      difficulty,
      ageRange,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (effectiveSearch) params.set('search', effectiveSearch);
      if (phoneme) params.set('phoneme', phoneme);
      if (type) params.set('type', type);
      if (difficulty) params.set('difficulty', difficulty);
      if (ageRange) params.set('ageRange', ageRange);

      const res = await fetch(`/api/activities/search?${params.toString()}`);
      return res.json();
    },
    staleTime: 30_000,
  });

  const activities = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const filters = data?.filters || {
    phonemes: [],
    types: [],
    difficulties: [],
    ageRanges: [],
  };

  const handleDownload = async (fileId: string, name: string) => {
    setDownloadingId(fileId);
    try {
      const result = await getFileDownloadUrl({ fileId });
      if (result.success && result.url) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = name;
        a.click();
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                Biblioteca de Atividades
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {pagination.total} atividades disponiveis
              </p>
            </div>
            <NewActivityDialog
              onSuccess={() =>
                queryClient.invalidateQueries({ queryKey: ['activities'] })
              }
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar atividades..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Select
              value={phoneme || 'all'}
              onValueChange={(v) =>
                updateParams({ phoneme: v === 'all' ? '' : v })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Fonema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos fonemas</SelectItem>
                {filters.phonemes.map((p: string) => (
                  <SelectItem key={p} value={p}>
                    /{p}/
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type || 'all'}
              onValueChange={(v) =>
                updateParams({ type: v === 'all' ? '' : v })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                {filters.types.map((t: string) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={difficulty || 'all'}
              onValueChange={(v) =>
                updateParams({ difficulty: v === 'all' ? '' : v })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {filters.difficulties.map((d: string) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={ageRange || 'all'}
              onValueChange={(v) =>
                updateParams({ ageRange: v === 'all' ? '' : v })
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Idade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas idades</SelectItem>
                {filters.ageRanges.map((a: string) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters */}
          {(phoneme || type || difficulty || ageRange || search) && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-400">Filtros:</span>
              {phoneme && (
                <Badge variant="secondary" className="text-xs">
                  /{phoneme}/
                </Badge>
              )}
              {type && (
                <Badge variant="secondary" className="text-xs">
                  {type}
                </Badge>
              )}
              {difficulty && (
                <Badge variant="secondary" className="text-xs">
                  {difficulty}
                </Badge>
              )}
              {ageRange && (
                <Badge variant="secondary" className="text-xs">
                  {ageRange}
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="text-xs">
                  "{search}"
                </Badge>
              )}
              <button
                className="text-xs text-indigo-600 hover:underline ml-2"
                onClick={() => {
                  setSearchInput('');
                  router.push(pathname);
                }}
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">
              Nenhuma atividade encontrada.
            </p>
            {(phoneme || type || search) && (
              <button
                className="mt-2 text-sm text-indigo-600 hover:underline"
                onClick={() => {
                  setSearchInput('');
                  router.push(pathname);
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activities.map((activity: any) => (
                <Card
                  key={activity.id}
                  className="border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-medium">
                        /{activity.phoneme}/
                      </Badge>
                      {activity.files?.[0] && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          disabled={downloadingId === activity.files[0].id}
                          onClick={() =>
                            handleDownload(
                              activity.files[0].id,
                              `${activity.name}.pdf`
                            )
                          }
                        >
                          {downloadingId === activity.files[0].id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <FileDown className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {activity.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {activity.difficulty}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {activity.ageRange}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.page} de {pagination.totalPages} (
                  {pagination.total} resultados)
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= pagination.totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
