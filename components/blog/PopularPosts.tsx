'use client';

import { Eye, Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PopularPost {
  id: string;
  slug: string;
  title: string;
  viewCount: number;
  likeCount: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
}

interface PopularPostsProps {
  limit?: number;
  sortBy?: 'views' | 'likes' | 'engagement';
  showEngagement?: boolean;
}

export default function PopularPosts({
  limit = 5,
  sortBy = 'engagement',
}: PopularPostsProps) {
  const [posts, setPosts] = useState<PopularPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/blog/popular?limit=${limit}&sortBy=${sortBy}`
        );
        if (!response.ok) throw new Error('Failed to fetch popular posts');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchPopularPosts();
  }, [limit, sortBy]);

  return (
    <div className="rounded-3xl bg-white p-5">
      <h3 className="text-sm font-semibold text-violet-950">Mais lidos</h3>

      {loading && (
        <div className="mt-4 space-y-3" aria-hidden>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2 p-2">
              <div className="h-4 rounded bg-violet-100" />
              <div className="h-3 w-2/3 rounded bg-violet-50" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="mt-4 text-sm text-neutral-600">
          Não foi possível carregar os artigos.
        </p>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="mt-4 text-sm text-neutral-600">Nenhum artigo ainda.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <ul className="mt-4 space-y-1">
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-700"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-950">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
                    {post.title}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" aria-hidden />
                      {post.viewCount.toLocaleString('pt-BR')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" aria-hidden />
                      {post.likeCount.toLocaleString('pt-BR')}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
