import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { freeOfferText } from '@/lib/freeOffer';
import { PRO_PLAN, YEARLY_DISCOUNT, formatBRL } from '@/lib/pricing';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AuthAwareLink from './AuthAwareLink';
import { type FreePreviewActivity } from './FreePhonemeTile';
import PhonemeLibrary, {
  type PhonemeCount,
  type TopicCount,
} from './PhonemeLibrary';

export type { PhonemeCount, TopicCount };

// Founder details shown in the "who makes it" section.
const FOUNDER = {
  name: 'Eliane Mota',
  role: 'Fonoaudióloga clínica, atendimento infantil',
  photo: '/images/eliane_head.png' as string | null,
  crfa: 'CRFa 3-10032',
};

export interface SampleActivity {
  id: string;
  title: string;
  phoneme: string;
}

interface HomeLandingProps {
  phonemes: PhonemeCount[];
  languageTopics: TopicCount[];
  samples: SampleActivity[];
  freePreview: FreePreviewActivity[];
  totalActivities: number;
}

const yearlySavings = YEARLY_DISCOUNT.percent;

// Headings inherit the logo's dark purple (violet-950).
const INK_CLASS = 'text-violet-950';

export default function HomeLanding({
  phonemes,
  languageTopics,
  samples,
  freePreview,
  totalActivities,
}: HomeLandingProps) {
  // "2 atividades do fonema /s/ grátis" (default) or "2 atividades grátis"
  // when an admin chose other activities for the month.
  const freeText = freeOfferText(freePreview);
  // The free phoneme is only promoted once it has published activities.
  // Free offer: this month's free activities, after creating an account.
  const freeAvailable = freePreview.length > 0;
  const faqs = buildFaqs(freeAvailable, freeText);

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
              <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-[34rem]">
                Escolha o fonema e imprima. Materiais criados e revisados por
                fonoaudióloga.
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
                  className="text-sm font-medium text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700"
                >
                  {freeAvailable
                    ? 'Ver as atividades grátis'
                    : 'Ver a biblioteca'}
                </Link>
              </div>
              <p className="mt-5 text-sm text-neutral-600">
                {freeAvailable && `${freeText} ao criar sua conta. `}
                Assinatura a partir de {formatBRL(YEARLY_DISCOUNT.perMonth)} por
                mês no plano anual.
              </p>
            </div>

            <div className="lg:col-span-5">
              {freePreview.some((a) => a.imageFileId) ? (
                <FreeSheetStack activities={freePreview} />
              ) : (
                <SheetStack samples={samples} />
              )}
            </div>
          </div>
        </section>

        {/* Library */}
        <PhonemeLibrary
          phonemes={phonemes}
          languageTopics={languageTopics}
          freePreview={freePreview}
          totalActivities={totalActivities}
        />

        {/* Who makes it */}
        <section className="py-20">
          <figure className="max-w-3xl mx-auto px-6">
            <p className="mb-6 text-sm font-medium text-neutral-600">
              Quem cria os materiais
            </p>
            <blockquote className="font-display text-2xl md:text-[1.7rem] font-semibold leading-snug text-neutral-800">
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
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50 text-xs font-medium text-neutral-400"
                  aria-hidden
                >
                  Foto
                </div>
              )}
              <div>
                <p className="font-semibold text-lg text-neutral-900">
                  {FOUNDER.name}
                </p>
                <p className="text-sm text-neutral-600">
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
            <p className="mt-3 text-neutral-600">
              Acesso completo à biblioteca, com atividades novas todo mês.
            </p>

            <div className="mt-10 rounded-lg border-2 border-neutral-900 bg-white p-7 md:p-9">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
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
                    note={`Equivale a ${formatBRL(YEARLY_DISCOUNT.perMonth)} por mês: ${yearlySavings}% de desconto, economia de ${formatBRL(YEARLY_DISCOUNT.amount)} por ano`}
                  />
                  <AuthAwareLink
                    to="/dashboard/profile?tab=assinatura"
                    className="mt-3 block rounded-md bg-neutral-900 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    Assinar
                  </AuthAwareLink>
                  <p className="text-center text-xs text-neutral-600">
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
            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-neutral-900 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span
                      className="text-xl leading-none text-neutral-600 transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-neutral-600 leading-relaxed">
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
    <div className="rounded-md border border-neutral-200 px-5 py-4">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-neutral-600">{label}</span>
        <span className="font-display text-2xl font-bold text-neutral-900">
          {price}
          <span className="ml-1 font-sans text-sm font-normal text-neutral-600">
            {period}
          </span>
        </span>
      </div>
      {note && <p className="mt-1 text-xs text-neutral-600">{note}</p>}
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
            className="mt-0.5 shrink-0 text-neutral-900"
            aria-hidden
          />
          <span className="text-neutral-700">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

// Hero with the real images of the free activities (the only ones that can
// be shown publicly, see /api/free-preview). Two sheets, overlapping.
function FreeSheetStack({ activities }: { activities: FreePreviewActivity[] }) {
  const shown = activities.filter((a) => a.imageFileId).slice(0, 2);
  const placements = [
    'left-0 top-6 rotate-[-4deg]',
    'right-0 top-24 rotate-[3deg]',
  ];
  return (
    <div className="relative mx-auto h-[24rem] sm:h-[30rem] max-w-lg">
      {shown.map((a, i) => (
        <figure
          key={a.id}
          className={`absolute w-[62%] overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.25)] ${placements[i]}`}
          style={{ zIndex: i + 1 }}
        >
          <img
            src={`/api/free-preview/${a.imageFileId}?w=512`}
            srcSet={`/api/free-preview/${a.imageFileId}?w=512 512w, /api/free-preview/${a.imageFileId}?w=1024 1024w`}
            sizes="320px"
            alt={`Atividade grátis: ${a.title}, ${a.subject}`}
            className="block w-full"
            // Both sheets are above the fold: load them right away.
            fetchPriority="high"
          />
          <span className="absolute left-2 top-2 rounded-sm bg-coral-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Grátis
          </span>
        </figure>
      ))}
    </div>
  );
}

// Typographic stand-in for printed activity sheets, built from real catalog
// entries. Used only while there are no free activities with an image.
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
          className={`absolute w-56 sm:w-60 rounded-sm border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.18)] ${placements[i]}`}
          style={{ zIndex: i + 1 }}
        >
          <div className="flex items-center justify-between text-[11px] text-neutral-600">
            <span className="font-mono text-sm font-semibold text-neutral-900">
              /{sample.phoneme.toLowerCase()}/
            </span>
          </div>
          <p className="mt-4 font-display text-xl font-bold leading-tight">
            {sample.title}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="aspect-square rounded border border-dashed border-neutral-300"
              />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-px bg-neutral-200" />
            <div className="h-px bg-neutral-200" />
          </div>
          <p className="mt-4 text-[10px] text-neutral-400">
            almanaquedafala.com.br
          </p>
        </div>
      ))}
    </div>
  );
}

function buildFaqs(freeAvailable: boolean, freeText: string) {
  return [
    {
      question: 'Quem cria os materiais?',
      answer:
        'Todas as atividades são criadas e revisadas por fonoaudióloga com experiência clínica em atendimento infantil. Nada é publicado sem revisão.',
    },
    ...(freeAvailable
      ? [
          {
            question: 'Posso experimentar antes de assinar?',
            answer: `Sim. Com uma conta grátis você baixa ${freeText}, sem cartão de crédito. As demais atividades fazem parte da assinatura.`,
          },
        ]
      : []),
    {
      question: 'O que está incluído na assinatura?',
      answer:
        'Acesso a todas as atividades da biblioteca, com downloads ilimitados prontos para impressão. Todo mês entram atividades novas no seu plano, sem custo extra.',
    },
    {
      question: 'Posso cancelar a assinatura?',
      answer:
        'Sim, a qualquer momento e sem multa. O acesso continua ativo até o fim do período já pago.',
    },
  ];
}
