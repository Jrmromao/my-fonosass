import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import S3Service from '@/services/S3Service';
import { csvCell } from '@/lib/security/csv';
import { getClientIp } from '@/lib/security/clientIp';
import { rateLimiters } from '@/lib/security/rateLimiter';
import { createHash } from 'crypto';
import { z } from 'zod';

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});

export async function POST(request: NextRequest) {
  try {
    const limit = await rateLimiters.userCreation.checkAsync(request);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    const { email } = parsed.data;

    const ip = getClientIp(request);

    // Create timestamp
    const timestamp = new Date().toISOString();

    const newEntry = {
      email,
      date: timestamp,
      ip_address: ip,
    };

    // Local copy is a development convenience only; production (serverless)
    // must not write PII to the app filesystem.
    let localSaveSuccess = false;
    try {
      if (process.env.NODE_ENV === 'production') throw new Error('skip-local');
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const csvPath = path.join(dataDir, 'waiting-list.csv');
      const csvHeader = 'email,date,ip_address\n';

      // Check if file exists, if not create it with header
      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, csvHeader);
      }

      // Create CSV row
      const csvRow = `${csvCell(email)},${csvCell(timestamp)},${csvCell(ip)}\n`;

      // Append to CSV file
      fs.appendFileSync(csvPath, csvRow);

      // Also save to a JSON file for easier processing
      const jsonPath = path.join(dataDir, 'waiting-list.json');
      let existingData = [];

      if (fs.existsSync(jsonPath)) {
        try {
          const fileContent = fs.readFileSync(jsonPath, 'utf8');
          existingData = JSON.parse(fileContent);
        } catch (err) {
          console.error('Error reading JSON file:', err);
        }
      }

      existingData.push(newEntry);
      fs.writeFileSync(jsonPath, JSON.stringify(existingData, null, 2));

      localSaveSuccess = true;
    } catch (localError) {
      // This is expected in production environments like Vercel
    }

    // Save to S3 bucket (primary storage for production)
    try {
      const s3Service = S3Service.getInstance();

      // Upload individual entry as JSON to S3 for real-time backup
      const emailHash = createHash('sha256')
        .update(email)
        .digest('hex')
        .slice(0, 16);
      const individualEntryKey = `waiting-list/entries/${timestamp}-${emailHash}.json`;
      const individualEntry = JSON.stringify(newEntry, null, 2);
      await s3Service.uploadFile(
        individualEntryKey,
        individualEntry,
        'application/json'
      );

      // Only upload daily files if local save was successful (development)
      if (localSaveSuccess) {
        const dataDir = path.join(process.cwd(), 'data');
        const csvPath = path.join(dataDir, 'waiting-list.csv');
        const jsonPath = path.join(dataDir, 'waiting-list.json');

        // Upload the complete daily files to S3
        const csvKey = `waiting-list/daily/waiting-list-${new Date().toISOString().split('T')[0]}.csv`;
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        await s3Service.uploadFile(csvKey, csvContent, 'text/csv');

        const jsonKey = `waiting-list/daily/waiting-list-${new Date().toISOString().split('T')[0]}.json`;
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        await s3Service.uploadFile(jsonKey, jsonContent, 'application/json');
      }
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);
      // Don't fail the request if S3 upload fails, just log the error
    }

    return NextResponse.json(
      { message: 'Email adicionado à lista de espera com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding email to waiting list:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
