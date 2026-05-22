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

  if (!activity || activity.approvalToken !== token) {
    return NextResponse.json({ error: 'Invalid' }, { status: 403 });
  }

  await prisma.activity.update({
    where: { id },
    data: { status: 'REJECTED', isPublic: false, approvalToken: null },
  });

  return NextResponse.redirect(
    new URL(`/dashboard/exercises/review/${id}?rejected=true`, request.url)
  );
}
