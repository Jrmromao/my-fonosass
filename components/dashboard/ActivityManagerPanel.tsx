'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Archive,
  ArchiveRestore,
  Bell,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
import { ActivityEditDialog } from '@/components/dashboard/ActivityEditDialog';
import { useCSRF } from '@/hooks/useCSRF';
import { phonemeLabel, subjectLabel } from '@/lib/activityLabels';
import { useCallback, useEffect, useState } from 'react';

interface Activity {
  id: string;
  name: string;
  description: string;
  phoneme: string;
  type: string;
  status: string;
  isPublic: boolean;
  canDelete?: boolean;
  createdAt: string;
  files?: { id: string; s3Key: string; fileType: string; name: string }[];
}

export function ActivityManagerPanel() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phonemeFilter, setPhonemeFilter] = useState('all');
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const { csrfToken } = useCSRF();
  const [editing, setEditing] = useState<Activity | null>(null);
  const [confirm, setConfirm] = useState<{
    kind: 'archive' | 'delete';
    activity: Activity;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/activities/all?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Only update the row after the server confirms; it refuses e.g. to
  // publish an activity that has not been through review.
  const runAction = async (
    id: string,
    url: string,
    init: RequestInit,
    next: Pick<Activity, 'status' | 'isPublic'>
  ) => {
    setToggling(id);
    setActionError(null);
    try {
      const res = await fetch(url, { method: 'POST', ...init });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setActionError(json.error || 'Não foi possível concluir a ação.');
        return;
      }
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...next } : a))
      );
    } catch {
      setActionError('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setToggling(null);
    }
  };

  const approve = (id: string) =>
    runAction(
      id,
      `/api/admin/activities/${id}/approve`,
      {},
      { status: 'PUBLISHED', isPublic: true }
    );

  const setVisibility = (id: string, isPublic: boolean) =>
    runAction(
      id,
      `/api/admin/activities/${id}/toggle-visibility`,
      {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      },
      { status: isPublic ? 'PUBLISHED' : 'DRAFT', isPublic }
    );

  // Archive, restore and delete change files in S3, so they only update the
  // list after the server answers (and can take a few seconds).
  const changeActivity = async (
    activity: Activity,
    kind: 'archive' | 'restore' | 'delete'
  ) => {
    setToggling(activity.id);
    setActionError(null);
    setNotice(null);
    try {
      const base = `/api/admin/activities/${activity.id}`;
      const res = await fetch(kind === 'delete' ? base : `${base}/${kind}`, {
        method: kind === 'delete' ? 'DELETE' : 'POST',
        headers: { 'X-CSRF-Token': csrfToken ?? '' },
      });
      const json: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || !json.success) {
        setActionError(json.error || 'Não foi possível concluir a ação.');
        return;
      }
      setNotice(
        kind === 'archive'
          ? 'Atividade arquivada.'
          : kind === 'restore'
            ? 'Atividade restaurada. A prévia é gerada de novo na primeira visualização.'
            : 'Atividade excluída.'
      );
      await loadActivities();
    } catch {
      setActionError('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setToggling(null);
      setConfirm(null);
    }
  };

  const notifyReview = async (id: string) => {
    setNotifying(id);
    await fetch(`/api/admin/activities/${id}/notify-review`, {
      method: 'POST',
    });
    setNotifying(null);
  };

  const filtered = activities;

  // Non-phoneme categories (Linguagem, Cores...) store phoneme = ''. Radix
  // throws on <SelectItem value="">, so leave those out of the filter.
  const phonemes = [
    ...new Set(activities.map((a) => a.phoneme).filter(Boolean)),
  ].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-coral-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          {actionError}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atividades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PUBLISHED">Publicado</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pendente</SelectItem>
            <SelectItem value="REJECTED">Rejeitado</SelectItem>
            <SelectItem value="DRAFT">Rascunho</SelectItem>
            <SelectItem value="ARCHIVED">Arquivado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={phonemeFilter} onValueChange={setPhonemeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Fonema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {phonemes.map((p) => (
              <SelectItem key={p} value={p}>
                {phonemeLabel(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{pagination.total} atividades</span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Nome
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Fonema
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.map((activity) => (
              <tr key={activity.id} className="hover:bg-muted">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {activity.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {subjectLabel(activity.phoneme, activity.type)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      activity.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : activity.status === 'PENDING_REVIEW'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : activity.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : activity.status === 'ARCHIVED'
                              ? 'bg-neutral-100 text-neutral-600 border-neutral-300'
                              : 'bg-neutral-50 text-muted-foreground border-neutral-200'
                    }`}
                  >
                    {activity.status === 'PUBLISHED' && 'Publicado'}
                    {activity.status === 'PENDING_REVIEW' && 'Pendente'}
                    {activity.status === 'REJECTED' && 'Rejeitado'}
                    {activity.status === 'DRAFT' && 'Rascunho'}
                    {activity.status === 'ARCHIVED' && 'Arquivado'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setPreviewActivity(activity)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {activity.status === 'PENDING_REVIEW' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-emerald-200 px-2 text-xs text-emerald-800 hover:bg-emerald-50"
                        onClick={() => approve(activity.id)}
                        disabled={toggling === activity.id}
                        title="Aprovar e publicar"
                      >
                        <Check className="mr-1 h-4 w-4" aria-hidden />
                        Aprovar
                      </Button>
                    )}
                    {(activity.status === 'PUBLISHED' ||
                      activity.status === 'DRAFT') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          setVisibility(activity.id, !activity.isPublic)
                        }
                        disabled={toggling === activity.id}
                        title={
                          activity.isPublic
                            ? 'Ocultar da biblioteca'
                            : 'Publicar na biblioteca'
                        }
                        aria-label={
                          activity.isPublic
                            ? 'Ocultar da biblioteca'
                            : 'Publicar na biblioteca'
                        }
                      >
                        {activity.isPublic ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-emerald-600" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => setEditing(activity)}
                      title="Editar título e descrição"
                    >
                      <Pencil className="mr-1 h-4 w-4" aria-hidden />
                      Editar
                    </Button>
                    {activity.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs"
                        onClick={() =>
                          setConfirm({ kind: 'archive', activity })
                        }
                        disabled={toggling === activity.id || !csrfToken}
                        title="Tirar da biblioteca e guardar os arquivos"
                      >
                        <Archive className="mr-1 h-4 w-4" aria-hidden />
                        Arquivar
                      </Button>
                    )}
                    {activity.status === 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                        onClick={() => changeActivity(activity, 'restore')}
                        disabled={toggling === activity.id || !csrfToken}
                        title="Voltar para a biblioteca"
                      >
                        <ArchiveRestore className="mr-1 h-4 w-4" aria-hidden />
                        Restaurar
                      </Button>
                    )}
                    {activity.canDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-xs text-red-700 hover:bg-red-50"
                        onClick={() => setConfirm({ kind: 'delete', activity })}
                        disabled={toggling === activity.id || !csrfToken}
                        title="Excluir de vez"
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                        Excluir
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => notifyReview(activity.id)}
                      disabled={notifying === activity.id}
                      title="Notificar admin para revisao"
                    >
                      <Bell className="h-4 w-4 text-accent" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Página {page} de {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}

      <ActivityEditDialog
        activity={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setNotice('Atividade atualizada.');
          setActionError(null);
          loadActivities();
        }}
      />

      <Dialog
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open && !toggling) setConfirm(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirm?.kind === 'delete'
                ? 'Excluir atividade?'
                : 'Arquivar atividade?'}
            </DialogTitle>
            <DialogDescription>
              {confirm?.kind === 'delete'
                ? `“${confirm.activity.name}” e o arquivo dela serão excluídos de vez. Não dá para desfazer.`
                : confirm
                  ? `“${confirm.activity.name}”: some da biblioteca e os arquivos vão para o arquivo; o histórico é mantido.`
                  : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirm(null)}
              disabled={!!toggling}
            >
              Cancelar
            </Button>
            <Button
              variant={confirm?.kind === 'delete' ? 'destructive' : 'default'}
              disabled={!!toggling}
              onClick={() =>
                confirm && changeActivity(confirm.activity, confirm.kind)
              }
            >
              {toggling
                ? 'Aguarde…'
                : confirm?.kind === 'delete'
                  ? 'Excluir'
                  : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewActivity}
        onOpenChange={() => setPreviewActivity(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewActivity?.name}</DialogTitle>
          </DialogHeader>
          {previewActivity && <ActivityPreview activity={previewActivity} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ActivityPreview({ activity }: { activity: Activity }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    if (activity.files?.[0]) {
      setLoadingPreview(true);
      fetch(`/api/admin/activities/${activity.id}/preview`)
        .then((res) => res.json())
        .then((data) => {
          if (data.url) setPreviewUrl(data.url);
        })
        .finally(() => setLoadingPreview(false));
    }
  }, [activity]);

  let parsed: any = null;
  try {
    parsed = JSON.parse(activity.description);
  } catch {
    /* non-JSON description */
  }

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline">
          {subjectLabel(activity.phoneme, activity.type)}
        </Badge>
        <Badge variant="outline">{activity.type}</Badge>
      </div>

      {/* File preview */}
      {loadingPreview && (
        <p className="text-sm text-muted-foreground">Carregando preview...</p>
      )}
      {previewUrl && activity.files?.[0]?.fileType?.startsWith('image/') && (
        <img
          src={previewUrl}
          alt={activity.name}
          className="w-full rounded-lg border"
        />
      )}
      {previewUrl && activity.files?.[0]?.fileType === 'application/pdf' && (
        <iframe src={previewUrl} className="w-full h-96 rounded-lg border" />
      )}

      {/* Exercise content */}
      {parsed && (
        <div className="space-y-3 text-sm">
          {parsed.objetivo && (
            <div>
              <span className="font-medium text-neutral-700">Objetivo:</span>
              <p className="text-muted-foreground">{parsed.objetivo}</p>
            </div>
          )}
          {parsed.instrucoes && (
            <div>
              <span className="font-medium text-neutral-700">Instrucoes:</span>
              <ol className="list-decimal list-inside mt-1 text-muted-foreground">
                {parsed.instrucoes.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {parsed.materiais && (
            <div>
              <span className="font-medium text-neutral-700">Materiais:</span>
              <p className="text-muted-foreground">
                {parsed.materiais.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {!parsed && (
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      )}
    </div>
  );
}
