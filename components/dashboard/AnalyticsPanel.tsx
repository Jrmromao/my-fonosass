'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

export function AnalyticsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics');
      return res.json();
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const stats = data?.data;
  if (!stats) return <p className="text-sm text-muted-foreground">Erro ao carregar dados.</p>;

  return (
    <div className="space-y-8">
      {/* Users */}
      <section className="border rounded-md p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Utilizadores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Total" value={stats.users.total} />
          <Metric label="Este mes" value={stats.users.thisMonth} />
          <Metric label="Pro" value={stats.users.pro} />
          <Metric label="Conversao" value={`${stats.users.conversionRate}%`} />
        </div>
      </section>

      {/* Library */}
      <section className="border rounded-md p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Biblioteca</h2>
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Total publicadas" value={stats.library.total} />
          <Metric label="Adicionadas esta semana" value={stats.library.addedThisWeek} />
          <Metric label="Pendentes de revisao" value={stats.library.pendingReview} highlight />
        </div>
      </section>

      {/* Downloads */}
      <section className="border rounded-md p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Downloads</h2>
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Este mes" value={stats.downloads.thisMonth} />
          <Metric label="Mes anterior" value={stats.downloads.lastMonth} />
          <Metric
            label="Crescimento"
            value={`${stats.downloads.growth > 0 ? '+' : ''}${stats.downloads.growth}%`}
            highlight={stats.downloads.growth > 0}
          />
        </div>

        {stats.downloads.topActivities.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Top atividades</p>
            <div className="space-y-1.5">
              {stats.downloads.topActivities.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate max-w-[70%]">{a.name}</span>
                  <span className="font-mono text-muted-foreground text-xs">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Phoneme Distribution */}
      <section className="border rounded-md p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Distribuicao por fonema</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {stats.phonemes.map((p: any) => (
            <div key={p.phoneme} className="text-center p-2 border rounded-md">
              <p className="font-mono text-sm font-medium text-foreground">/{p.phoneme}/</p>
              <p className="text-xs text-muted-foreground">{p.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LGPD Notice */}
      <p className="text-xs text-muted-foreground text-center">
        Dados agregados e anonimizados. Nenhuma informacao pessoal e exibida nesta pagina.
      </p>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? 'text-[hsl(var(--accent))]' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
