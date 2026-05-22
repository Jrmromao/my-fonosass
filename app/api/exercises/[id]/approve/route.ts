import { prisma } from '@/app/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const activity = await prisma.activity.findUnique({ where: { id } });

  if (!activity) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
  }

  if (activity.approvalToken !== token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  if (activity.status === 'PUBLISHED') {
    return NextResponse.redirect(
      new URL(`/dashboard/exercises/review/${id}?already=true`, request.url)
    );
  }

  await prisma.activity.update({
    where: { id },
    data: { status: 'PUBLISHED', isPublic: true, approvalToken: null },
  });

  return NextResponse.redirect(
    new URL(`/dashboard/exercises/review/${id}?approved=true`, request.url)
  );
}
