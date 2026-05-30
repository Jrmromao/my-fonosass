'use client';

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download, MoreHorizontal, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

export default function ActivitiesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const phoneme = searchParams.get('phoneme') || '';
  const type = searchParams.get('type') || '';
  const difficulty = searchParams.get('difficulty') || '';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewActivity, setPreviewActivity] = useState<any>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const effectiveSearch = debouncedSearch !== search ? debouncedSearch : search;
  if (debouncedSearch !== search) {
    updateParams({ search: debouncedSearch });
  }

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page, effectiveSearch, phoneme, type, difficulty],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (effectiveSearch) params.set('search', effectiveSearch);
      if (phoneme) params.set('phoneme', phoneme);
      if (type) params.set('type', type);
      if (difficulty) params.set('difficulty', difficulty);
      const res = await fetch(`/api/activities/search?${params.toString()}`);
      return res.json();
    },
  });

  const activities = data?.data || [];
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const filters = data?.filters || { phonemes: [], types: [], difficulties: [] };

  const handleDownload = async (fileId: string, name: string) => {
    setDownloadingId(fileId);
    try {
      const result = await getFileDownloadUrl({ fileId });
      if (result.success && result.url) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = name;
        a.click();
      } else if ((result as any).limitReached) {
        setLimitReached(true);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Atividades
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pagination.total} atividades
            </p>
          </div>
          <NewActivityDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['activities'] })} />
        </div>

        {/* Filters */}
        <div className="px-6 pb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8 pl-8 text-xs bg-background border-border"
            />
          </div>
          <Select value={phoneme || 'all'} onValueChange={(v) => updateParams({ phoneme: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-8 w-28 text-xs border-border">
              <SelectValue placeholder="Fonema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Fonema</SelectItem>
              {filters.phonemes.map((p: string) => (
                <SelectItem key={p} value={p}>/{p}/</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type || 'all'} onValueChange={(v) => updateParams({ type: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-8 w-32 text-xs border-border">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tipo</SelectItem>
              {filters.types.map((t: string) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty || 'all'} onValueChange={(v) => updateParams({ difficulty: v === 'all' ? '' : v })}>
            <SelectTrigger className="h-8 w-32 text-xs border-border">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Dificuldade</SelectItem>
              {filters.difficulties.map((d: string) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="px-6">
        {isLoading ? (
          <div className="py-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Fonema</th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">Tipo</th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">Dificuldade</th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Idade</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity: any) => (
                <tr
                  key={activity.id}
                  className="border-b border-border/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => setPreviewActivity(activity)}
                >
                  <td className="py-3">
                    <span className="text-sm text-foreground">{activity.name}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-mono text-muted-foreground">/{activity.phoneme}/</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">{activity.type}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">{activity.difficulty}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">{activity.ageRange}</span>
                  </td>
                  <td className="py-3 text-right">
                    {activity.files?.[0] && (
                      <button
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(activity.files[0].id, `${activity.name}.pdf`);
                        }}
                        disabled={downloadingId === activity.files[0].id}
                      >
                        {downloadingId === activity.files[0].id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : (
                          <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={page >= pagination.totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewActivity} onOpenChange={() => setPreviewActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm font-medium">{previewActivity.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {previewActivity.thumbnailUrl && (
                  <img src={previewActivity.thumbnailUrl} alt="" className="w-full rounded border border-gray-200" />
                )}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">/{previewActivity.phoneme}/</span>
                  <span>{previewActivity.type}</span>
                  <span>{previewActivity.difficulty}</span>
                  <span>{previewActivity.ageRange}</span>
                </div>
                <p className="text-sm text-gray-600">{previewActivity.description}</p>
                {previewActivity.files?.[0] && (
                  <Button
                    className="w-full bg-black hover:bg-gray-800 text-white text-sm h-9"
                    onClick={() => handleDownload(previewActivity.files[0].id, `${previewActivity.name}.pdf`)}
                    disabled={downloadingId === previewActivity.files[0].id}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Descarregar
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Upgrade Dialog */}
      <Dialog open={limitReached} onOpenChange={setLimitReached}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Limite de downloads atingido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Você atingiu o limite de 3 downloads gratuitos este mês. Assine o plano Profissional para downloads ilimitados.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#f97066] hover:bg-[#e5645b] text-white text-sm"
                onClick={() => { setLimitReached(false); router.push('/#assinatura'); }}
              >
                Ver planos
              </Button>
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={() => setLimitReached(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
