'use client';

import { SubscriptionPanel } from '@/components/dashboard/SubscriptionPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  TONES,
  type ToneClasses,
  toneForPhoneme,
} from '@/components/library/tones';
import { phonemeLabel } from '@/lib/activityLabels';
import { AdminPanel } from '@/components/settings/AdminPanel';
import { PrivacyPanel } from '@/components/settings/PrivacyPanel';
import { useUserRole } from '@/hooks/useUserRole';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
        band={TONES.sun.band}
        title="Configurações"
        description="Gerencie sua conta, assinatura e privacidade."
      />

      <div className="flex flex-col gap-4 p-4 md:flex-row">
        <nav
          aria-label="Seções de configurações"
          // Stays in view while the section scrolls (desktop; on mobile it is a
          // horizontal strip above the content).
          className="h-fit rounded-3xl bg-white p-3 md:sticky md:top-4 md:w-56 md:shrink-0 md:self-start"
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
                          'w-full rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-950',
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

        <section className="min-w-0 max-w-3xl flex-1 rounded-3xl bg-white p-6">
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
    return <Skeleton className="h-64 w-full rounded-3xl" />;
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
  const ageRanges = preferences?.ageRanges ?? [];
  const phonemes = preferences?.phonemes ?? [];

  const subscribed = !!stats?.data?.subscribed;
  const planLabel = subscribed
    ? 'Profissional'
    : stats?.data?.isAdmin
      ? 'Administrador'
      : 'Sem assinatura';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
    : '—';
  const downloads = stats?.data?.downloads ?? 0;

  return (
    <div className="space-y-6">
      {/* Who you are */}
      <div className="relative overflow-hidden rounded-3xl bg-sun-200 p-6">
        <span
          className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/40"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center gap-4">
          <Avatar className="h-16 w-16 ring-4 ring-white">
            <AvatarFallback className="bg-white font-display text-xl font-black text-violet-950">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-black text-violet-950">
              {name}
            </p>
            <p className="truncate text-sm text-violet-950/80">{email}</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-950">
            {planLabel}
          </span>
        </div>
      </div>

      {/* At a glance */}
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile
          tone={TONES.sky}
          label="Baixadas este mês"
          value={String(downloads)}
        />
        <InfoTile tone={TONES.violet} label="Plano" value={planLabel}>
          <button
            type="button"
            onClick={() => onSection('assinatura')}
            className="mt-2 text-sm font-semibold text-coral-800 hover:underline"
          >
            {subscribed ? 'Gerenciar assinatura' : 'Ver planos'}
          </button>
        </InfoTile>
        <InfoTile tone={TONES.cream} label="Membro desde" value={memberSince} />
      </div>

      {/* Account details: read-only, so a list, not a form */}
      <div>
        <h3 className="mb-2 font-display text-base font-bold text-violet-950">
          Dados da conta
        </h3>
        <dl className="divide-y divide-violet-200/70 rounded-2xl bg-violet-50 px-5">
          <DetailRow label="Nome" value={name} />
          <DetailRow
            label="E-mail"
            value={email}
            hint="Ligado ao seu login; não pode ser alterado aqui."
          />
        </dl>
      </div>

      {(ageRanges.length > 0 || phonemes.length > 0) && (
        <div>
          <h3 className="font-display text-base font-bold text-violet-950">
            Preferências
          </h3>
          <p className="mb-3 text-sm text-neutral-600">
            O que você escolheu ao começar.
          </p>
          <div className="space-y-4 rounded-2xl bg-violet-50 p-5">
            {ageRanges.length > 0 && (
              <ChipGroup label="Faixas etárias">
                {ageRanges.map((age) => (
                  <span
                    key={age}
                    className="rounded-full bg-sun-300 px-3 py-1 text-xs font-semibold text-violet-950"
                  >
                    {/* Stored as shown in onboarding, e.g. "4-5 anos". */}
                    {age}
                  </span>
                ))}
              </ChipGroup>
            )}
            {phonemes.length > 0 && (
              <ChipGroup label="Fonemas">
                {phonemes.map((code) => (
                  <span
                    key={code}
                    className={`rounded-full px-3 py-1 font-mono text-xs font-semibold text-violet-950 ring-1 ${toneForPhoneme(code).tile}`}
                  >
                    {phonemeLabel(code)}
                  </span>
                ))}
              </ChipGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  tone,
  label: title,
  value,
  children,
}: {
  tone: ToneClasses;
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl p-4 ring-2 ${tone.tile}`}>
      <p className="text-xs font-semibold text-violet-950/80">{title}</p>
      <p className="mt-1 font-display text-2xl font-black text-violet-950">
        {value}
      </p>
      {children}
    </div>
  );
}

function DetailRow({
  label: title,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-neutral-600">{title}</dt>
      <dd className="min-w-0">
        <span className="block break-words text-sm text-neutral-900">
          {value}
        </span>
        {hint && <span className="text-xs text-neutral-600">{hint}</span>}
      </dd>
    </div>
  );
}

function ChipGroup({
  label: title,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-neutral-600">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
