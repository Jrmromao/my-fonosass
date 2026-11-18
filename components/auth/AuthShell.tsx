import { getFreeSamples, type FreeSample } from '@/lib/access';
import { AGE_LABELS, label, subjectLabel } from '@/lib/activityLabels';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Link under the form, e.g. "Já tem uma conta? Entrar". */
  footer?: ReactNode;
}

// Founder shown on the brand panel. Keep in sync with the landing page.
const FOUNDER = {
  name: 'Eliane Mota',
  crfa: 'CRFa 3-10032',
  photo: '/images/eliane_head.png',
};

// Shared layout for sign-in and sign-up. Desktop: brand panel (real activity
// sheet + founder) on the left, form on the right. Mobile: form only.
// See DESIGN_SYSTEM.md.
export default function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 lg:grid lg:grid-cols-2">
      <BrandPanel />

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between px-6 lg:justify-end lg:px-12">
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <Image
              src="/images/logo.png"
              alt=""
              width={36}
              height={36}
              className="object-contain"
              priority
            />
            <span className="font-display font-bold">Almanaque da Fala</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft size={16} aria-hidden />
            Voltar ao início
          </Link>
        </header>

        <main
          id="main-content"
          className="flex flex-1 items-start justify-center px-6 py-10 sm:py-14 lg:items-center lg:py-6"
        >
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {description}
            </p>
            <div className="mt-6">{children}</div>

            {footer && (
              <p className="mt-6 text-center text-sm text-neutral-600">
                {footer}
              </p>
            )}
          </div>
        </main>

        <footer className="pb-6 text-center text-xs text-neutral-600">
          <Link href="/termos" className="hover:text-neutral-900">
            Termos de Uso
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <Link href="/privacidade" className="hover:text-neutral-900">
            Privacidade
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <Link href="/contato" className="hover:text-neutral-900">
            Contato
          </Link>
        </footer>
      </div>
    </div>
  );
}

/** This month's first free activity, or null (the panel then shows a
 * placeholder sheet). Never breaks the auth page if the database fails. */
async function showcaseSample(): Promise<FreeSample | null> {
  try {
    return (await getFreeSamples())[0] ?? null;
  } catch (error) {
    console.error('AuthShell: free samples unavailable', error);
    return null;
  }
}

/** "Fonema /s/" for /x/ notation; named entries and categories as is. */
function captionSubject(sample: FreeSample): string {
  const subject = subjectLabel(sample.phoneme, sample.type);
  return subject.startsWith('/') ? `Fonema ${subject}` : subject;
}

async function BrandPanel() {
  const sample = await showcaseSample();
  return (
    <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen flex-col justify-between overflow-hidden bg-violet-100 px-12 py-10">
      <Link href="/" className="flex items-center gap-3 self-start">
        <Image
          src="/images/logo.png"
          alt=""
          width={40}
          height={40}
          className="object-contain"
          priority
        />
        <span className="font-display font-bold">Almanaque da Fala</span>
      </Link>

      <div className="mx-auto w-full max-w-md">
        {sample ? (
          // This month's free activity (same list as downloads and the
          // landing page), so the panel shows real material.
          <figure className="flex flex-col items-center">
            <div className="w-56 xl:w-64 rotate-[-3deg] overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.25)]">
              <img
                src={`/api/free-preview/${sample.imageFileId}`}
                alt={`Atividade ${sample.name}`}
                className="block w-full"
              />
            </div>
            <figcaption className="mt-5 text-center text-sm text-neutral-600">
              <span className="font-semibold text-coral-800">
                Grátis com sua conta:
              </span>{' '}
              {captionSubject(sample)} · {label(AGE_LABELS, sample.ageRange)}
            </figcaption>
          </figure>
        ) : (
          // No free activity yet: placeholder sheet.
          <div className="flex justify-center" aria-hidden>
            <div className="w-52 xl:w-60 rotate-[-3deg] rounded-sm border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.25)]">
              <div className="flex items-center justify-between text-[11px] text-neutral-600">
                <span className="font-mono text-sm font-semibold text-neutral-900">
                  /s/
                </span>
                <span>Pré-escolar</span>
              </div>
              <p className="mt-4 font-display text-lg font-bold leading-tight text-neutral-900">
                Atividade de exemplo
              </p>
              <p className="text-xs text-neutral-600">Iniciante</p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
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
          </div>
        )}

        <p className="mt-10 font-display text-2xl font-bold leading-snug">
          Atividades de fonoaudiologia infantil, organizadas por fonema.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Image
            src={FOUNDER.photo}
            alt={`Foto de ${FOUNDER.name}`}
            width={80}
            height={80}
            className="h-10 w-10 rounded-full object-cover object-[50%_30%]"
          />
          <p className="text-sm text-neutral-600">
            Criadas e revisadas por{' '}
            <span className="font-semibold text-neutral-900">
              {FOUNDER.name}
            </span>
            , {FOUNDER.crfa}
          </p>
        </div>
      </div>

      {/* Keeps the content block vertically centred against the logo row. */}
      <div className="h-10" aria-hidden />
    </aside>
  );
}

// Shared field styles so both forms look identical.
export const inputClass =
  'h-11 bg-white border-neutral-200 shadow-none text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-coral-500/30 focus-visible:border-coral-500 focus-visible:ring-offset-0';

export const primaryButtonClass =
  'w-full h-11 rounded-md bg-coral-700 text-white text-sm font-semibold shadow-none hover:bg-coral-800 focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2';

export const secondaryButtonClass =
  'w-full h-11 rounded-md border border-neutral-300 bg-white text-sm font-medium text-neutral-900 shadow-none hover:bg-neutral-50 hover:text-neutral-900 focus-visible:text-neutral-900';

export const linkClass =
  'font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900';
