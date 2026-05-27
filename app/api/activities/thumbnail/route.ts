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

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = request.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'fonosapp',
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 600 });

    return NextResponse.json(
      { url },
      {
        headers: { 'Cache-Control': 'private, max-age=300' },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
