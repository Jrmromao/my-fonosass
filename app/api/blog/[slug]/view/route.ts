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
    await prisma.blogView.create({
      data: {
        postId: blogPost.id,
        ipAddress: getClientIp(request),
        userAgent: truncate(body?.userAgent, 255),
        referer: truncate(body?.referer, 500),
      },
    });

    const updatedPost = await prisma.blogPost.update({
      where: { id: blogPost.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      viewCount: updatedPost.viewCount,
    });
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { viewCount: true, likeCount: true },
    });
    return NextResponse.json({
      viewCount: blogPost?.viewCount ?? 0,
      likeCount: blogPost?.likeCount ?? 0,
    });
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
