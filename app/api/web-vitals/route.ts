import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const WebVitalsSchema = z.object({
  name: z.enum(['CLS', 'INP', 'FCP', 'LCP', 'TTFB']),
  value: z.number(),
  delta: z.number(),
  id: z.string(),
  url: z.string(),
  timestamp: z.number(),
  userAgent: z.string().optional(),
  connectionType: z.string().optional(),
  deviceMemory: z.number().optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = WebVitalsSchema.parse(body);

    // Log the web vitals data (in production, you might want to store this in a database)
    console.log('[Web Vitals] Received metric:', {
      name: validatedData.name,
      value: validatedData.value,
      delta: validatedData.delta,
      url: validatedData.url,
      timestamp: new Date(validatedData.timestamp).toISOString(),
      userAgent: validatedData.userAgent?.substring(0, 100), // Truncate for logging
      connectionType: validatedData.connectionType,
      deviceMemory: validatedData.deviceMemory,
      viewport: validatedData.viewport,
    });

    // Here you could store the data in a database, send to external services, etc.
    // For now, we'll just log it and return success

    return NextResponse.json(
      { success: true, message: 'Web vitals metric recorded' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Web Vitals] Error processing metric:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid web vitals data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // This endpoint could be used to retrieve web vitals data
  // For now, we'll return a simple status
  return NextResponse.json({
    success: true,
    message: 'Web vitals endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
