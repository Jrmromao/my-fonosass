import { prisma } from '@/app/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'views'; // 'views', 'likes', 'engagement'

    let orderBy: any = { viewCount: 'desc' };

    if (sortBy === 'likes') {
      orderBy = { likeCount: 'desc' };
    } else if (sortBy === 'engagement') {
      // Engagement = views + likes combined
      orderBy = [{ viewCount: 'desc' }, { likeCount: 'desc' }];
    }

    const popularPosts = await prisma.blogPost.findMany({
      orderBy,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate engagement score (views + likes * 2)
    const postsWithEngagement = popularPosts.map((post) => ({
      ...post,
      engagementScore: post.viewCount + post.likeCount * 2,
    }));

    // Sort by engagement if requested
    if (sortBy === 'engagement') {
      postsWithEngagement.sort((a, b) => b.engagementScore - a.engagementScore);
    }

    return NextResponse.json({
      success: true,
      posts: postsWithEngagement,
      total: popularPosts.length,
    });
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular posts' },
      { status: 500 }
    );
  }
}
