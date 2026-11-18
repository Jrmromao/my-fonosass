import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

const mockUploadFile = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/services/S3Service', () => ({
  __esModule: true,
  default: { getInstance: () => ({ uploadFile: mockUploadFile }) },
}));

import PDFService, {
  WATERMARK,
  buildWatermarkedPDF,
  drawLogoWatermark,
} from '@/services/PDFService';

// Real pdf-lib: small fixtures generated in memory. Converted to this
// realm's Uint8Array: jsdom's differs from Node's Buffer and pdf-lib checks it.
const bytes = (b: Uint8Array) => Uint8Array.from(b);
const png = async (w: number, h: number, color = '#ff8800') =>
  bytes(
    await sharp({
      create: { width: w, height: h, channels: 4, background: color },
    })
      .png()
      .toBuffer()
  );

const pdfWithPages = async (n: number) => {
  const doc = await PDFDocument.create();
  for (let i = 0; i < n; i++) doc.addPage([595, 842]);
  return bytes(await doc.save());
};

describe('drawLogoWatermark', () => {
  const page = () => ({ drawImage: jest.fn() });
  const logo = { width: 338, height: 269 } as never;

  it('tiles the logo inside the area, subtle and rotated', () => {
    const p = page();
    drawLogoWatermark(p as never, logo, {
      x: 0,
      y: 0,
      width: 595,
      height: 842,
    });

    expect(p.drawImage.mock.calls.length).toBeGreaterThanOrEqual(6);
    for (const [, opts] of p.drawImage.mock.calls as [unknown, any][]) {
      expect(opts.opacity).toBe(WATERMARK.opacity);
      expect(opts.width).toBe(WATERMARK.logoWidth);
      expect(opts.x).toBeGreaterThanOrEqual(0);
      expect(opts.x + opts.width).toBeLessThanOrEqual(595);
      expect(opts.y + opts.height).toBeLessThanOrEqual(842);
    }
  });

  it('draws nothing when the area is smaller than one tile', () => {
    const p = page();
    drawLogoWatermark(p as never, logo, { x: 0, y: 0, width: 50, height: 50 });
    expect(p.drawImage).not.toHaveBeenCalled();
  });
});

describe('PDF builders (real pdf-lib)', () => {
  it('watermarks every page of an uploaded PDF and keeps the page count', async () => {
    const out = await buildWatermarkedPDF(
      await pdfWithPages(3),
      await png(338, 269)
    );
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it('rejects a file that is not a PDF', async () => {
    await expect(
      buildWatermarkedPDF(
        bytes(Uint8Array.from([110, 111, 116, 32, 112, 100, 102])),
        await png(10, 10)
      )
    ).rejects.toBeTruthy();
  });
});

describe('PDFService uploads', () => {
  const service = PDFService.getInstance();

  beforeEach(() => {
    mockUploadFile.mockReset();
    mockUploadFile.mockResolvedValue({ Location: 'https://s3/x.pdf' });
  });

  it('uploads the watermarked PDF as application/pdf', async () => {
    await service.watermarkAndUploadPDF(
      await pdfWithPages(1),
      await png(338, 269),
      'act-1/sheet.pdf'
    );
    expect(mockUploadFile).toHaveBeenCalledWith(
      'act-1/sheet.pdf',
      expect.any(Uint8Array),
      'application/pdf'
    );
  });

  it('reports S3 failures with the key', async () => {
    mockUploadFile.mockRejectedValue(new Error('S3 down'));
    await expect(
      service.watermarkAndUploadPDF(
        await pdfWithPages(1),
        await png(338, 269),
        'act-1/sheet.pdf'
      )
    ).rejects.toThrow(/act-1\/sheet\.pdf.*S3 down/);
  });
});
