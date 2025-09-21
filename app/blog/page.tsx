import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Dicas e Recursos para Fonoaudiólogos',
  description: 'Artigos especializados, dicas práticas e recursos para fonoaudiólogos brasileiros. Aprenda sobre gestão de consultório, exercícios terapêuticos e mais.',
  keywords: ['fonoaudiologia', 'dicas fonoaudiólogo', 'exercícios fonoaudiológicos', 'gestão consultório'],
};

export default function BlogPage() {
  const articles = [
    {
      title: "10 Exercícios Essenciais para Terapia da Fala",
      excerpt: "Descubra os exercícios mais eficazes para diferentes distúrbios da comunicação.",
      slug: "exercicios-essenciais-terapia-fala",
      date: "2024-01-15"
    },
    {
      title: "Como Organizar Prontuários Digitais em Conformidade com LGPD",
      excerpt: "Guia completo para manter seus registros seguros e em conformidade legal.",
      slug: "prontuarios-digitais-lgpd",
      date: "2024-01-10"
    },
    {
      title: "Gestão Financeira para Consultórios de Fonoaudiologia",
      excerpt: "Estratégias práticas para otimizar a gestão financeira do seu consultório.",
      slug: "gestao-financeira-consultorio",
      date: "2024-01-05"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 to-fuchsia-100">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            Blog FonoSaaS
          </h1>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">
            Recursos especializados e dicas práticas para fonoaudiólogos brasileiros
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.slug} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold text-indigo-900 mb-3">
                {article.title}
              </h2>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <div className="flex justify-between items-center">
                <time className="text-sm text-gray-500">{article.date}</time>
                <a 
                  href={`/blog/${article.slug}`}
                  className="text-pink-600 hover:text-pink-800 font-medium"
                >
                  Ler mais →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
