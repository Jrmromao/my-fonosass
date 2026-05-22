import { PDFDocument } from 'pdf-lib';

/**
 * Wraps a PNG image into an A4 PDF page.
 */
export async function imageToPDF(imageBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const image = await doc.embedPng(imageBytes);

  // A4 dimensions
  const pageWidth = 595;
  const pageHeight = 842;
  const page = doc.addPage([pageWidth, pageHeight]);

  // Scale image to fit A4 with margins
  const margin = 20;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;
  const scale = Math.min(maxW / image.width, maxH / image.height);

  const w = image.width * scale;
  const h = image.height * scale;
  const x = (pageWidth - w) / 2;
  const y = (pageHeight - h) / 2;

  page.drawImage(image, { x, y, width: w, height: h });

  return doc.save();
}
