'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, Eye, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface PendingActivity {
  id: string;
  name: string;
  phoneme: string;
  difficulty: string;
  ageRange: string;
  status: string;
  createdAt: string;
  description: string;
}

export function ActivityReviewPanel() {
  const [activities, setActivities] = useState<PendingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [correcting, setCorrecting] = useState(false);

  const loadActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/exercises?status=all&nocache=1');
      const data = await res.json();
      if (data.success) {
        setActivities(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/activities/${id}/approve`, { method: 'POST' });
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'PUBLISHED' } : a))
    );
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/activities/${id}/discard`, { method: 'POST' });
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a))
    );
  };

  const handleCorrectWithAI = async (id: string) => {
    if (!feedback.trim()) return;
    setCorrecting(true);
    const res = await fetch(
      `/api/admin/activities/${id}/reject-with-feedback`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      }
    );
    const data = await res.json();
    if (data.success) {
      await loadActivities();
    }
    setFeedbackId(null);
    setFeedback('');
    setCorrecting(false);
  };

  const selected = activities.find((a) => a.id === selectedId);
  const pending = activities.filter((a) => a.status === 'PENDING_REVIEW');
  const published = activities.filter((a) => a.status === 'PUBLISHED');
  const rejected = activities.filter((a) => a.status === 'REJECTED');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Activity list */}
      <div className="lg:col-span-1 space-y-1">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Pendentes ({pending.length})
          </span>
        </div>

        {pending.length === 0 && published.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            Nenhuma atividade para revisar
          </div>
        )}

        {pending.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelectedId(activity.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedId === activity.id
                ? 'border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10'
                : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {activity.name}
              </span>
              <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                /{activity.phoneme}/
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">
                {activity.difficulty}
              </span>
            </div>
          </button>
        ))}

        {published.length > 0 && (
          <>
            <div className="flex items-center gap-3 mt-6 mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Publicados ({published.length})
              </span>
            </div>
            {published.slice(0, 5).map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedId(activity.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedId === activity.id
                    ? 'border-indigo-200 bg-indigo-50/50'
                    : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {activity.name}
                  </span>
                  <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                </div>
                <span className="text-xs text-gray-400">
                  /{activity.phoneme}/
                </span>
              </button>
            ))}
          </>
        )}
      </div>

      {/* Right: Detail view */}
      <div className="lg:col-span-2">
        {selected ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selected.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    /{selected.phoneme}/
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selected.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selected.ageRange}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      selected.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selected.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                    variant="outline"
                  >
                    {selected.status === 'PUBLISHED' && 'Publicado'}
                    {selected.status === 'PENDING_REVIEW' && 'Pendente'}
                    {selected.status === 'REJECTED' && 'Rejeitado'}
                  </Badge>
                </div>
              </div>

              {selected.status === 'PENDING_REVIEW' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleReject(selected.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setFeedbackId(
                        feedbackId === selected.id ? null : selected.id
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Corrigir com IA
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleApprove(selected.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                </div>
              )}
            </div>

            {/* Exercise content */}
            <div className="space-y-4">
              <ExerciseContent description={selected.description} />
            </div>

            {/* AI Correction feedback */}
            {feedbackId === selected.id && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <textarea
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descreva o que esta errado (ex: erro ortografico no titulo, faixa etaria incorreta...)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCorrectWithAI(selected.id)}
                    disabled={!feedback.trim() || correcting}
                  >
                    {correcting ? 'Corrigindo...' : 'Enviar para correcao'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFeedbackId(null);
                      setFeedback('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
            Selecione uma atividade para visualizar
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseContent({ description }: { description: string }) {
  let data: Record<string, string | string[]>;
  try {
    data = JSON.parse(description);
  } catch {
    return <p className="text-sm text-gray-600">{description}</p>;
  }

  return (
    <div className="space-y-4">
      {data.objetivo && typeof data.objetivo === 'string' && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Objetivo
          </h4>
          <p className="text-sm text-gray-700">{data.objetivo}</p>
        </div>
      )}
      {Array.isArray(data.instrucoes) && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Instruções
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            {data.instrucoes.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      {Array.isArray(data.materiais) && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Materiais
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {data.materiais.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
      {data.tempo && typeof data.tempo === 'string' && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Tempo
          </h4>
          <p className="text-sm text-gray-700">{data.tempo}</p>
        </div>
      )}
      {data.observacoes && typeof data.observacoes === 'string' && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Observações
          </h4>
          <p className="text-sm text-gray-700">{data.observacoes}</p>
        </div>
      )}
    </div>
  );
}
