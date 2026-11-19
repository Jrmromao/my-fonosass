'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';

interface CorrectionRow {
  id: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
  user: { id: string; email: string; fullName: string };
}

const STATUS_LABEL = {
  PENDING: 'Pendente',
  RESOLVED: 'Atendida',
  REJECTED: 'Recusada',
} as const;

export default function CorrectionRequestsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<CorrectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/correction-requests');
      const json = await res.json();
      if (json.success) setRows(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const answer = async (id: string, status: 'RESOLVED' | 'REJECTED') => {
    const resolutionNote = (notes[id] ?? '').trim();
    if (!resolutionNote) {
      toast({
        title: 'Escreva a resposta',
        description: 'O usuário recebe esta mensagem por email.',
        variant: 'destructive',
      });
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/correction-requests/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionNote }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Resposta enviada' });
      await load();
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a resposta.',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-950">
          Solicitações de correção de dados
        </h1>
        <p className="text-sm text-neutral-600">
          LGPD art. 18 III. Prazo de resposta: 15 dias úteis. Nome e email são
          corrigidos pelo próprio usuário; aqui chegam os demais pedidos.
        </p>
      </div>

      {loading && <p className="text-sm text-neutral-600">Carregando...</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-neutral-600">Nenhuma solicitação.</p>
      )}

      {rows.map((r) => (
        <div key={r.id} className="space-y-3 rounded-lg border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{r.user.fullName}</p>
              <p className="text-sm text-neutral-600">{r.user.email}</p>
              <p className="text-xs text-neutral-500">
                {new Date(r.requestedAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <Badge variant={r.status === 'PENDING' ? 'default' : 'outline'}>
              {STATUS_LABEL[r.status]}
            </Badge>
          </div>

          <p className="whitespace-pre-wrap text-sm">{r.description}</p>

          {r.status === 'PENDING' ? (
            <div className="space-y-2">
              <Textarea
                value={notes[r.id] ?? ''}
                onChange={(e) =>
                  setNotes((n) => ({ ...n, [r.id]: e.target.value }))
                }
                placeholder="Resposta para o usuário (enviada por email)"
                className="min-h-[80px]"
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busyId === r.id}
                  onClick={() => answer(r.id, 'RESOLVED')}
                >
                  Marcar como atendida
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === r.id}
                  onClick={() => answer(r.id, 'REJECTED')}
                >
                  Recusar
                </Button>
              </div>
            </div>
          ) : (
            <p className="rounded bg-neutral-50 p-2 text-sm text-neutral-700">
              {r.resolutionNote}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
