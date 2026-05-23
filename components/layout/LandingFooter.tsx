import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-100 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-sm font-semibold text-gray-900">
              Almanaque da Fala
            </span>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Materiais terapêuticos para fonoaudiólogos que trabalham com
              crianças.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Plataforma
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/fonoeliane"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/lgpd"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  LGPD
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Profissional */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Profissional
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/especialistas"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Especialistas
                </Link>
              </li>
              <li>
                <Link
                  href="/recursos-gratuitos"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Recursos Grátis
                </Link>
              </li>
              <li>
                <Link
                  href="/dpo"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  DPO
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
          © {new Date().getFullYear()} Almanaque da Fala. Todos os direitos
          reservados.
        </div>
      </div>
    </footer>
  );
}
