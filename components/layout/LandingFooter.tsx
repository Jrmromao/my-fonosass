import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="py-12 bg-blue-50 dark:bg-blue-950 border-t border-blue-200 dark:border-blue-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Fomosaas
              </span>
            </Link>
            <p className="text-blue-700 dark:text-blue-300 mb-6">
              Plataforma especializada em exercícios de fonoaudiologia para
              crianças brasileiras.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-blue-500 hover:text-purple-500 dark:text-blue-400 dark:hover:text-purple-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-blue-500 hover:text-purple-500 dark:text-blue-400 dark:hover:text-purple-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-blue-500 hover:text-purple-500 dark:text-blue-400 dark:hover:text-purple-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-blue-500 hover:text-purple-500 dark:text-blue-400 dark:hover:text-purple-400"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm0 9a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-white mb-4">
              Plataforma
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#recursos"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  href="#como-funciona"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="#planos"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-white mb-4">
              Suporte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contato"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/comunidade"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Comunidade
                </Link>
              </li>
              <li>
                <Link
                  href="/especialistas"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Fale com Especialistas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacidade"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/lgpd"
                  className="text-blue-700 hover:text-purple-600 dark:text-blue-300 dark:hover:text-purple-400 transition-colors"
                >
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-blue-200 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              &copy; {new Date().getFullYear()} Fomosaas. Todos os direitos
              reservados.
            </p>
            <button className="px-4 py-2 bg-white border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Gerenciar Consentimento
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
