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
import { useUserRole } from '@/hooks/useUserRole';
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  TYPE_LABELS,
  label,
  phonemeLabel,
} from '@/lib/activityLabels';
import { FREE_PHONEME, PRO_PLAN, formatBRL } from '@/lib/pricing';
import { getFileDownloadUrl } from '@/lib/actions/file-download.action';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Lock,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

export default function ActivitiesPage() {
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

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewActivity, setPreviewActivity] = useState<any>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<
    'monthly' | 'yearly' | null
  >(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
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
  // Unknown until loaded: avoid flashing the upsell banner for subscribers.
  const canDownloadAll: boolean | undefined = data?.viewer?.canDownloadAll;
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };
  const filters = data?.filters || {
    phonemes: [],
    types: [],
    difficulties: [],
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
      } else if (!result.success && result.requiresSubscription) {
        setUpgradeOpen(true);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const startCheckout = async (interval: 'monthly' | 'yearly') => {
    setCheckoutLoading(interval);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (res.ok && json.url) {
        window.location.href = json.url;
        return;
      }
      setCheckoutError('Não foi possível abrir o pagamento. Tente novamente.');
    } catch {
      setCheckoutError('Não foi possível abrir o pagamento. Tente novamente.');
    }
    setCheckoutLoading(null);
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
          <Select
            value={phoneme || 'all'}
            onValueChange={(v) =>
              updateParams({ phoneme: v === 'all' ? '' : v })
            }
          >
            <SelectTrigger className="h-8 w-28 text-xs border-border">
              <SelectValue placeholder="Fonema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Fonema</SelectItem>
              {filters.phonemes
                .filter((p: string) => p && p.trim() !== '')
                .map((p: string) => (
                  <SelectItem key={p} value={p}>
                    {phonemeLabel(p)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={type || 'all'}
            onValueChange={(v) => updateParams({ type: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="h-8 w-32 text-xs border-border">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tipo</SelectItem>
              {filters.types
                .filter((t: string) => t && t.trim() !== '')
                .map((t: string) => (
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
            <SelectTrigger className="h-8 w-32 text-xs border-border">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Dificuldade</SelectItem>
              {filters.difficulties
                .filter((d: string) => d && d.trim() !== '')
                .map((d: string) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
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
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade encontrada.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nome
                </th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                  Fonema
                </th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                  Tipo
                </th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                  Dificuldade
                </th>
                <th className="text-left py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                  Idade
                </th>
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
                    <span className="text-sm text-foreground">
                      {activity.name}
                    </span>
                    {activity.isFreeSample && canDownloadAll === false && (
                      <span className="ml-2 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Grátis
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-mono text-muted-foreground">
                      {phonemeLabel(activity.phoneme)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">
                      {label(TYPE_LABELS, activity.type)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">
                      {label(DIFFICULTY_LABELS, activity.difficulty)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs text-muted-foreground">
                      {label(AGE_LABELS, activity.ageRange)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {activity.files?.[0] && !activity.canDownload && (
                      <button
                        className="p-1 rounded hover:bg-neutral-100 transition-colors"
                        aria-label="Assinar para baixar"
                        title="Assinar para baixar"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUpgradeOpen(true);
                        }}
                      >
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                    {activity.files?.[0] && activity.canDownload && (
                      <button
                        className="p-1 rounded hover:bg-neutral-100 transition-colors"
                        aria-label="Baixar"
                        title="Baixar"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            activity.files[0].id,
                            `${activity.name}.pdf`
                          );
                        }}
                        disabled={downloadingId === activity.files[0].id}
                      >
                        {downloadingId === activity.files[0].id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
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
      <Dialog
        open={!!previewActivity}
        onOpenChange={() => setPreviewActivity(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewActivity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm font-medium">
                  {previewActivity.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {previewActivity.thumbnailUrl ? (
                  <img
                    src={previewActivity.thumbnailUrl}
                    alt=""
                    className="w-full rounded border border-neutral-200"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-600">
                    <Lock className="mr-2 h-4 w-4" aria-hidden />
                    Prévia disponível para assinantes
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
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
                {previewActivity.files?.[0] && !previewActivity.canDownload && (
                  <Button
                    className="w-full bg-coral-700 hover:bg-coral-800 text-white text-sm h-9"
                    onClick={() => {
                      setPreviewActivity(null);
                      setUpgradeOpen(true);
                    }}
                  >
                    <Lock className="h-3.5 w-3.5 mr-2" aria-hidden />
                    Assinar para baixar
                  </Button>
                )}
                {previewActivity.files?.[0] && previewActivity.canDownload && (
                  <Button
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-sm h-9"
                    onClick={() =>
                      handleDownload(
                        previewActivity.files[0].id,
                        `${previewActivity.name}.pdf`
                      )
                    }
                    disabled={downloadingId === previewActivity.files[0].id}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeOpen}
        onOpenChange={(o) => {
          setUpgradeOpen(o);
          if (!o) setCheckoutError(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Assine para baixar toda a biblioteca
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Com o plano {PRO_PLAN.name} você baixa todas as atividades, com
              novidades toda semana. Cancele quando quiser.
            </p>
            {checkoutError && (
              <p className="text-sm text-destructive" role="alert">
                {checkoutError}
              </p>
            )}
            <div className="space-y-2">
              <Button
                className="w-full h-10 bg-coral-700 hover:bg-coral-800 text-white text-sm font-semibold"
                disabled={checkoutLoading !== null}
                onClick={() => startCheckout('monthly')}
              >
                {checkoutLoading === 'monthly'
                  ? 'Abrindo pagamento...'
                  : `Mensal: ${formatBRL(PRO_PLAN.monthlyPrice)}/mês`}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 border-neutral-300 text-sm font-semibold"
                disabled={checkoutLoading !== null}
                onClick={() => startCheckout('yearly')}
              >
                {checkoutLoading === 'yearly'
                  ? 'Abrindo pagamento...'
                  : `Anual: ${formatBRL(PRO_PLAN.yearlyPrice)}/ano`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
