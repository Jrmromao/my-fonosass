import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalUsers,
      usersThisMonth,
      proUsers,
      totalActivities,
      activitiesThisWeek,
      pendingReview,
      downloadsThisMonth,
      downloadsLastMonth,
      topActivities,
      phonemeDistribution,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({
        where: { subscriptions: { status: 'ACTIVE', tier: 'PRO' } },
      }),
      // Library
      prisma.activity.count({ where: { status: 'PUBLISHED' } }),
      prisma.activity.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.activity.count({ where: { status: 'PENDING_REVIEW' } }),
      // Downloads (aggregate — no personal data)
      prisma.downloadHistory.count({ where: { downloadedAt: { gte: startOfMonth } } }),
      prisma.downloadHistory.count({
        where: { downloadedAt: { gte: startOfLastMonth, lt: startOfMonth } },
      }),
      // Top activities by download (aggregate)
      prisma.downloadHistory.groupBy({
        by: ['activityId'],
        _count: { activityId: true },
        orderBy: { _count: { activityId: 'desc' } },
        take: 5,
      }),
      // Phoneme distribution
      prisma.activity.groupBy({
        by: ['phoneme'],
        where: { status: 'PUBLISHED' },
        _count: { phoneme: true },
        orderBy: { _count: { phoneme: 'desc' } },
      }),
    ]);

    // Get activity names for top downloads
    const topActivityIds = topActivities.map((t) => t.activityId);
    const topActivityNames = topActivityIds.length > 0
      ? await prisma.activity.findMany({
          where: { id: { in: topActivityIds } },
          select: { id: true, name: true, phoneme: true },
        })
      : [];

    const downloadGrowth = downloadsLastMonth > 0
      ? Math.round(((downloadsThisMonth - downloadsLastMonth) / downloadsLastMonth) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          thisMonth: usersThisMonth,
          pro: proUsers,
          free: totalUsers - proUsers,
          conversionRate: totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0,
        },
        library: {
          total: totalActivities,
          addedThisWeek: activitiesThisWeek,
          pendingReview,
        },
        downloads: {
          thisMonth: downloadsThisMonth,
          lastMonth: downloadsLastMonth,
          growth: downloadGrowth,
          topActivities: topActivities.map((t) => {
            const activity = topActivityNames.find((a) => a.id === t.activityId);
            return { name: activity?.name || 'Unknown', phoneme: activity?.phoneme, count: t._count.activityId };
          }),
        },
        phonemes: phonemeDistribution.map((p) => ({
          phoneme: p.phoneme,
          count: p._count.phoneme,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
