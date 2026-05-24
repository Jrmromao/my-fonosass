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

  const loadActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activities/all');
      const data = await res.json();
      if (data.success) setActivities(data.activities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const filtered = activities.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (phonemeFilter !== 'all' && a.phoneme !== phonemeFilter) return false;
    return true;
  });

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{filtered.length} atividades</span>
        <span>{activities.filter((a) => a.isPublic).length} visiveis</span>
        <span>{activities.filter((a) => !a.isPublic).length} ocultas</span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Nome
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Fonema
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Dificuldade
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((activity) => (
              <tr
                key={activity.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activity.name}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activity.ageRange}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    /{activity.phoneme}/
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
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
                            : 'bg-gray-50 text-gray-600 border-gray-200'
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
                        <EyeOff className="h-4 w-4 text-gray-500" />
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
                      <Bell className="h-4 w-4 text-indigo-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
        <p className="text-sm text-gray-400">Carregando preview...</p>
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
              <p className="text-gray-600">{parsed.objetivo}</p>
            </div>
          )}
          {parsed.instrucoes && (
            <div>
              <span className="font-medium text-gray-700">Instrucoes:</span>
              <ol className="list-decimal list-inside mt-1 text-gray-600">
                {parsed.instrucoes.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          {parsed.materiais && (
            <div>
              <span className="font-medium text-gray-700">Materiais:</span>
              <p className="text-gray-600">{parsed.materiais.join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {!parsed && (
        <p className="text-sm text-gray-600">{activity.description}</p>
      )}
    </div>
  );
}
