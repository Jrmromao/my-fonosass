import { prisma } from '@/app/db';
import { getTrackedBlogPost, truncate } from '@/lib/blog-tracking';
import { getClientIp } from '@/lib/security/clientIp';
import { rateLimiters } from '@/lib/security/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const limit = await rateLimiters.general.checkAsync(request);
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { slug } = await params;
    const body = await request.json().catch(() => ({}));

    const blogPost = await getTrackedBlogPost(slug);
    if (!blogPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // IP is taken from the request, never from the client payload.
    const ipAddress = getClientIp(request);

    const existingLike = await prisma.blogLike.findUnique({
      where: { postId_ipAddress: { postId: blogPost.id, ipAddress } },
    });

    if (existingLike) {
      await prisma.blogLike.delete({ where: { id: existingLike.id } });
      const updatedPost = await prisma.blogPost.update({
        where: { id: blogPost.id },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: updatedPost.likeCount,
      });
    }

    await prisma.blogLike.create({
      data: {
        postId: blogPost.id,
        ipAddress,
        userAgent: truncate(body?.userAgent, 255),
      },
    });
    const updatedPost = await prisma.blogPost.update({
      where: { id: blogPost.id },
      data: { likeCount: { increment: 1 } },
    });
    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    console.error('Error toggling blog like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const ipAddress = getClientIp(request);

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        likeCount: true,
      },
    });

    if (!blogPost) {
      return NextResponse.json({
        likeCount: 0,
        isLiked: false,
      });
    }

    // Check if current IP has liked this post
    const userLike = await prisma.blogLike.findUnique({
      where: {
        postId_ipAddress: {
          postId: blogPost.id,
          ipAddress,
        },
      },
    });

    return NextResponse.json({
      likeCount: blogPost.likeCount,
      isLiked: !!userLike,
    });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}
