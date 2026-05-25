'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookOpen, Download, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const queryClient = new QueryClient();

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

function DashboardContent() {
  const { user } = useUser();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      return res.json();
    },
    staleTime: 60_000,
  });

  const { data: recent } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const res = await fetch('/api/activities/search?limit=5');
      return res.json();
    },
    staleTime: 30_000,
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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
            {greeting()}, {user?.firstName || 'Profissional'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Aqui esta o resumo da sua biblioteca de atividades.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Total de Atividades"
                value={stats?.data?.total || 0}
                icon={<FileText className="h-5 w-5 text-indigo-600" />}
              />
              <StatCard
                title="Fonemas Cobertos"
                value={stats?.data?.phonemes || 0}
                icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
              />
              <StatCard
                title="Pendentes de Revisao"
                value={stats?.data?.pending || 0}
                icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
              />
              <StatCard
                title="Downloads este Mes"
                value={stats?.data?.downloads || 0}
                icon={<Download className="h-5 w-5 text-pink-600" />}
              />
            </>
          )}
        </div>

        {/* Quick Actions + Recent */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    Atividades Recentes
                  </CardTitle>
                  <Link
                    href="/dashboard/games"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver todas
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recent?.data?.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recent.data.map((activity: any) => (
                      <div
                        key={activity.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              /{activity.phoneme}/
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {activity.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {activity.ageRange}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-4">
                    Nenhuma atividade ainda.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Acesso Rapido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickAction
                  href="/dashboard/games"
                  label="Biblioteca de Atividades"
                />
                <QuickAction
                  href="/dashboard/ai"
                  label="Gerar Exercicio com IA"
                />
                <QuickAction
                  href="/dashboard/resources"
                  label="Gerenciar Recursos"
                />
                <QuickAction href="/dashboard/profile" label="Meu Perfil" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </Link>
  );
}
