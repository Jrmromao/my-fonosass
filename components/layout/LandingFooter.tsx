import CookiePreferencesLink from '@/components/cookies/CookiePreferencesLink';
import Link from 'next/link';

const linkClass =
  'text-sm text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700 focus-visible:ring-offset-2 rounded-sm';

export default function LandingFooter() {
  return (
    <footer className="border-t border-violet-200 bg-violet-100 py-16 text-violet-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-sm font-semibold text-violet-950">
              Almanaque da Fala
            </span>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Materiais de apoio à terapia para fonoaudiólogos que trabalham com
              crianças.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-950">
              Plataforma
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className={linkClass}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className={linkClass}>
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link href="/contato" className={linkClass}>
                  Contato
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/fonoeliane"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className={linkClass}
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-950">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacidade" className={linkClass}>
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className={linkClass}>
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/lgpd" className={linkClass}>
                  LGPD
                </Link>
              </li>
              <li>
                <Link href="/cookies" className={linkClass}>
                  Cookies
                </Link>
              </li>
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <li>
                  <CookiePreferencesLink className={linkClass} />
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-violet-950">
              Profissional
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/recursos-gratuitos" className={linkClass}>
                  Recursos Grátis
                </Link>
              </li>
              <li>
                <Link href="/dpo" className={linkClass}>
                  DPO
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-violet-200 pt-8 text-sm text-neutral-600">
          © {new Date().getFullYear()} Almanaque da Fala. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
