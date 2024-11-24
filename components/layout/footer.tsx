import Link from "next/link"

const footerLinks = [
  {
    title: "Produto",
    links: [
      { name: "Recursos", href: "#recursos" },
      { name: "Preços", href: "#precos" },
      { name: "Integrações", href: "#" },
      { name: "Atualizações", href: "#" }
    ]
  },
  {
    title: "Empresa",
    links: [
      { name: "Sobre", href: "#sobre" },
      { name: "Blog", href: "#" },
      { name: "Carreiras", href: "#" },
      { name: "Contato", href: "#" }
    ]
  },
  {
    title: "Recursos",
    links: [
      { name: "Documentação", href: "#" },
      { name: "Tutoriais", href: "#" },
      { name: "Guias", href: "#" },
      { name: "API", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacidade", href: "#" },
      { name: "Termos", href: "#" },
      { name: "Cookies", href: "#" },
      { name: "Licenças", href: "#" }
    ]
  }
]

const socialLinks = [
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-gray-500 hover:fill-indigo-600">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    name: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-gray-500 hover:fill-indigo-600">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    )
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-gray-500 hover:fill-indigo-600">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    )
  }
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand */}
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="size-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg rotate-3">
                <span className="font-black text-xl">FS</span>
              </div>
              <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                FonoSaaS
              </span>
            </div>
            <p className="text-sm leading-6 text-gray-600">
              Transformando a prática fonoaudiológica com tecnologia e inovação.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:opacity-75 transition-opacity"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">
                    {group.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(2).map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold leading-6 text-gray-900">
                    {group.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs leading-5 text-gray-500">
              &copy; 2024 FonoSaaS. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm font-medium leading-6 text-gray-600">
              <Link href="#" className="hover:text-indigo-600 transition-colors">
                Política de Privacidade
              </Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">
                Termos de Uso
              </Link>
              <Link href="#" className="hover:text-indigo-600 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}