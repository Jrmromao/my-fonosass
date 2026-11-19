'use client';

import { SubscriptionPanel } from '@/components/dashboard/SubscriptionPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { TONES } from '@/components/library/tones';
import { AdminPanel } from '@/components/settings/AdminPanel';
import { PrivacyPanel } from '@/components/settings/PrivacyPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface ProfileStats {
  data?: { downloads?: number; subscribed?: boolean; isAdmin?: boolean };
}

interface Preferences {
  ageRanges?: string[];
  phonemes?: string[];
}

interface Section {
  value: string;
  label: string;
  title: string;
  description: string;
}

const GROUPS: { title: string; sections: Section[] }[] = [
  {
    title: 'Conta',
    sections: [
      {
        value: 'conta',
        label: 'Perfil',
        title: 'Perfil',
        description: 'Seus dados de acesso e preferências.',
      },
      {
        value: 'assinatura',
        label: 'Assinatura',
        title: 'Assinatura',
        description: 'Seu plano, renovação e forma de pagamento.',
      },
    ],
  },
  {
    title: 'Privacidade',
    sections: [
      {
        value: 'privacidade',
        label: 'Privacidade',
        title: 'Privacidade',
        description: 'Suas preferências e seus direitos sobre os seus dados.',
      },
    ],
  },
];

// Admin only (menu role, which "Ver como" downgrades; the APIs check the
// real role on the server).
const ADMIN_GROUP = {
  title: 'Administração',
  sections: [
    {
      value: 'administracao',
      label: 'Administração',
      title: 'Administração',
      description: 'Ferramentas de teste e atividades grátis do mês.',
    },
  ],
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<Skeleton className="m-8 h-48" />}>
      <ProfileSettings />
    </Suspense>
  );
}

function ProfileSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get('tab');
  const { role } = useUserRole();
  const isAdmin = role === 'ADMIN';
  const groups = isAdmin ? [...GROUPS, ADMIN_GROUP] : GROUPS;
  const visible = groups.flatMap((g) => g.sections);
  const current = visible.find((s) => s.value === requested) ?? visible[0];

  const setSection = (value: string) => {
    const qs = value === 'conta' ? '' : `?tab=${value}`;
    router.replace(`/dashboard/profile${qs}`, { scroll: false });
  };

  return (
    <div className="h-full">
      <PageHeader
        band={TONES.cream.band}
        eyebrow="Perfil"
        title="Configurações"
        description="Gerencie sua conta, assinatura e privacidade."
      />

      <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 md:flex-row md:gap-6">
        <nav
          aria-label="Seções de configurações"
          // Stays in view while the section scrolls (desktop; on mobile it is a
          // horizontal strip above the content).
          className="h-fit rounded-2xl bg-white p-3 shadow-sm ring-1 ring-violet-200/60 md:sticky md:top-6 md:w-56 md:shrink-0 md:self-start"
        >
          {groups.map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                {group.title}
              </p>
              <ul className="flex gap-1 overflow-x-auto md:flex-col">
                {group.sections.map((section) => {
                  const active = section.value === current.value;
                  return (
                    <li key={section.value} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setSection(section.value)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-950',
                          active
                            ? 'bg-sun-300 font-semibold text-violet-950'
                            : 'text-neutral-600 hover:bg-violet-50 hover:text-violet-950'
                        )}
                      >
                        {section.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <section className="min-w-0 flex-1 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-violet-950">
            {current.title}
          </h2>
          <p className="mt-1 mb-6 text-sm text-neutral-600">
            {current.description}
          </p>

          {current.value === 'conta' && (
            <AccountSection onSection={setSection} />
          )}
          {current.value === 'assinatura' && <SubscriptionPanel />}
          {current.value === 'privacidade' && <PrivacyPanel />}
          {current.value === 'administracao' && isAdmin && <AdminPanel />}
        </section>
      </div>
    </div>
  );
}

function ReadOnlyField({
  id,
  label,
  value,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-neutral-900">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        readOnly
        className="bg-neutral-50 text-neutral-900"
      />
      {hint && <p className="text-sm text-neutral-600">{hint}</p>}
    </div>
  );
}

function AccountSection({ onSection }: { onSection: (tab: string) => void }) {
  const { user, isLoaded } = useUser();

  const { data: stats } = useQuery<ProfileStats>({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Falha ao carregar o perfil');
      return res.json();
    },
    staleTime: 60_000,
  });

  if (!isLoaded) {
    return <Skeleton className="h-64 w-full rounded-md" />;
  }

  const name = user?.fullName || 'Usuário';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const preferences = user?.unsafeMetadata?.preferences as
    | Preferences
    | undefined;
  const hasPreferences =
    !!preferences &&
    ((preferences.ageRanges?.length ?? 0) > 0 ||
      (preferences.phonemes?.length ?? 0) > 0);

  const planLabel = stats?.data?.subscribed
    ? 'Profissional'
    : stats?.data?.isAdmin
      ? 'Administrador'
      : 'Sem assinatura';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
    : '—';

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-neutral-900">
          Informações gerais
        </h3>
        <p className="mb-3 text-sm text-neutral-600">
          Dados da sua conta no Almanaque da Fala.
        </p>
        <div className="space-y-5 rounded-2xl bg-white shadow-sm ring-1 ring-violet-200/60 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-sun-300 text-lg font-semibold text-violet-950">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-neutral-900">{name}</p>
              <p className="text-sm text-neutral-600">{email}</p>
            </div>
          </div>

          <ReadOnlyField id="profile-name" label="Nome" value={name} />
          <ReadOnlyField
            id="profile-email"
            label="E-mail"
            value={email}
            hint="O e-mail está ligado à sua conta e não pode ser alterado aqui."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-900">
                Plano
              </Label>
              <div className="flex h-10 items-center justify-between rounded-md border border-input bg-neutral-50 px-3">
                <span className="text-sm text-neutral-900">{planLabel}</span>
                <button
                  type="button"
                  onClick={() => onSection('assinatura')}
                  className="text-sm font-medium text-coral-800 hover:underline"
                >
                  {stats?.data?.subscribed ? 'Gerenciar' : 'Ver planos'}
                </button>
              </div>
            </div>
            <ReadOnlyField
              id="profile-member-since"
              label="Membro desde"
              value={memberSince}
            />
          </div>

          <ReadOnlyField
            id="profile-downloads"
            label="Atividades baixadas este mês"
            value={String(stats?.data?.downloads ?? 0)}
          />
        </div>
      </div>

      {hasPreferences && (
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            Preferências
          </h3>
          <p className="mb-3 text-sm text-neutral-600">
            O que você escolheu ao começar.
          </p>
          <div className="space-y-4 rounded-2xl bg-white shadow-sm ring-1 ring-violet-200/60 p-6">
            {(preferences?.ageRanges?.length ?? 0) > 0 && (
              <div>
                <p className="mb-1.5 text-sm text-neutral-600">
                  Faixas etárias
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preferences?.ageRanges?.map((age) => (
                    <Badge key={age} variant="outline" className="text-xs">
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(preferences?.phonemes?.length ?? 0) > 0 && (
              <div>
                <p className="mb-1.5 text-sm text-neutral-600">Fonemas</p>
                <div className="flex flex-wrap gap-1.5">
                  {preferences?.phonemes?.map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">
                      /{p.toLowerCase()}/
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
