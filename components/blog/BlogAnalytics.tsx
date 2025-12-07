'use client';

import { BarChart3, Eye, Heart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BlogAnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalPosts: number;
  averageEngagement: number;
  topPosts: Array<{
    id: string;
    slug: string;
    title: string;
    viewCount: number;
    likeCount: number;
    engagementScore: number;
  }>;
}

interface BlogAnalyticsProps {
  className?: string;
}

function BlogAnalytics({ className = '' }: BlogAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BlogAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          '/api/blog/popular?limit=10&sortBy=engagement'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();

        // Calculate analytics from the data
        const totalViews = data.posts.reduce(
          (sum: number, post: any) => sum + post.viewCount,
          0
        );
        const totalLikes = data.posts.reduce(
          (sum: number, post: any) => sum + post.likeCount,
          0
        );
        const totalPosts = data.posts.length;
        const averageEngagement =
          totalPosts > 0
            ? data.posts.reduce(
                (sum: number, post: any) => sum + post.engagementScore,
                0
              ) / totalPosts
            : 0;

        setAnalytics({
          totalViews,
          totalLikes,
          totalPosts,
          averageEngagement: Math.round(averageEngagement),
          topPosts: data.posts.slice(0, 5),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Analytics do Blog
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Analytics do Blog
          </h3>
        </div>
        <p className="text-gray-500">Erro ao carregar analytics</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Analytics do Blog
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-pink-600 mb-1">
            <Eye className="w-5 h-5" />
            {analytics.totalViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Visualizações</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500 mb-1">
            <Heart className="w-5 h-5" />
            {analytics.totalLikes.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Curtidas</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600 mb-1">
            <TrendingUp className="w-5 h-5" />
            {analytics.totalPosts}
          </div>
          <p className="text-sm text-gray-600">Posts</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600 mb-1">
            <BarChart3 className="w-5 h-5" />
            {analytics.averageEngagement.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Engajamento Médio</p>
        </div>
      </div>

      {/* Top Posts */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-3">Top Posts</h4>
        <div className="space-y-2">
          {analytics.topPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {post.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likeCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {post.engagementScore.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0">
                <span className="text-xs font-bold text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogAnalytics;
