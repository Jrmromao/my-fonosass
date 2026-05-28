export const dynamic = "force-dynamic";
import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const file = await prisma.activityFile.findFirst({
      where: { activityId: id },
    });

    if (!file) {
      return NextResponse.json({ error: 'No file found' }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'fonosapp',
      Key: file.s3Key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({ success: true, url, fileType: file.fileType });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
