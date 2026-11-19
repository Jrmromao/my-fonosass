'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LibraryTopicsCard } from '@/components/settings/LibraryTopicsCard';
import { useCSRF } from '@/hooks/useCSRF';
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  label,
  subjectLabel,
} from '@/lib/activityLabels';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type ViewAsMode = 'assinante' | 'sem-assinatura';

interface SampleActivity {
  id: string;
  name: string;
  phoneme: string;
  type: string;
  ageRange: string;
  difficulty: string;
}

interface MonthSamples {
  month: string;
  source: 'manual' | 'default';
  samples: SampleActivity[];
}

const monthKey = (offset: number) => {
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1)
  );
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key: string) =>
  new Date(`${key}-01T12:00:00Z`).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-violet-200/60 p-6">
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 mb-5 text-sm text-neutral-600">{description}</p>
      {children}
    </section>
  );
}

function ActivityLine({ activity }: { activity: SampleActivity }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-sm font-medium text-neutral-900">
        {activity.name}
      </span>
      <span className="text-sm text-neutral-600">
        {subjectLabel(activity.phoneme, activity.type)} ·{' '}
        {label(AGE_LABELS, activity.ageRange)} ·{' '}
        {label(DIFFICULTY_LABELS, activity.difficulty)}
      </span>
    </span>
  );
}

export function AdminPanel() {
  return (
    <div className="space-y-6">
      <ViewAsCard />
      <FreeSamplesCard />
      <LibraryTopicsCard />
    </div>
  );
}

function ViewAsCard() {
  const { csrfToken } = useCSRF();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setMode = async (mode: ViewAsMode | null) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/view-as', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken ?? '',
        },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error('failed');
      // Reload so every page and query uses the new access.
      window.location.assign('/dashboard/biblioteca');
    } catch {
      setError('Não foi possível mudar o modo. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <Card
      title="Ver como"
      description="Teste a área do usuário sem trocar o seu papel. Só reduz o acesso: o administrador continua sendo administrador e pode sair a qualquer momento pela faixa no topo."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="h-10 border-neutral-300 text-sm font-semibold"
          disabled={saving || !csrfToken}
          onClick={() => setMode('assinante')}
        >
          Ver como assinante
        </Button>
        <Button
          variant="outline"
          className="h-10 border-neutral-300 text-sm font-semibold"
          disabled={saving || !csrfToken}
          onClick={() => setMode('sem-assinatura')}
        >
          Ver como usuário sem assinatura
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </Card>
  );
}

function FreeSamplesCard() {
  const queryClient = useQueryClient();
  const { csrfToken } = useCSRF();
  const [month, setMonth] = useState(monthKey(0));
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<SampleActivity[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: MonthSamples }>({
    queryKey: ['admin-free-samples', month],
    queryFn: async () => {
      const res = await fetch(`/api/admin/free-samples?mes=${month}`);
      if (!res.ok) throw new Error('Falha ao carregar');
      return res.json();
    },
  });
  const current = data?.data;

  const { data: candidates } = useQuery<{ data: SampleActivity[] }>({
    queryKey: ['admin-free-candidates', search],
    enabled: editing,
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/free-samples/candidates?busca=${encodeURIComponent(search)}`
      );
      if (!res.ok) throw new Error('Falha ao carregar');
      return res.json();
    },
  });

  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken ?? '',
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/free-samples', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ month, activityIds: selected.map((a) => a.id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Não foi possível salvar.');
      queryClient.setQueryData(['admin-free-samples', month], json);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const backToRotation = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/free-samples?mes=${month}`, {
        method: 'DELETE',
        headers,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Não foi possível salvar.');
      queryClient.setQueryData(['admin-free-samples', month], json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (activity: SampleActivity) =>
    setSelected((prev) =>
      prev.some((a) => a.id === activity.id)
        ? prev.filter((a) => a.id !== activity.id)
        : prev.length < FREE_SAMPLE_COUNT
          ? [...prev, activity]
          : prev
    );

  return (
    <Card
      title="Atividades grátis do mês"
      description={`${FREE_SAMPLE_COUNT} atividades ficam grátis para quem tem conta. Elas aparecem na página inicial, nas páginas de entrar e criar conta, e com o selo "Grátis" na biblioteca. Por padrão são as ${FREE_SAMPLE_COUNT} primeiras atividades publicadas do /s/ com imagem. Você pode escolher outras para um mês; quando o mês acaba, volta ao padrão.`}
    >
      <div
        role="group"
        aria-label="Mês"
        className="mb-4 inline-flex rounded-md border border-neutral-200 p-0.5"
      >
        {[0, 1].map((offset) => {
          const key = monthKey(offset);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={month === key}
              onClick={() => {
                setMonth(key);
                setEditing(false);
                setError(null);
              }}
              className={`h-8 rounded px-3 text-sm capitalize ${
                month === key
                  ? 'bg-neutral-100 font-semibold text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {monthLabel(key)}
            </button>
          );
        })}
      </div>

      {isLoading || !current ? (
        <p className="text-sm text-neutral-600">Carregando...</p>
      ) : !editing ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            {current.source === 'manual'
              ? 'Escolhidas por um administrador.'
              : 'Padrão: atividades do /s/.'}
          </p>
          {current.samples.length === 0 ? (
            <p className="text-sm text-neutral-900">
              Ainda não há atividades publicadas com imagem.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
              {current.samples.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <ActivityLine activity={a} />
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              className="h-10 bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
              onClick={() => {
                setSelected(current.samples);
                setEditing(true);
              }}
            >
              Escolher atividades
            </Button>
            {current.source === 'manual' && (
              <Button
                variant="outline"
                className="h-10 border-neutral-300 text-sm font-semibold"
                disabled={saving || !csrfToken}
                onClick={backToRotation}
              >
                Voltar ao padrão (/s/)
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-900">
            Selecionadas: {selected.length} de {FREE_SAMPLE_COUNT}
          </p>
          <Input
            placeholder="Buscar atividade publicada"
            aria-label="Buscar atividade publicada"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10"
          />
          <ul className="max-h-80 divide-y divide-neutral-200 overflow-y-auto rounded-md border border-neutral-200">
            {(candidates?.data ?? []).map((a) => {
              const checked = selected.some((s) => s.id === a.id);
              const full = !checked && selected.length >= FREE_SAMPLE_COUNT;
              return (
                <li key={a.id}>
                  <label
                    className={`flex items-center gap-3 px-4 py-3 ${
                      full ? 'opacity-50' : 'cursor-pointer hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={full}
                      onChange={() => toggle(a)}
                      className="h-4 w-4 accent-neutral-900"
                    />
                    <ActivityLine activity={a} />
                  </label>
                </li>
              );
            })}
            {candidates?.data?.length === 0 && (
              <li className="px-4 py-3 text-sm text-neutral-600">
                Nenhuma atividade publicada com imagem encontrada.
              </li>
            )}
          </ul>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              className="h-10 bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800"
              disabled={
                saving || !csrfToken || selected.length !== FREE_SAMPLE_COUNT
              }
              onClick={save}
            >
              {saving ? 'Salvando...' : `Salvar para ${monthLabel(month)}`}
            </Button>
            <Button
              variant="ghost"
              className="h-10 text-sm"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      {!editing && error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </Card>
  );
}
