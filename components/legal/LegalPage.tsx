import LandingFooter from '@/components/layout/LandingFooter';
import SharedNavbar from '@/components/layout/SharedNavbar';
import { COMPANY, LEGAL_LAST_UPDATED } from '@/lib/legal/company';
import Link from 'next/link';
import type { ReactNode } from 'react';

// Shared layout of the legal pages: same navbar and footer as the rest of
// the public site, one readable text column, plain sections.

const LEGAL_LINKS = [
  { href: '/privacidade', label: 'Privacidade' },
  { href: '/termos', label: 'Termos de Uso' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/lgpd', label: 'Seus direitos (LGPD)' },
  { href: '/dpo', label: 'Encarregado (DPO)' },
];

export function LegalPage({
  title,
  intro,
  current,
  children,
}: {
  title: string;
  intro: ReactNode;
  /** Path of this page, highlighted in the legal pages menu. */
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <SharedNavbar />
      <main id="main-content" className="pt-28 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <nav
            aria-label="Documentos legais"
            className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-sm"
          >
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={l.href === current ? 'page' : undefined}
                className={
                  l.href === current
                    ? 'font-semibold text-neutral-900 underline underline-offset-4 dark:text-white'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Última atualização: {LEGAL_LAST_UPDATED}
          </p>
          <div className="mt-6 text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {intro}
          </div>

          <div className="mt-10 space-y-10">{children}</div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-xl font-semibold text-neutral-900 dark:text-white">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-neutral-700 dark:text-neutral-300 [&_a]:font-medium [&_a]:text-neutral-900 [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

export function MailLink({ email }: { email: string }) {
  return <a href={`mailto:${email}`}>{email}</a>;
}

/**
 * Who is responsible for the service. Only the fields that are defined in
 * lib/legal/company.ts are shown; nothing is invented.
 */
export function ControllerInfo() {
  const rows: { term: string; detail: ReactNode }[] = [
    { term: 'Serviço', detail: COMPANY.brandName },
    ...(COMPANY.legalName
      ? [{ term: 'Responsável', detail: COMPANY.legalName }]
      : []),
    ...(COMPANY.cnpj ? [{ term: 'CNPJ', detail: COMPANY.cnpj }] : []),
    ...(COMPANY.address ? [{ term: 'Endereço', detail: COMPANY.address }] : []),
    { term: 'Site', detail: COMPANY.site.replace('https://', '') },
    {
      term: 'Contato',
      detail: <MailLink email={COMPANY.contactEmail} />,
    },
    {
      term: 'Privacidade e LGPD',
      detail: <MailLink email={COMPANY.privacyEmail} />,
    },
  ];
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-md border border-neutral-200 p-4 text-sm sm:grid-cols-[10rem_1fr] dark:border-neutral-800">
      {rows.map((r) => (
        <div key={r.term} className="contents">
          <dt className="font-semibold text-neutral-900 dark:text-white">
            {r.term}
          </dt>
          <dd>{r.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
