'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Download, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.unsafeMetadata?.onboarded) {
      router.replace('/dashboard/onboarding');
    }
  }, [user, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      return res.json();
    },
  });

  const { data: recent } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/search?limit=5');
      return res.json();
    },
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <h1 className="text-lg font-semibold text-foreground">
          {greeting()}, {user?.firstName || 'Profissional'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resumo da sua biblioteca de atividades.
        </p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))
          ) : (
            <>
              <StatCard label="Atividades" value={stats?.data?.total || 0} icon={<FileText className="h-4 w-4" />} />
              <StatCard label="Fonemas" value={stats?.data?.phonemes || 0} icon={<BookOpen className="h-4 w-4" />} />
              <StatCard label="Pendentes" value={stats?.data?.pending || 0} icon={<TrendingUp className="h-4 w-4" />} />
              <StatCard label="Downloads" value={stats?.data?.downloads || 0} icon={<Download className="h-4 w-4" />} />
            </>
          )}
        </div>

        {/* Recent + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent */}
          <section className="lg:col-span-2 border rounded-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recentes</h2>
              <Link href="/dashboard/games" className="text-xs text-accent-foreground hover:underline" style={{ color: 'hsl(var(--accent))' }}>
                Ver todas
              </Link>
            </div>
            {recent?.data?.length > 0 ? (
              <div className="divide-y divide-border">
                {recent.data.map((activity: any) => (
                  <div key={activity.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs font-mono text-muted-foreground">/{activity.phoneme}/</span>
                        <span className="text-xs text-muted-foreground">{activity.difficulty}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.ageRange}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Nenhuma atividade ainda.</p>
            )}
          </section>

          {/* Quick Actions */}
          <section className="border rounded-md p-6 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Acesso rápido</h2>
            <div className="space-y-2">
              <QuickLink href="/dashboard/games" label="Biblioteca de Atividades" />
              <QuickLink href="/dashboard/ai" label="Gerar Exercício" />
              <QuickLink href="/dashboard/resources" label="Gerenciar Recursos" />
              <QuickLink href="/dashboard/profile" label="Meu Perfil" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{value}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2.5 rounded-md border border-border text-sm text-foreground hover:bg-muted transition-colors"
    >
      {label}
    </Link>
  );
}
