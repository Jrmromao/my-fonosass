import { NextRequest, NextResponse } from 'next/server';
import { waitingListManager } from '@/lib/waiting-list-utils';
import { guardAdminActor } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';

export async function GET(request: NextRequest) {
  const admin = await guardAdminActor();
  if ('response' in admin) return admin.response;

  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    const format = url.searchParams.get('format') || 'json';

    // Reading the list exposes subscribers' emails and IPs: leave a trail.
    const audited = await recordAudit({
      action: AuditAction.WAITING_LIST_READ,
      actorType: 'ADMIN',
      actorId: admin.dbUserId,
      request,
      metadata: { format, dated: !!date },
    });
    // Personal data (emails, IPs): no trail, no read.
    if (!audited) {
      return NextResponse.json(
        { error: 'Audit log unavailable, try again' },
        { status: 503 }
      );
    }

    let data: any;

    if (format === 'csv') {
      const csvData = await waitingListManager.exportAsCSV(date || undefined);
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="waiting-list-${date || 'all'}.csv"`,
        },
      });
    } else if (format === 'stats') {
      data = await waitingListManager.getStatistics();
    } else {
      data = date
        ? await waitingListManager.getEntriesForDate(date)
        : await waitingListManager.getAllEntries();
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching waiting list data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
