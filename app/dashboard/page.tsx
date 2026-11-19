'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import {
  CARD,
  TONES,
  type ToneClasses,
  toneForPhoneme,
} from '@/components/library/tones';
import { Skeleton } from '@/components/ui/skeleton';
import { phonemeLabel, subjectLabel } from '@/lib/activityLabels';
import type { LibraryResponse } from '@/lib/activityLibrary';
import { LIBRARY_PATH, libraryHref, phonemeSlug } from '@/lib/libraryUrl';
import { LANGUAGE_TOPICS } from '@/lib/phonemes';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
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
      <PageHeader
        band={TONES.sun.band}
        title={`${greeting()}, ${user?.firstName || 'Profissional'}`}
        description="Resumo da sua conta e das novidades da biblioteca."
        actions={
          <Link
            href={LIBRARY_PATH}
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-coral-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-coral-800 lg:self-auto"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Abrir a biblioteca
          </Link>
        }
      />

      <div className="space-y-4 p-4">
        {/* Per-user cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Baixadas este mês"
                value={String(s?.downloads ?? 0)}
                icon={<Download className="h-5 w-5" aria-hidden />}
                tone={TONES.sky}
              />
              <StatCard
                label="Novas esta semana"
                value={String(s?.newThisWeek ?? 0)}
                icon={<Sparkles className="h-5 w-5" aria-hidden />}
                tone={TONES.sun}
              />
              <StatCard
                label="Na biblioteca"
                value={String(s?.total ?? 0)}
                icon={<BookOpen className="h-5 w-5" aria-hidden />}
                tone={TONES.coral}
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
                icon={<CreditCard className="h-5 w-5" aria-hidden />}
                tone={TONES.violet}
              />
            </>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-sun-100 p-4 ring-1 ring-sun-300">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-300 text-violet-950">
                <ClipboardCheck className="h-4 w-4" aria-hidden />
              </span>
              <p className="text-sm font-medium text-violet-950">
                {s?.pending ?? 0} atividades pendentes de revisão
              </p>
            </div>
            <Link
              href="/dashboard/resources"
              className="inline-flex items-center gap-1 text-sm font-semibold text-coral-800 hover:underline"
            >
              Revisar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Recent */}
          <section className={`${CARD} space-y-4 p-6 lg:col-span-2`}>
            <div className="flex items-center justify-between">
              <SectionTitle dot={TONES.sky.dot}>
                Novidades na biblioteca
              </SectionTitle>
              <Link
                href={LIBRARY_PATH}
                className="text-sm font-semibold text-coral-800 hover:underline"
              >
                Ver todas
              </Link>
            </div>
            {recent?.data && recent.data.length > 0 ? (
              <ul className="space-y-2">
                {recent.data.map((activity) => {
                  const tone = toneForPhoneme(activity.phoneme);
                  return (
                    <li key={activity.id}>
                      <Link
                        href={topicHref(activity.phoneme, activity.type)}
                        className="flex items-center gap-4 rounded-xl p-2 transition-colors hover:bg-violet-50"
                      >
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold text-violet-950 ring-1 ${tone.tile}`}
                        >
                          {activity.phoneme
                            ? phonemeLabel(activity.phoneme).split(' ')[0]
                            : 'Aa'}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-neutral-900">
                            {activity.name}
                          </span>
                          <span className="block text-xs text-neutral-600">
                            {subjectLabel(activity.phoneme, activity.type)}
                          </span>
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-neutral-400"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-4 text-sm text-neutral-600">
                Nenhuma atividade ainda.
              </p>
            )}
          </section>

          {/* Quick links */}
          <section className={`${CARD} space-y-4 p-6`}>
            <SectionTitle dot={TONES.sun.dot}>Acesso rápido</SectionTitle>
            <div className="space-y-2">
              <QuickLink href={LIBRARY_PATH} label="Biblioteca de atividades" />
              {s && !s.subscribed && !isAdmin && (
                <QuickLink href={libraryHref()} label="Atividades grátis" />
              )}
              <QuickLink
                href="/dashboard/profile?tab=assinatura"
                label="Assinatura"
              />
              <QuickLink href="/dashboard/profile" label="Perfil" />
              {isAdmin && (
                <QuickLink href="/dashboard/resources" label="Recursos" />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Topic page of an activity: its phoneme, or its language topic. */
function topicHref(phoneme: string, type: string): string {
  if (phoneme) return `${LIBRARY_PATH}/${phonemeSlug(phoneme)}`;
  const topic = LANGUAGE_TOPICS.find((t) =>
    (t.types as string[]).includes(type)
  );
  return topic ? `${LIBRARY_PATH}/${topic.id}` : LIBRARY_PATH;
}

function SectionTitle({
  dot,
  children,
}: {
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-violet-950">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  small = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: ToneClasses;
  small?: boolean;
}) {
  return (
    <div className={`${CARD} flex items-center gap-4 p-5`}>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.chip}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className={`font-display font-bold text-violet-950 ${small ? 'text-lg' : 'text-2xl'}`}
        >
          {value}
        </p>
        <p className="text-xs text-neutral-600">{label}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-950 transition-colors hover:bg-cream-100"
    >
      {label}
      <ArrowRight className="h-4 w-4 text-neutral-600" aria-hidden />
    </Link>
  );
}
