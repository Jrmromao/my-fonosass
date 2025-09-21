import { prisma } from '@/app/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { ipAddress, userAgent } = await request.json();

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

    // Check if already liked by this IP
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        postId_ipAddress: {
          postId: blogPost.id,
          ipAddress: ipAddress || 'anonymous',
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.blogLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count
      const updatedPost = await prisma.blogPost.update({
        where: { id: blogPost.id },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: updatedPost.likeCount,
      });
    } else {
      // Like - add the like
      await prisma.blogLike.create({
        data: {
          postId: blogPost.id,
          ipAddress,
          userAgent,
        },
      });

      // Increment like count
      const updatedPost = await prisma.blogPost.update({
        where: { id: blogPost.id },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        liked: true,
        likeCount: updatedPost.likeCount,
      });
    }
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
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    const blogPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
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
