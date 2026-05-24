'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface Activity {
  id: string;
  name: string;
  description: string;
  phoneme: string;
  difficulty: string;
  ageRange: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function AdminReviewPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/activities/pending');
    const data = await res.json();
    if (data.success) setActivities(data.activities);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/admin/activities/${id}/approve`, { method: 'POST' });
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setProcessing(null);
  };

  const handleDiscard = async (id: string) => {
    setProcessing(id);
    await fetch(`/api/admin/activities/${id}/discard`, { method: 'POST' });
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setProcessing(null);
  };

  const handleRejectWithFeedback = async (id: string) => {
    if (!feedback.trim()) return;
    setProcessing(id);
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
      // Refresh the activity with corrected content
      await fetchActivities();
    }
    setFeedbackId(null);
    setFeedback('');
    setProcessing(null);
  };

  const parseDescription = (desc: string) => {
    try {
      return JSON.parse(desc);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Carregando atividades...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Revisao de Atividades
        </h1>
        <p className="text-gray-500 mt-1">
          {activities.length} atividade{activities.length !== 1 ? 's' : ''}{' '}
          pendente{activities.length !== 1 ? 's' : ''}
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Nenhuma atividade pendente de revisao.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const parsed = parseDescription(activity.description);
            return (
              <Card key={activity.id} className="border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">/{activity.phoneme}/</Badge>
                      <Badge variant="outline">{activity.difficulty}</Badge>
                      <Badge variant="outline">{activity.ageRange}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {parsed && (
                    <div className="space-y-3 mb-4 text-sm text-gray-700">
                      {parsed.objetivo && (
                        <div>
                          <span className="font-medium">Objetivo:</span>{' '}
                          {parsed.objetivo}
                        </div>
                      )}
                      {parsed.instrucoes && (
                        <div>
                          <span className="font-medium">Instrucoes:</span>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            {parsed.instrucoes.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {parsed.materiais && (
                        <div>
                          <span className="font-medium">Materiais:</span>{' '}
                          {parsed.materiais.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {!parsed && (
                    <p className="text-sm text-gray-600 mb-4">
                      {activity.description}
                    </p>
                  )}

                  {/* Feedback form */}
                  {feedbackId === activity.id && (
                    <div className="mb-4 space-y-3 p-4 bg-gray-50 rounded-lg border">
                      <Textarea
                        placeholder="Descreva o que esta errado (ex: erro ortografico no titulo, faixa etaria incorreta...)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRejectWithFeedback(activity.id)}
                          disabled={
                            !feedback.trim() || processing === activity.id
                          }
                        >
                          {processing === activity.id
                            ? 'Corrigindo...'
                            : 'Enviar para correcao'}
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

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(activity.id)}
                      disabled={processing === activity.id}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFeedbackId(activity.id)}
                      disabled={processing === activity.id}
                    >
                      Corrigir com IA
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDiscard(activity.id)}
                      disabled={processing === activity.id}
                    >
                      Descartar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
