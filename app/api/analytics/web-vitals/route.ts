import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsData {
  name: string;
  value: number;
  id: string;
  delta: number;
  navigationType: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsData = await request.json();

    // Validate the data
    if (!data.name || typeof data.value !== 'number' || !data.id) {
      return NextResponse.json(
        { error: 'Invalid Web Vitals data' },
        { status: 400 }
      );
    }

    // Log the Web Vitals data (in production, you might want to store this in a database)
    console.log('[Web Vitals API] Received metric:', {
      name: data.name,
      value: data.value,
      rating: data.rating,
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString(),
    });

    // Here you could store the data in a database, send to external analytics, etc.
    // For now, we'll just log it and return success

    // Example: Store in database (uncomment and modify as needed)
    /*
    await prisma.webVitals.create({
      data: {
        name: data.name,
        value: data.value,
        id: data.id,
        delta: data.delta,
        navigationType: data.navigationType,
        rating: data.rating,
        url: data.url,
        timestamp: new Date(data.timestamp),
      },
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Web Vitals API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Vitals API endpoint',
    endpoints: {
      POST: 'Send Web Vitals data',
    },
  });
}
