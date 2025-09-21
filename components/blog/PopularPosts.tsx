'use client';

import { Eye, Heart, TrendingUp } from 'lucide-react';
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
  showEngagement = true,
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

        if (!response.ok) {
          throw new Error('Failed to fetch popular posts');
        }

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

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Posts Populares
        </h3>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Posts Populares
        </h3>
        <p className="text-sm text-gray-500">
          Erro ao carregar posts populares
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Posts Populares
        </h3>
        <p className="text-sm text-gray-500">Nenhum post encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Posts Populares
      </h3>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group hover:bg-gray-100 p-2 rounded transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 mb-1 line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.viewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{post.likeCount.toLocaleString()}</span>
                  </div>
                  {showEngagement && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{post.engagementScore.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
