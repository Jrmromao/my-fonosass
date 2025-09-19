// app/api/test/route.ts
import { NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ message: 'API is working' });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}