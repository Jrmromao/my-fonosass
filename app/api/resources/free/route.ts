import { prisma } from '@/app/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch free resources from database with real data
    const resources = await prisma.resource.findMany({
      where: {
        isFree: true,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        ageGroup: true,
        downloadCount: true,
        rating: true,
        tags: true,
        downloadUrl: true,
        thumbnailUrl: true,
        fileSize: true,
        createdAt: true,
        isFeatured: true,
        slug: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { downloadCount: 'desc' }],
    });

    // Calculate total downloads and average rating
    const totalDownloads = resources.reduce(
      (sum, resource) => sum + resource.downloadCount,
      0
    );
    const averageRating =
      resources.length > 0
        ? resources.reduce((sum, resource) => sum + resource.rating, 0) /
          resources.length
        : 0;

    return NextResponse.json({
      resources,
      stats: {
        totalResources: resources.length,
        totalDownloads,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      },
    });
  } catch (error) {
    console.error('Error fetching free resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
