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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bell, Eye, EyeOff, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Activity {
  id: string;
  name: string;
  description: string;
  phoneme: string;
  difficulty: string;
  ageRange: string;
  type: string;
  status: string;
  isPublic: boolean;
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
  const [notifying, setNotifying] = useState<string | null>(null);
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

  const toggleVisibility = async (id: string, currentlyPublic: boolean) => {
    setToggling(id);
    await fetch(`/api/admin/activities/${id}/toggle-visibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !currentlyPublic }),
    });
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isPublic: !currentlyPublic,
              status: !currentlyPublic ? 'PUBLISHED' : 'DRAFT',
            }
          : a
      )
    );
    setToggling(null);
  };

  const notifyReview = async (id: string) => {
    setNotifying(id);
    await fetch(`/api/admin/activities/${id}/notify-review`, {
      method: 'POST',
    });
    setNotifying(null);
  };

  const filtered = activities;








  const phonemes = [...new Set(activities.map((a) => a.phoneme))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                /{p}/
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
                Dificuldade
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((activity) => (
              <tr
                key={activity.id}
                className="hover:bg-muted"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {activity.name}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.ageRange}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    /{activity.phoneme}/
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {activity.difficulty}
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
                            : 'bg-gray-50 text-muted-foreground border-gray-200'
                    }`}
                  >
                    {activity.status === 'PUBLISHED' && 'Publicado'}
                    {activity.status === 'PENDING_REVIEW' && 'Pendente'}
                    {activity.status === 'REJECTED' && 'Rejeitado'}
                    {activity.status === 'DRAFT' && 'Rascunho'}
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        toggleVisibility(activity.id, activity.isPublic)
                      }
                      disabled={toggling === activity.id}
                      title={activity.isPublic ? 'Ocultar' : 'Mostrar'}
                    >
                      {activity.isPublic ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
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
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              &lt;
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
              &gt;
            </Button>
          </div>
        </div>
      )}

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
        <Badge variant="outline">/{activity.phoneme}/</Badge>
        <Badge variant="outline">{activity.difficulty}</Badge>
        <Badge variant="outline">{activity.ageRange}</Badge>
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
              <span className="font-medium text-gray-700">Objetivo:</span>
              <p className="text-muted-foreground">{parsed.objetivo}</p>
            </div>
          )}
          {parsed.instrucoes && (
            <div>
              <span className="font-medium text-gray-700">Instrucoes:</span>
              <ol className="list-decimal list-inside mt-1 text-muted-foreground">
                {parsed.instrucoes.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {parsed.materiais && (
            <div>
              <span className="font-medium text-gray-700">Materiais:</span>
              <p className="text-muted-foreground">{parsed.materiais.join(', ')}</p>
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
