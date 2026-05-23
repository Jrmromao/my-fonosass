import BlogPageClient from '@/components/blog/BlogPageClient';
import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Dicas e Recursos para Fonoaudiólogos',
  description:
    'Artigos especializados, dicas práticas e recursos para fonoaudiólogos brasileiros.',
  keywords: [
    'fonoaudiologia',
    'dicas fonoaudiólogo',
    'exercícios fonoaudiológicos',
  ],
  alternates: { canonical: 'https://www.almanaquedafala.com.br/blog' },
};

export default function BlogPage() {
  const articles = getAllPosts();
  return <BlogPageClient articles={articles} />;
}
