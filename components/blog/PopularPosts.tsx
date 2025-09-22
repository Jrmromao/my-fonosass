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
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-gray-600" />
          </div>
          Posts Populares
        </h3>
        <div className="space-y-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse p-2 rounded-md">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-gray-600" />
          </div>
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
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-gray-600" />
          </div>
          Posts Populares
        </h3>
        <p className="text-sm text-gray-500">Nenhum post encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <TrendingUp className="w-3 h-3 text-gray-600" />
        </div>
        Posts Populares
      </h3>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group hover:bg-gray-50 p-2 rounded-md transition-colors duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : index === 1
                        ? 'bg-gray-100 text-gray-600'
                        : index === 2
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-pink-600 mb-1 line-clamp-2 leading-tight">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
