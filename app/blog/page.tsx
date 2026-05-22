import BlogPageClient from '@/components/blog/BlogPageClient';
import { getAllPosts } from '@/lib/blog';
import { getAllPostsFromS3 } from '@/lib/blog-s3';
import { Metadata } from 'next';

export const revalidate = 60; // ISR: revalidate every 60 seconds

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

export default async function BlogPage() {
  // Merge: local markdown posts + S3 posts
  const localPosts = getAllPosts();
  const s3Posts = await getAllPostsFromS3();

  // Combine, deduplicate by slug, sort by date
  const slugSet = new Set<string>();
  const allPosts = [...s3Posts, ...localPosts]
    .filter((post) => {
      if (slugSet.has(post.slug)) return false;
      slugSet.add(post.slug);
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return <BlogPageClient articles={allPosts} />;
}
