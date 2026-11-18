'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  label,
  phonemeLabel,
} from '@/lib/activityLabels';
import type { LibraryResponse } from '@/lib/activityLibrary';
import { libraryHref } from '@/lib/libraryUrl';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Download,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardStats {
  success: boolean;
  data?: {
    total: number;
    phonemes: number;
    pending: number;
    downloads: number;
    subscribed: boolean;
    newThisWeek: number;
    isAdmin: boolean;
  };
}

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !user.unsafeMetadata?.onboarded) {
      router.replace('/dashboard/onboarding');
    }
  }, [user, router]);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Falha ao carregar o painel');
      return res.json();
    },
  });

  const { data: recent } = useQuery<LibraryResponse>({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/search?limit=5');
      if (!res.ok) throw new Error('Falha ao carregar atividades');
      return res.json();
    },
  });

  const s = stats?.data;
  const isAdmin = !!s?.isAdmin;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="h-full">
      <div className="border-b border-border px-6 py-6">
        <h1 className="text-xl font-semibold text-neutral-900 font-display">
          {greeting()}, {user?.firstName || 'Profissional'}
        </h1>
        <p className="text-sm text-neutral-600 mt-0.5">
          Resumo da sua conta e das novidades da biblioteca.
        </p>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Per-user cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))
          ) : (
            <>
              <StatCard
                label="Baixadas este mês"
                value={String(s?.downloads ?? 0)}
                icon={<Download className="h-4 w-4" aria-hidden />}
              />
              <StatCard
                label="Novas esta semana"
                value={String(s?.newThisWeek ?? 0)}
                icon={<Sparkles className="h-4 w-4" aria-hidden />}
              />
              <StatCard
                label="Na biblioteca"
                value={String(s?.total ?? 0)}
                icon={<BookOpen className="h-4 w-4" aria-hidden />}
              />
              <StatCard
                label="Plano"
                value={
                  s?.subscribed
                    ? 'Profissional'
                    : isAdmin
                      ? 'Administrador'
                      : 'Sem assinatura'
                }
                small
                icon={<CreditCard className="h-4 w-4" aria-hidden />}
              />
            </>
          )}
        </div>

        {isAdmin && (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardCheck
                className="h-4 w-4 text-neutral-600"
                aria-hidden
              />
              <p className="text-sm text-neutral-900">
                {s?.pending ?? 0} atividades pendentes de revisão
              </p>
            </div>
            <Link
              href="/dashboard/resources"
              className="text-sm font-medium text-coral-800 hover:underline"
            >
              Revisar
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent */}
          <section className="lg:col-span-2 border border-neutral-200 rounded-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
                Recentes
              </h2>
              <Link
                href="/dashboard/biblioteca"
                className="text-sm font-medium text-coral-800 hover:underline"
              >
                Ver todas
              </Link>
            </div>
            {recent?.data && recent.data.length > 0 ? (
              <div className="divide-y divide-border">
                {recent.data.map((activity) => (
                  <div
                    key={activity.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {activity.name}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs font-mono text-neutral-600">
                          {phonemeLabel(activity.phoneme)}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {label(DIFFICULTY_LABELS, activity.difficulty)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-600 text-right">
                      {label(AGE_LABELS, activity.ageRange)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-600 py-4">
                Nenhuma atividade ainda.
              </p>
            )}
          </section>

          {/* Quick links */}
          <section className="border border-neutral-200 rounded-md p-6 space-y-4">
            <h2 className="text-sm font-medium text-neutral-600 uppercase tracking-wide">
              Acesso rápido
            </h2>
            <div className="space-y-2">
              <QuickLink
                href="/dashboard/biblioteca"
                label="Biblioteca de atividades"
              />
              {s && !s.subscribed && !isAdmin && (
                <QuickLink href={libraryHref()} label="Atividades grátis" />
              )}
              <QuickLink
                href="/dashboard/profile?tab=assinatura"
                label="Assinatura"
              />
              <QuickLink href="/dashboard/profile" label="Perfil" />
              {isAdmin && (
                <>
                  <QuickLink href="/dashboard/ai" label="Gerar exercício" />
                  <QuickLink href="/dashboard/resources" label="Recursos" />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  small = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  small?: boolean;
}) {
  return (
    <div className="border border-neutral-200 rounded-md p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-600 uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`font-bold text-neutral-900 mt-1 ${small ? 'text-lg' : 'text-2xl'}`}
          >
            {value}
          </p>
        </div>
        <div className="text-neutral-600">{icon}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2.5 rounded-md border border-border text-sm text-neutral-900 hover:bg-neutral-50 transition-colors"
    >
      {label}
    </Link>
  );
}
