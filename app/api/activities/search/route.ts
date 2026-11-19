import { prisma } from '@/app/db';
import { getEffectiveAccess } from '@/lib/auth/viewAs';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import { getFreeSamples } from '@/lib/access';
import { canPreview } from '@/lib/files/preview';
import { auth } from '@clerk/nextjs/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // The "thumbnail" is a signed URL to the original file, so it is only
    // sent to users allowed to download it (subscribers, admins, free samples).
    // Others see the card without an image. TODO: real low-res previews.
    const viewer = await getOrCreateDbUser(userId);
    // Effective access ("Ver como" lets admins test as a user).
    const access = viewer ? await getEffectiveAccess(viewer) : null;
    const canDownloadAll = !!access && (access.isAdmin || access.subscribed);
    const freeSampleIds = new Set((await getFreeSamples()).map((s) => s.id));

    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get('limit') || '20'))
    );
    const search = url.searchParams.get('search')?.trim() || '';
    const phoneme = url.searchParams.get('phoneme') || '';
    const type = url.searchParams.get('type') || '';

    const where: Prisma.ActivityWhereInput = {
      isPublic: true,
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (phoneme) where.phoneme = phoneme;
    if (type) where.type = type as any;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          phoneme: true,
          type: true,
          createdAt: true,
          files: {
            select: { id: true, name: true, fileType: true, s3Key: true },
            // Page order: upload order, then name (files sent together).
            orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    // Get available filter options (for the current filtered set minus that filter)
    const [phonemes, types] = await Promise.all([
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { phoneme: true },
        distinct: ['phoneme'],
        orderBy: { phoneme: 'asc' },
      }),
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { type: true },
        distinct: ['type'],
      }),
    ]);

    // Generate presigned thumbnail URLs in batch
    const activitiesWithThumbnails = await Promise.all(
      activities.map(async (activity) => {
        const file = activity.files[0];
        // Every signed-in user sees a small preview of activities with a PDF
        // or image file (see /api/activities/[id]/preview).
        const hasPreview = activity.files.some((f) => canPreview(f.fileType));
        const isFreeSample = freeSampleIds.has(activity.id);
        const canDownload = canDownloadAll || isFreeSample;
        let thumbnailUrl = null;
        if (canDownload && file?.s3Key) {
          try {
            const command = new GetObjectCommand({
              Bucket: BUCKET,
              Key: file.s3Key,
            });
            thumbnailUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
          } catch {
            /* skip failed thumbnails */
          }
        }
        // s3Key stays server-side: the client only needs id, name and type.
        // Every file is a page of the activity, page 1 first.
        const files = activity.files.map(({ id, name, fileType }) => ({
          id,
          name,
          fileType,
        }));
        return {
          ...activity,
          files,
          thumbnailUrl,
          previewUrl: hasPreview
            ? `/api/activities/${activity.id}/preview`
            : null,
          isFreeSample,
          canDownload,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: activitiesWithThumbnails,
      viewer: { canDownloadAll },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        // Strip empty values (e.g. sort/categorize activities have no phoneme)
        // so they never reach a Radix <SelectItem/>, which throws on value="".
        phonemes: phonemes
          .map((p) => p.phoneme)
          .filter((p): p is string => !!p && p.trim() !== '')
          .sort(),
        types: types.map((t) => t.type).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Activities search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
