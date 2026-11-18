import { degrees, PDFDocument, PDFImage, PDFPage } from 'pdf-lib';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import S3Service from '@/services/S3Service';

class PDFService {
  private static instance: PDFService;
  private s3Service: S3Service = S3Service.getInstance();

  private constructor() {
    // Private constructor to prevent instantiation
  }

  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Watermarks every page of an uploaded PDF with the logo and uploads it.
   */
  public async watermarkAndUploadPDF(
    inputPDF: Buffer | Uint8Array,
    logoPng: Buffer | Uint8Array,
    key: string
  ): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      const bytes = await buildWatermarkedPDF(inputPDF, logoPng);
      return await this.s3Service.uploadFile(key, bytes, 'application/pdf');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to watermark PDF ${key}: ${message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Pure builders (no S3), so the output can be rendered and checked locally.

/** Logo tile size, spacing and strength. Subtle so the sheet prints well. */
export const WATERMARK = {
  logoWidth: 96,
  spacingX: 210,
  spacingY: 180,
  opacity: 0.1,
  rotation: -18,
};

/**
 * Tiles the logo over `area` in staggered rows. Low opacity and wide spacing
 * so the activity stays readable and printable, while a copy is still
 * clearly marked.
 */
export function drawLogoWatermark(
  page: PDFPage,
  logo: PDFImage,
  area: { x: number; y: number; width: number; height: number }
) {
  const w = WATERMARK.logoWidth;
  const h = (logo.height / logo.width) * w;
  let row = 0;
  for (
    let y = area.y + WATERMARK.spacingY / 3;
    y + h <= area.y + area.height;
    y += WATERMARK.spacingY, row++
  ) {
    const offset = row % 2 === 0 ? 0 : WATERMARK.spacingX / 2;
    for (
      let x = area.x + 20 + offset;
      x + w <= area.x + area.width;
      x += WATERMARK.spacingX
    ) {
      page.drawImage(logo, {
        x,
        y,
        width: w,
        height: h,
        opacity: WATERMARK.opacity,
        rotate: degrees(WATERMARK.rotation),
      });
    }
  }
}

export async function buildWatermarkedPDF(
  inputPDF: Buffer | Uint8Array,
  logoPng: Buffer | Uint8Array
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(inputPDF);
  const logo = await pdfDoc.embedPng(logoPng);

  // Logo only: uploaded sheets already have their own header and footer,
  // so no extra text is added (it would overlap them).
  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    drawLogoWatermark(page, logo, { x: 0, y: 0, width, height });
  }
  return pdfDoc.save();
}

export default PDFService;
