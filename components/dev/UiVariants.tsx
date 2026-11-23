'use client';

import ExampleWord from '@/components/landing/ExampleWord';
import { PageHeader } from '@/components/layout/PageHeader';
import { LibraryTopicGroups } from '@/components/library/LibraryTopicGroups';
import { TONES, toneFor } from '@/components/library/tones';
import { Logo } from '@/components/brand/Logo';
import {
  BarChart2,
  BookOpen,
  Download,
  Eye,
  Lock,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';

// Mock-only design directions for /estilos. Nothing here talks to the API.

type VariantId = 'editorial' | 'noite' | 'ludico' | 'atual' | 'real';

const VARIANTS: { id: VariantId; name: string; pitch: string }[] = [
  {
    id: 'editorial',
    name: 'A · Editorial',
    pitch:
      'Calmo e sofisticado: fundo creme, muito espaço, títulos grandes, cor só onde importa. Lembra uma revista ou um app como Notion.',
  },
  {
    id: 'noite',
    name: 'B · Contraste',
    pitch:
      'Barra lateral em roxo-escuro do logo, conteúdo claro, cartões flutuando com sombra suave. Visual de software profissional (Linear, Stripe).',
  },
  {
    id: 'ludico',
    name: 'C · Lúdico refinado',
    pitch:
      'Cada grupo de fonemas com sua cor pastel, cantos bem arredondados, palavras-exemplo grandes. Alegre como o logo, mas organizado.',
  },
  {
    id: 'real',
    name: 'Biblioteca nova',
    pitch:
      'Os componentes reais da Biblioteca com contagens fictícias: cabeçalho creme, um cartão branco por grupo, cada grupo com sua cor.',
  },
  {
    id: 'atual',
    name: 'Atual',
    pitch: 'O que está no ar neste branch, para comparar.',
  },
];

interface MockTile {
  label: string;
  example: string;
  count: number;
  free?: boolean;
}
interface MockGroup {
  title: string;
  description: string;
  tiles: MockTile[];
}

const GROUPS: MockGroup[] = [
  {
    title: 'Pares surdo e sonoro',
    description: 'Mesmo ponto, com e sem vibração das pregas vocais.',
    tiles: [
      { label: '/p/', example: '[p]ato', count: 4 },
      { label: '/b/', example: '[b]ola', count: 1 },
      { label: '/t/', example: '[t]atu', count: 2 },
      { label: '/d/', example: '[d]ado', count: 0 },
      { label: '/s/', example: '[s]apo', count: 6, free: true },
      { label: '/z/', example: '[z]ebra', count: 8 },
    ],
  },
  {
    title: 'Nasais, laterais e vibrantes',
    description: 'O R forte e o r fraco têm blocos separados.',
    tiles: [
      { label: '/m/', example: '[m]acaco', count: 3 },
      { label: '/l/', example: '[l]ua', count: 0 },
      { label: '/lh/', example: 'pa[lh]aço', count: 2 },
      { label: '/R/ forte', example: '[r]ato', count: 5 },
    ],
  },
];

const ACTIVITIES = [
  {
    name: 'Bingo do /s/',
    word: '[s]apo',
    age: 'Pré-escolar',
    level: 'Iniciante',
    locked: false,
    free: true,
  },
  {
    name: 'Trilha da serpente',
    word: '[s]erpente',
    age: 'Idade escolar',
    level: 'Intermediário',
    locked: false,
    free: true,
  },
  {
    name: 'Memória do sol',
    word: '[s]ol',
    age: 'Pré-escolar',
    level: 'Iniciante',
    locked: true,
  },
  {
    name: 'Caça-palavras /s/',
    word: 'ca[s]a',
    age: 'Idade escolar',
    level: 'Avançado',
    locked: true,
  },
  {
    name: 'Dominó do sapato',
    word: '[s]apato',
    age: 'Pré-escolar',
    level: 'Intermediário',
    locked: true,
  },
];

const NAV = [
  { label: 'Painel', Icon: BarChart2 },
  { label: 'Biblioteca', Icon: BookOpen, active: true },
  { label: 'Perfil', Icon: User },
];

const plural = (n: number) => `${n} ${n === 1 ? 'atividade' : 'atividades'}`;

export function UiVariants() {
  const [variant, setVariant] = useState<VariantId>('editorial');
  const current = VARIANTS.find((v) => v.id === variant)!;

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">
              Rascunho de design · dados fictícios
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-neutral-900">
              Direções visuais para a área logada
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-600">
              {current.pitch}
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Variações"
            className="flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm"
          >
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={variant === v.id}
                onClick={() => setVariant(v.id)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  variant === v.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
          {variant === 'editorial' && <Editorial />}
          {variant === 'noite' && <Contraste />}
          {variant === 'ludico' && <Ludico />}
          {variant === 'atual' && <Atual />}
          {variant === 'real' && <Real />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Sheet({
  word,
  tone,
}: {
  word: string;
  /** Classes for the paper area. */
  tone: string;
}) {
  // Stand-in for the real page-1 preview.
  return (
    <div
      className={`relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 overflow-hidden ${tone}`}
    >
      <div className="grid grid-cols-3 gap-1.5 opacity-60">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-md bg-current/10 ring-1 ring-current/20"
          />
        ))}
      </div>
      <ExampleWord
        word={word}
        className="font-display text-xl font-bold"
        decorationClass="decoration-coral-500"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* A · Editorial                                                       */
/* ------------------------------------------------------------------ */

function Editorial() {
  return (
    <div className="flex min-h-[860px] bg-cream-50 text-neutral-900">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-cream-200 bg-white/70 px-4 py-6 md:flex">
        <div className="px-2">
          <Logo size="md" href={null} />
        </div>
        <nav className="mt-10 space-y-1">
          {NAV.map(({ label, Icon, active }) => (
            <span
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                active
                  ? 'bg-neutral-900 font-semibold text-white'
                  : 'text-neutral-600'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-cream-200 bg-cream-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
            Plano gratuito
          </p>
          <p className="mt-1 text-sm text-neutral-900">
            2 atividades grátis este mês.
          </p>
          <button className="mt-3 w-full rounded-lg bg-coral-700 py-2 text-sm font-semibold text-white">
            Assinar
          </button>
        </div>
      </aside>

      <main className="flex-1 px-8 py-10 lg:px-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-800">
          Biblioteca
        </p>
        <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-display text-4xl font-bold leading-tight text-violet-950">
            142 atividades, organizadas por fonema.
          </h2>
          <label className="relative block w-full max-w-xs">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"
              aria-hidden
            />
            <input
              placeholder="Buscar atividade"
              className="h-11 w-full rounded-full border border-cream-300 bg-white pl-9 pr-4 text-sm outline-none focus:border-neutral-900"
            />
          </label>
        </div>

        <div className="mt-12 space-y-12">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="mb-4 flex items-baseline justify-between border-b border-cream-200 pb-3">
                <h3 className="font-display text-lg font-bold text-violet-950">
                  {group.title}
                </h3>
                <p className="hidden text-sm text-neutral-600 md:block">
                  {group.description}
                </p>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {group.tiles.map((t) => (
                  <li key={t.label}>
                    <div
                      className={`flex h-32 flex-col justify-between rounded-xl p-4 transition-all ${
                        t.count
                          ? 'bg-white shadow-sm ring-1 ring-cream-200 hover:-translate-y-0.5 hover:shadow-md'
                          : 'bg-transparent ring-1 ring-dashed ring-cream-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono text-sm font-semibold ${t.count ? 'text-neutral-900' : 'text-neutral-400'}`}
                        >
                          {t.label}
                        </span>
                        {t.free && (
                          <span className="rounded-full bg-coral-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            Grátis
                          </span>
                        )}
                      </div>
                      <ExampleWord
                        word={t.example}
                        className={`font-display text-2xl font-bold ${t.count ? 'text-violet-950' : 'text-neutral-400'}`}
                        decorationClass={
                          t.count
                            ? 'decoration-coral-500'
                            : 'decoration-neutral-300'
                        }
                      />
                      <span className="text-xs text-neutral-600">
                        {t.count ? plural(t.count) : 'Em breve'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <div className="mb-4 flex items-baseline justify-between border-b border-cream-200 pb-3">
              <h3 className="font-display text-lg font-bold text-violet-950">
                Fonema /s/ · página do tema
              </h3>
              <span className="text-sm text-neutral-600">6 atividades</span>
            </div>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {ACTIVITIES.map((a) => (
                <li key={a.name} className="group">
                  <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-cream-200 transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
                    <Sheet word={a.word} tone="bg-white text-neutral-900" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    {a.name}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {a.age} · {a.level}
                    {a.locked && ' · Assinantes'}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B · Contraste                                                       */
/* ------------------------------------------------------------------ */

function Contraste() {
  return (
    <div className="flex min-h-[860px] bg-violet-50 text-neutral-900">
      <aside className="hidden w-60 shrink-0 flex-col bg-violet-950 px-4 py-6 text-violet-100 md:flex">
        <div className="rounded-xl bg-white/95 px-3 py-2">
          <Logo size="sm" href={null} />
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ label, Icon, active }) => (
            <span
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                active
                  ? 'bg-sun-300 font-semibold text-violet-950'
                  : 'text-violet-200 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </span>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/10 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun-300 text-sm font-bold text-violet-950">
            EM
          </span>
          <div className="text-sm">
            <p className="font-semibold text-white">Eliane Mota</p>
            <p className="text-xs text-violet-200">Plano Profissional</p>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div className="bg-white px-8 py-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-violet-950">
                Biblioteca
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                142 atividades · 18 novas este mês
              </p>
            </div>
            <label className="relative block w-full max-w-sm">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"
                aria-hidden
              />
              <input
                placeholder="Buscar por nome ou palavra"
                className="h-11 w-full rounded-xl bg-neutral-100 pl-9 pr-4 text-sm outline-none ring-violet-950 focus:bg-white focus:ring-2"
              />
            </label>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { k: 'Baixadas no mês', v: '24', Icon: Download },
              { k: 'Novas na semana', v: '6', Icon: Sparkles },
              { k: 'Favoritos', v: '11', Icon: BookOpen },
            ].map(({ k, v, Icon }) => (
              <div
                key={k}
                className="flex items-center gap-3 rounded-xl bg-violet-50 p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-950 text-sun-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xl font-bold text-violet-950">{v}</p>
                  <p className="text-xs text-neutral-600">{k}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-10 px-8 py-8">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="mb-1 font-display text-lg font-bold text-violet-950">
                {group.title}
              </h3>
              <p className="mb-4 text-sm text-neutral-600">
                {group.description}
              </p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {group.tiles.map((t) => (
                  <li key={t.label}>
                    <div
                      className={`relative flex h-28 flex-col justify-between rounded-2xl p-4 ${
                        t.count
                          ? 'bg-white shadow-[0_1px_2px_rgba(46,16,101,0.06),0_8px_24px_-12px_rgba(46,16,101,0.25)] transition-transform hover:-translate-y-0.5'
                          : 'bg-white/50'
                      }`}
                    >
                      <span
                        className={`font-mono text-sm font-semibold ${t.count ? 'text-violet-950' : 'text-neutral-400'}`}
                      >
                        {t.label}
                      </span>
                      <ExampleWord
                        word={t.example}
                        className={`font-display text-2xl font-bold ${t.count ? 'text-neutral-900' : 'text-neutral-400'}`}
                        decorationClass={
                          t.count
                            ? 'decoration-coral-500'
                            : 'decoration-neutral-300'
                        }
                      />
                      <span
                        className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          t.free
                            ? 'bg-coral-700 text-white'
                            : t.count
                              ? 'bg-sun-200 text-violet-950'
                              : 'text-neutral-400'
                        }`}
                      >
                        {t.free ? 'Grátis' : t.count ? t.count : 'Em breve'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h3 className="mb-4 font-display text-lg font-bold text-violet-950">
              Fonema /s/
            </h3>
            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {ACTIVITIES.map((a) => (
                <li key={a.name}>
                  <div className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(46,16,101,0.06),0_8px_24px_-12px_rgba(46,16,101,0.25)]">
                    <div className="relative">
                      <Sheet
                        word={a.word}
                        tone="bg-neutral-50 text-neutral-900"
                      />
                      <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-violet-950/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-violet-950">
                          <Eye className="h-3.5 w-3.5" aria-hidden /> Ver
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-coral-700 px-3 py-1.5 text-xs font-semibold text-white">
                          {a.locked ? (
                            <Lock className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <Download className="h-3.5 w-3.5" aria-hidden />
                          )}
                          {a.locked ? 'Assinar' : 'Baixar'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-neutral-900">
                        {a.name}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {a.age} · {a.level}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C · Lúdico refinado                                                 */
/* ------------------------------------------------------------------ */

// One pastel per group, all from the brand palette.
const GROUP_TONES = [
  {
    tile: 'bg-sky-100',
    ring: 'ring-sky-300',
    chip: 'bg-sky-300 text-violet-950',
  },
  {
    tile: 'bg-sun-100',
    ring: 'ring-sun-300',
    chip: 'bg-sun-300 text-violet-950',
  },
];

function Ludico() {
  return (
    <div className="flex min-h-[860px] bg-violet-100 text-neutral-900">
      <aside className="hidden w-64 shrink-0 flex-col p-4 md:flex">
        <div className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm">
          <Logo size="lg" href={null} />
          <nav className="mt-8 space-y-2">
            {NAV.map(({ label, Icon, active }) => (
              <span
                key={label}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
                  active ? 'bg-sun-300 text-violet-950' : 'text-neutral-600'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </span>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-coral-50 p-4 text-sm">
            <p className="font-display text-base font-bold text-violet-950">
              Experimente grátis
            </p>
            <p className="mt-1 text-neutral-600">
              2 atividades do /s/ liberadas.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:pl-0">
        <div className="relative overflow-hidden rounded-3xl bg-sun-300 px-8 py-10">
          <div
            className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-sun-200"
            aria-hidden
          />
          <div
            className="absolute bottom-[-60px] right-40 h-32 w-32 rounded-full bg-coral-300/60"
            aria-hidden
          />
          <div className="relative">
            <h2 className="font-display text-4xl font-black text-violet-950">
              Biblioteca
            </h2>
            <p className="mt-2 max-w-md text-violet-950/80">
              Escolha um fonema ou tema. Cada um tem atividades prontas para
              imprimir.
            </p>
            <label className="relative mt-6 block max-w-md">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600"
                aria-hidden
              />
              <input
                placeholder="Buscar atividade"
                className="h-12 w-full rounded-2xl bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-violet-950"
              />
            </label>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {GROUPS.map((group, gi) => {
            const tone = GROUP_TONES[gi % GROUP_TONES.length];
            return (
              <section key={group.title} className="rounded-3xl bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${tone.chip}`}
                  >
                    {group.tiles.filter((t) => t.count).length} de{' '}
                    {group.tiles.length}
                  </span>
                  <h3 className="font-display text-xl font-black text-violet-950">
                    {group.title}
                  </h3>
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {group.tiles.map((t) => (
                    <li key={t.label}>
                      <div
                        className={`flex h-32 flex-col items-center justify-center gap-1 rounded-2xl text-center transition-transform ${
                          t.count
                            ? `${tone.tile} ring-2 ${tone.ring} hover:-rotate-1 hover:scale-[1.03]`
                            : 'bg-neutral-50 text-neutral-400'
                        }`}
                      >
                        <ExampleWord
                          word={t.example}
                          className={`font-display text-3xl font-black ${t.count ? 'text-violet-950' : 'text-neutral-400'}`}
                          decorationClass={
                            t.count
                              ? 'decoration-coral-500'
                              : 'decoration-neutral-300'
                          }
                        />
                        <span className="font-mono text-xs font-semibold">
                          {t.label} · {t.count ? plural(t.count) : 'em breve'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <section className="rounded-3xl bg-white p-6">
            <h3 className="mb-4 font-display text-xl font-black text-violet-950">
              Fonema /s/
            </h3>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {ACTIVITIES.map((a) => (
                <li key={a.name} className="group">
                  <div className="overflow-hidden rounded-2xl ring-2 ring-sky-300 transition-transform group-hover:-translate-y-1">
                    <Sheet word={a.word} tone="bg-sky-100 text-violet-950" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-violet-950">
                      {a.name}
                    </p>
                    {a.free ? (
                      <span className="rounded-full bg-coral-700 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Grátis
                      </span>
                    ) : a.locked ? (
                      <Lock
                        className="h-3.5 w-3.5 text-neutral-600"
                        aria-label="Assinantes"
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-neutral-600">{a.age}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Atual (reference)                                                   */
/* ------------------------------------------------------------------ */

function Atual() {
  return (
    <div className="flex min-h-[860px] bg-violet-50 text-neutral-900">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-violet-200 bg-violet-100 md:flex">
        <div className="flex h-20 items-center justify-center border-b border-violet-200">
          <Logo size="nav" href={null} />
        </div>
        <nav className="space-y-1 px-3 py-4">
          {NAV.map(({ label, Icon, active }) => (
            <span
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                active
                  ? 'bg-sun-300 font-semibold text-violet-950 shadow-sm'
                  : 'text-neutral-600'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {label}
            </span>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <div className="border-b border-violet-200 px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-violet-950">
            Biblioteca
          </h2>
          <p className="mt-0.5 text-sm text-neutral-600">
            142 atividades, organizadas por fonema e tema
          </p>
        </div>
        <div className="space-y-10 px-6 py-6">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="mb-3 flex items-baseline gap-3">
                <h3 className="font-display text-lg font-bold text-violet-950">
                  {group.title}
                </h3>
                <p className="text-sm text-neutral-600">{group.description}</p>
              </div>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {group.tiles.map((t) => (
                  <li key={t.label}>
                    <div
                      className={`flex h-full flex-col justify-between gap-5 rounded-lg p-4 ${
                        t.count
                          ? 'border-2 border-sky-300 bg-sky-100'
                          : 'border border-neutral-200 bg-white'
                      }`}
                    >
                      <span className="flex justify-between">
                        <span
                          className={`font-mono font-semibold ${t.count ? '' : 'text-neutral-400'}`}
                        >
                          {t.label}
                        </span>
                        <span className="text-xs text-neutral-600">
                          {t.count ? plural(t.count) : 'Em breve'}
                        </span>
                      </span>
                      <ExampleWord
                        word={t.example}
                        className={`font-display text-2xl font-bold ${t.count ? '' : 'text-neutral-400'}`}
                        decorationClass={
                          t.count
                            ? 'decoration-coral-500'
                            : 'decoration-neutral-300'
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section>
            <h3 className="mb-3 font-display text-lg font-bold text-violet-950">
              Fonema /s/
            </h3>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {ACTIVITIES.map((a) => (
                <li
                  key={a.name}
                  className="overflow-hidden rounded-md border border-neutral-200 bg-white"
                >
                  <Sheet word={a.word} tone="bg-neutral-50 text-neutral-900" />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{a.name}</p>
                    <p className="text-xs text-neutral-600">
                      {a.age} · {a.level}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Real components with mock counts                                    */
/* ------------------------------------------------------------------ */

const MOCK_PHONEMES: Record<string, number> = {
  P: 4,
  B: 1,
  T: 2,
  K: 3,
  S: 6,
  Z: 8,
  M: 3,
  LH: 2,
  R_FORTE: 5,
  ARQ_S: 2,
  ENC_R: 1,
};
const MOCK_TYPES: Record<string, number> = {
  LANGUAGE: 4,
  COLOURS: 3,
  ANIMALS: 5,
  NUMBERS_AND_LETTERS: 2,
  ALPHABET: 1,
};

function Real() {
  return (
    <div className="bg-violet-100 pb-4">
      <PageHeader
        band={TONES.sun.band}
        title="Biblioteca"
        description="45 atividades prontas para imprimir. Escolha um fonema ou tema."
      />
      <div className="p-4">
        <LibraryTopicGroups
          phonemeCounts={MOCK_PHONEMES}
          typeCounts={MOCK_TYPES}
        />
      </div>
      <p className="px-6 pb-0 pt-4 text-xs font-semibold uppercase tracking-wider text-neutral-600">
        Cabeçalho da página de um tema (cor do grupo)
      </p>
      {(
        [
          'pares',
          'outros',
          'arquifonema',
          'encontro',
          'linguagem',
          'temas',
        ] as const
      ).map((g) => (
        <PageHeader
          key={g}
          band={toneFor(g).band}
          title={
            {
              pares: 'Fonema /s/',
              outros: 'Fonema /lh/',
              arquifonema: 'Arquifonema /S/',
              encontro: 'Encontro com /r/',
              linguagem: 'Linguagem',
              temas: 'Cores',
            }[g]
          }
          description="Texto do tema editado pelo administrador."
        />
      ))}
    </div>
  );
}
