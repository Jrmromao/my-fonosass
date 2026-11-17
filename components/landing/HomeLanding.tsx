import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { MIN_ACTIVITIES_TO_SHOW_COUNT } from '@/lib/phonemes';
import { FREE_PHONEME, PRO_PLAN, formatBRL } from '@/lib/pricing';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import FreePhonemeTile, { type FreePreviewActivity } from './FreePhonemeTile';

// Founder details shown in the "who makes it" section.
// TODO before launch: add the photo to public/images/ and set `photo`,
// and replace `crfa` with the real registration (format: "CRFa 2-12345").
const FOUNDER = {
  name: 'Eliane Mota',
  role: 'Fonoaudióloga clínica, atendimento infantil',
  photo: '/images/eliane_head.png' as string | null,
  crfa: 'CRFa 3-10032',
};

export interface PhonemeCount {
  phoneme: string;
  count: number;
}

export interface SampleActivity {
  id: string;
  title: string;
  phoneme: string;
  ageLabel: string;
  difficultyLabel: string;
}

interface HomeLandingProps {
  phonemes: PhonemeCount[];
  samples: SampleActivity[];
  freePreview: FreePreviewActivity[];
  totalActivities: number;
}

const yearlySavings = Math.round(
  ((PRO_PLAN.monthlyPrice * 12 - PRO_PLAN.yearlyPrice) /
    (PRO_PLAN.monthlyPrice * 12)) *
    100
);

// Base text color, inherited by headings. Testing two near-blacks:
// 'slate' = navy near-black (#0f172a), 'indigo' = purple near-black (#1e1b4b)
// that ties headings to the lavender background. Flip to compare.
const INK: 'slate' | 'indigo' = 'slate';
const INK_CLASS = { slate: 'text-slate-900', indigo: 'text-indigo-950' }[INK];

export default function HomeLanding({
  phonemes,
  samples,
  freePreview,
  totalActivities,
}: HomeLandingProps) {
  const freeLabel = `/${FREE_PHONEME.toLowerCase()}/`;
  // The free phoneme is only promoted once it has published activities.
  const freeAvailable = phonemes.some(
    (p) => p.phoneme === FREE_PHONEME && p.count > 0
  );
  const availableCount = phonemes.filter((p) => p.count > 0).length;
  const hasComingSoon = phonemes.some((p) => p.count === 0);
  const faqs = buildFaqs(freeAvailable, freeLabel);

  return (
    <div className={`min-h-screen bg-violet-100 ${INK_CLASS}`}>
      <SharedNavbar tone="lavender" />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7">
              <h1 className="font-display text-[2.1rem] md:text-[3.25rem] font-bold leading-[1.08]">
                Atividades de fonoaudiologia infantil, organizadas por fonema.
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-[34rem]">
                Escolha o fonema, a faixa etária e imprima. Materiais criados e
                revisados por fonoaudióloga, com novidades toda semana.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href="#planos"
                  className="inline-flex items-center gap-2 rounded-md bg-coral-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2"
                >
                  Ver planos <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="#biblioteca"
                  className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700"
                >
                  {freeAvailable
                    ? `Experimentar o ${freeLabel} grátis`
                    : 'Ver a biblioteca'}
                </Link>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                {freeAvailable &&
                  `Todas as atividades do fonema ${freeLabel} são grátis. `}
                Assinatura a partir de {formatBRL(PRO_PLAN.yearlyPrice / 12)}{' '}
                por mês no plano anual.
              </p>
            </div>

            <div className="lg:col-span-5">
              <SheetStack samples={samples} />
            </div>
          </div>
        </section>

        {/* Library preview */}
        <section
          id="biblioteca"
          className="border-t border-violet-200 bg-violet-50 py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <h2 className="font-display text-3xl font-bold max-w-md leading-tight">
                {totalActivities >= MIN_ACTIVITIES_TO_SHOW_COUNT
                  ? `${availableCount} fonemas, ${totalActivities} atividades prontas.`
                  : `${phonemes.length} fonemas, novas atividades toda semana.`}
              </h2>
              <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
                Cada fonema tem atividades para pré-escolares, crianças em idade
                escolar e adolescentes, em três níveis de dificuldade.
              </p>
            </div>

            <ul className="grid grid-cols-4 sm:grid-cols-8 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
              {phonemes.map((p) =>
                p.count === 0 ? (
                  <li key={p.phoneme}>
                    <div
                      aria-label={`Fonema /${p.phoneme.toLowerCase()}/, em breve`}
                      className="flex h-full flex-col items-start justify-between gap-6 bg-slate-50 p-4"
                    >
                      <span className="font-mono text-2xl font-semibold text-slate-300">
                        /{p.phoneme.toLowerCase()}/
                      </span>
                      <span className="text-xs text-slate-400">Em breve</span>
                    </div>
                  </li>
                ) : p.phoneme === FREE_PHONEME ? (
                  <li key={p.phoneme}>
                    <FreePhonemeTile
                      phoneme={p.phoneme}
                      count={p.count}
                      activities={freePreview}
                    />
                  </li>
                ) : (
                  <li key={p.phoneme}>
                    <Link
                      href="/sign-up"
                      className="group flex h-full flex-col items-start justify-between gap-6 bg-white p-4 transition-colors hover:bg-slate-900"
                    >
                      <span className="font-mono text-2xl font-semibold text-slate-900 group-hover:text-white">
                        /{p.phoneme.toLowerCase()}/
                      </span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-300">
                        {p.count} {p.count === 1 ? 'atividade' : 'atividades'}
                      </span>
                    </Link>
                  </li>
                )
              )}
            </ul>
            {freeAvailable ? (
              <p className="mt-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">
                  Experimente grátis:
                </span>{' '}
                clique no{' '}
                <span className="font-mono font-semibold text-coral-700">
                  {freeLabel}
                </span>{' '}
                para ver exemplos das atividades. Todas as atividades desse
                fonema são grátis com sua conta; os demais fazem parte da
                assinatura.
              </p>
            ) : (
              hasComingSoon && (
                <p className="mt-4 text-sm text-slate-600">
                  Os fonemas marcados como &ldquo;Em breve&rdquo; estão em
                  produção e entram na biblioteca nas próximas semanas, sem
                  custo extra para assinantes.
                </p>
              )
            )}
          </div>
        </section>

        {/* Who makes it */}
        <section className="py-20">
          <figure className="max-w-3xl mx-auto px-6">
            <p className="mb-6 text-sm font-medium text-slate-500">
              Quem cria os materiais
            </p>
            <blockquote className="font-display text-2xl md:text-[1.7rem] font-semibold leading-snug text-slate-800">
              <p>
                &ldquo;Cada atividade é pensada para a sessão: o fonema na
                posição certa, palavras do universo da criança e uma folha
                colorida que ela tem vontade de recortar, colar e falar.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-5">
              {FOUNDER.photo ? (
                <Image
                  src={FOUNDER.photo}
                  alt={`Foto de ${FOUNDER.name}`}
                  width={192}
                  height={192}
                  className="h-24 w-24 shrink-0 rounded-full object-cover object-[50%_30%]"
                />
              ) : (
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-400"
                  aria-hidden
                >
                  Foto
                </div>
              )}
              <div>
                <p className="font-semibold text-lg text-slate-900">
                  {FOUNDER.name}
                </p>
                <p className="text-sm text-slate-500">
                  {FOUNDER.role} · {FOUNDER.crfa}
                </p>
              </div>
            </figcaption>
          </figure>
        </section>

        {/* Pricing */}
        <section
          id="planos"
          className="border-t border-violet-200 bg-violet-50 py-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-display text-3xl font-bold">
              Um plano. Sem créditos, sem adicionais.
            </h2>
            <p className="mt-3 text-slate-600">
              Acesso completo à biblioteca, com novas atividades toda semana.
            </p>

            <div className="mt-10 rounded-lg border-2 border-slate-900 bg-white p-7 md:p-9">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {PRO_PLAN.name}
                  </p>
                  <PlanFeatures features={PRO_PLAN.features} />
                </div>

                <div className="flex flex-col gap-3">
                  <PriceOption
                    label="Mensal"
                    price={formatBRL(PRO_PLAN.monthlyPrice)}
                    period="/mês"
                  />
                  <PriceOption
                    label="Anual"
                    price={formatBRL(PRO_PLAN.yearlyPrice)}
                    period="/ano"
                    note={`Equivale a ${formatBRL(PRO_PLAN.yearlyPrice / 12)} por mês, ${yearlySavings}% de desconto`}
                  />
                  <Link
                    href="/sign-up"
                    className="mt-3 block rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    Assinar
                  </Link>
                  <p className="text-center text-xs text-slate-500">
                    Cancele quando quiser, sem multa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-display text-3xl font-bold mb-8">
              Perguntas frequentes
            </h2>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      className="text-xl leading-none text-slate-400 transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

function PriceOption({
  label,
  price,
  period,
  note,
}: {
  label: string;
  price: string;
  period: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className="font-display text-2xl font-bold text-slate-900">
          {price}
          <span className="ml-1 font-sans text-sm font-normal text-slate-500">
            {period}
          </span>
        </span>
      </div>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

function PlanFeatures({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-sm">
          <Check
            size={16}
            className="mt-0.5 shrink-0 text-slate-900"
            aria-hidden
          />
          <span className="text-slate-700">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

// Typographic stand-in for printed activity sheets, built from real catalog
// entries. Replace with real thumbnails once curated preview images exist.
function SheetStack({ samples }: { samples: SampleActivity[] }) {
  if (samples.length === 0) return null;

  const placements = [
    'left-0 top-10 rotate-[-5deg]',
    'left-[30%] top-0 rotate-[2deg]',
    'left-[15%] top-[11rem] rotate-[-1.5deg] hidden sm:block',
  ];

  return (
    <div
      className="relative mx-auto h-[22rem] sm:h-[30rem] max-w-lg"
      aria-hidden
    >
      {samples.slice(0, 3).map((sample, i) => (
        <div
          key={sample.id}
          className={`absolute w-56 sm:w-60 rounded-sm border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.18)] ${placements[i]}`}
          style={{ zIndex: i + 1 }}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono text-sm font-semibold text-slate-900">
              /{sample.phoneme.toLowerCase()}/
            </span>
            <span>{sample.ageLabel}</span>
          </div>
          <p className="mt-4 font-display text-xl font-bold leading-tight">
            {sample.title}
          </p>
          <p className="text-xs text-slate-500">{sample.difficultyLabel}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="aspect-square rounded border border-dashed border-slate-300"
              />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-px bg-slate-200" />
            <div className="h-px bg-slate-200" />
          </div>
          <p className="mt-4 text-[10px] text-slate-400">
            almanaquedafala.com.br
          </p>
        </div>
      ))}
    </div>
  );
}

function buildFaqs(freeAvailable: boolean, freeLabel: string) {
  return [
    {
      question: 'Quem cria os materiais?',
      answer:
        'Todas as atividades são criadas e revisadas por fonoaudióloga com experiência clínica em atendimento infantil. Nada é publicado sem revisão.',
    },
    {
      question: 'Para quais idades são as atividades?',
      answer:
        'Há atividades para pré-escolares, crianças em idade escolar e adolescentes, em três níveis de dificuldade: iniciante, intermediário e avançado.',
    },
    ...(freeAvailable
      ? [
          {
            question: 'Posso experimentar antes de assinar?',
            answer: `Sim. Todas as atividades do fonema ${freeLabel} são grátis: basta criar sua conta. Os demais fonemas fazem parte da assinatura.`,
          },
        ]
      : []),
    {
      question: 'O que está incluído na assinatura?',
      answer:
        'Acesso a todas as atividades da biblioteca, com downloads ilimitados prontos para impressão. Novas atividades são adicionadas toda semana sem custo extra.',
    },
    {
      question: 'Posso cancelar a assinatura?',
      answer:
        'Sim, a qualquer momento e sem multa. O acesso continua ativo até o fim do período já pago.',
    },
  ];
}
