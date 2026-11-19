import { prisma } from '@/app/db';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import {
  EXPORT_LINK_TTL_MS,
  recordExportDownload,
} from '@/lib/privacy/dataExportRequests';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * LGPD data portability: everything we store about the signed-in user, as a
 * JSON file. Never cacheable (personal data).
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Make sure the row exists (webhook may have missed it), then load it.
    await getOrCreateDbUser(clerkUserId);
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        subscriptions: true,
        consentRecords: true,
        downloadHistory: {
          include: { activity: { select: { id: true, name: true } } },
          orderBy: { downloadedAt: 'desc' },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // LGPD audit trail: every export is tied to a persisted request.
    // ?request=<id> -> a request made from the data-rights dashboard;
    // no param      -> direct download (privacy panel), recorded as a request
    //                  answered on the spot.
    const requestId = request.nextUrl.searchParams.get('request');
    if (requestId) {
      const counted = await recordExportDownload(requestId, user.id);
      if (!counted) {
        return NextResponse.json(
          { error: 'Solicitação inválida ou expirada.' },
          { status: 404, headers: { 'Cache-Control': 'private, no-store' } }
        );
      }
    } else {
      const now = new Date();
      await prisma.dataExportRequest.create({
        data: {
          userId: user.id,
          format: 'JSON',
          reason: 'Download direto (painel de privacidade)',
          status: 'COMPLETED',
          requestedAt: now,
          completedAt: now,
          expiresAt: new Date(now.getTime() + EXPORT_LINK_TTL_MS),
          downloadCount: 1,
        },
      });
    }

    const data = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt.toISOString(),
      },
      subscription: user.subscriptions
        ? {
            tier: user.subscriptions.tier,
            status: user.subscriptions.status,
            currentPeriodStart: user.subscriptions.currentPeriodStart,
            currentPeriodEnd: user.subscriptions.currentPeriodEnd,
          }
        : null,
      consents: user.consentRecords.map((c) => ({
        type: c.consentType,
        purpose: c.purpose,
        granted: c.granted,
        grantedAt: c.grantedAt,
        withdrawnAt: c.withdrawnAt,
      })),
      downloads: user.downloadHistory.map((d) => ({
        activityId: d.activity.id,
        activityName: d.activity.name,
        fileName: d.fileName,
        downloadedAt: d.downloadedAt,
      })),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="almanaque-da-fala-meus-dados.json"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
