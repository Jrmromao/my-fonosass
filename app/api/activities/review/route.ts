import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET = 'fonosapp';

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action');
  const key = request.nextUrl.searchParams.get('key');

  if (!action || !key) {
    return NextResponse.json(
      { error: 'Missing action or key' },
      { status: 400 }
    );
  }

  if (action === 'approve') {
    // Move from activities/ to approved/ (or just keep in place — it's already public)
    // Mark as approved by copying to approved/ prefix
    const approvedKey = key.replace('activities/', 'activities/approved/');
    await s3.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${key}`,
        Key: approvedKey,
      })
    );

    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1>✅ Aprovado!</h1>
        <p>A atividade foi aprovada e está disponível para download.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (action === 'reject') {
    // Delete from S3
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));

    return new NextResponse(
      `<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1>❌ Rejeitado</h1>
        <p>A atividade foi removida.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
