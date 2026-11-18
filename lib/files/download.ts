import { prisma } from '@/app/db';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import { recordAnonymousDownload } from '@/lib/stats/downloadStats';
import { hasActiveSubscription, isFreeSample } from '@/lib/access';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const paramsSchema = z.object({
  fileId: z.string().min(1).max(64),
});

export type DownloadFailureReason =
  | 'invalid'
  | 'unauthenticated'
  | 'not_found'
  | 'subscription'
  | 'error';

export type DownloadResult =
  | {
      success: true;
      url: string;
      fileName: string;
      fileType: string;
      fileSizeInBytes: number;
    }
  | {
      success: false;
      error: string;
      /** Why it failed; the API route maps this to an HTTP status. */
      reason: DownloadFailureReason;
      /** The file exists but needs a subscription (show the upgrade dialog). */
      requiresSubscription?: true;
    };

/**
 * Signed download URL for an activity file. Shared by the API route and the
 * server action (kept for the components that still call it). Rules in lib/access.ts:
 * subscribers and admins get everything published; other signed-in users get
 * only the free samples.
 */
export async function resolveFileDownload(input: {
  fileId: string;
}): Promise<DownloadResult> {
  try {
    const parsed = paramsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: 'Arquivo inválido.', reason: 'invalid' };
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Entre na sua conta para baixar.',
        reason: 'unauthenticated',
      };
    }

    const user = await getOrCreateDbUser(userId);
    if (!user) {
      return {
        success: false,
        error: 'Conta não encontrada.',
        reason: 'not_found',
      };
    }

    const file = await prisma.activityFile.findUnique({
      where: { id: parsed.data.fileId },
      select: {
        name: true,
        s3Key: true,
        fileType: true,
        sizeInBytes: true,
        activityId: true,
        activity: { select: { status: true } },
      },
    });

    const isAdmin = user.role === 'ADMIN';

    // Unpublished content (drafts, pending, rejected) is only for admins.
    // Same message as "missing" so ids can't be probed.
    if (!file || (file.activity.status !== 'PUBLISHED' && !isAdmin)) {
      return {
        success: false,
        error: 'Arquivo não encontrado.',
        reason: 'not_found',
      };
    }

    const allowed =
      isAdmin ||
      (await hasActiveSubscription(user.id)) ||
      (await isFreeSample(file.activityId));

    if (!allowed) {
      return {
        success: false,
        error: 'Assine o plano Profissional para baixar esta atividade.',
        reason: 'subscription',
        requiresSubscription: true,
      };
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      console.error('AWS_S3_BUCKET_NAME environment variable is not set');
      return {
        success: false,
        error: 'Erro de configuração do servidor.',
        reason: 'error',
      };
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: file.s3Key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
      }),
      { expiresIn: 300 }
    );

    // Per-user history (the user's own records and LGPD export; erased with
    // the account) and an anonymous monthly counter (kept for reporting).
    await prisma.downloadHistory.create({
      data: {
        userId: user.id,
        activityId: file.activityId,
        fileName: file.name,
        fileSize: file.sizeInBytes,
      },
    });
    await recordAnonymousDownload(file.activityId);

    return {
      success: true,
      url,
      fileName: file.name,
      fileType: file.fileType,
      fileSizeInBytes: file.sizeInBytes,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      success: false,
      error: 'Não foi possível gerar o download.',
      reason: 'error',
    };
  }
}
