import { prisma } from '@/app/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { ipAddress, userAgent, referer } = await request.json();

    // Find or create blog post
    let blogPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!blogPost) {
      // Create blog post if it doesn't exist
      blogPost = await prisma.blogPost.create({
        data: {
          slug,
          title: slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          viewCount: 0,
          likeCount: 0,
        },
      });
    }

    // Record the view
    await prisma.blogView.create({
      data: {
        postId: blogPost.id,
        ipAddress,
        userAgent,
        referer,
      },
    });

    // Update view count
    const updatedPost = await prisma.blogPost.update({
      where: { id: blogPost.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        viewCount: true,
        likeCount: true,
      },
    });

    if (!blogPost) {
      return NextResponse.json({
        viewCount: 0,
        likeCount: 0,
      });
    }

    return NextResponse.json({
      viewCount: blogPost.viewCount,
      likeCount: blogPost.likeCount,
    });
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
