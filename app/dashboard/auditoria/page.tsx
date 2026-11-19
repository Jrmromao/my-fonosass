'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCallback, useEffect, useState } from 'react';

interface AuditRow {
  id: string;
  createdAt: string;
  actorType: 'ADMIN' | 'USER' | 'MACHINE' | 'ANONYMOUS';
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
}

// Filter value = action prefix understood by the API ('' = everything).
const FILTERS = [
  { value: 'all', prefix: '', label: 'Tudo' },
  { value: 'admin.', prefix: 'admin.', label: 'Ações de administradores' },
  { value: 'security.', prefix: 'security.', label: 'Eventos de segurança' },
] as const;

const ACTION_LABEL: Record<string, string> = {
  'admin.waiting_list.read': 'Leitura da lista de espera',
  'admin.correction_request.resolve': 'Resposta a pedido de correção',
  'admin.activities.sync': 'Sincronização de atividades',
  'admin.free_samples.set': 'Definição das atividades grátis',
  'admin.free_samples.clear': 'Volta ao rodízio automático',
  'admin.monitoring.clear': 'Limpeza de dados de monitoramento',
  'admin.cache.clear': 'Limpeza de cache',
  'admin.user.insert': 'Usuário criado',
  'admin.user.invite': 'Convite enviado',
  'admin.user.update': 'Usuário alterado',
  'admin.user.remove': 'Usuário removido',
  'admin.audit.read': 'Consulta ao registro de auditoria',
  'security.admin_denied': 'Acesso admin negado a usuário comum',
  'security.approval_token_invalid': 'Token de revisão inválido',
  'security.csp_violation':
    'Violação da política de segurança de conteúdo (CSP)',
};

const ACTOR_LABEL = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
  MACHINE: 'Automação',
  ANONYMOUS: 'Anônimo',
} as const;

export default function AuditTrailPage() {
  const [filter, setFilter] = useState<string>('all');
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (reset: boolean, after: string | null) => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({ limit: '50' });
        const prefix = FILTERS.find((f) => f.value === filter)?.prefix;
        if (prefix) params.set('action', prefix);
        if (!reset && after) params.set('cursor', after);

        const res = await fetch(`/api/admin/audit-events?${params}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error();
        setRows((prev) => (reset ? json.data : [...prev, ...json.data]));
        setCursor(json.nextCursor);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    load(true, null);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold text-violet-950">
          Registro de auditoria
        </h1>
        <p className="text-sm text-neutral-600">
          Ações de administradores sobre dados pessoais e eventos de segurança.
          Somente leitura. Os registros guardam apenas identificadores (sem
          nomes nem e-mails) e são apagados após 6 meses.
        </p>
      </div>

      <div className="w-64">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Não foi possível carregar o registro.
        </p>
      )}
      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-neutral-600">Nenhum evento registrado.</p>
      )}

      <div className="divide-y rounded-lg border bg-white">
        {rows.map((e) => (
          <div key={e.id} className="space-y-1 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                {ACTION_LABEL[e.action] ?? e.action}
              </span>
              <span className="text-xs text-neutral-500">
                {new Date(e.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
              <Badge variant="outline">{ACTOR_LABEL[e.actorType]}</Badge>
              {e.actorId && <span>autor: {e.actorId}</span>}
              {e.targetType && (
                <span>
                  alvo: {e.targetType}
                  {e.targetId ? ` ${e.targetId}` : ''}
                </span>
              )}
              {e.ip && <span>IP {e.ip}</span>}
            </div>
            {e.metadata && Object.keys(e.metadata).length > 0 && (
              <p className="font-mono text-xs text-neutral-500">
                {Object.entries(e.metadata)
                  .map(([k, v]) => `${k}=${String(v)}`)
                  .join('  ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {cursor && (
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => load(false, cursor)}
        >
          {loading ? 'Carregando...' : 'Carregar mais'}
        </Button>
      )}
      {loading && rows.length === 0 && (
        <p className="text-sm text-neutral-600">Carregando...</p>
      )}
    </div>
  );
}
