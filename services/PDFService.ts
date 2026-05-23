import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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

  // // New method to watermark PDF and upload to S3
  // public async watermarkAndUploadPDF(
  //     inputPDF: Buffer | Uint8Array,
  //     watermarkText: string,
  //     key: string,
  // ): Promise<CompleteMultipartUploadCommandOutput> {
  //     try {
  //         // Load the PDF
  //         const pdfDoc = await PDFDocument.load(inputPDF);
  //
  //         // Embed the font
  //         const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  //
  //         // Get all pages
  //         const pages = pdfDoc.getPages();
  //
  //         // Add watermark to each page
  //         pages.forEach((page) => {
  //             const { width, height } = page.getSize();
  //             const fontSize = 50;
  //
  //             page.drawText(watermarkText, {
  //                 x: width / 4,
  //                 y: height / 2,
  //                 size: fontSize,
  //                 font,
  //                 color: rgb(0.95, 0.1, 0.1), // Red color
  //                 opacity: 0.3, // Semi-transparent
  //                 renderingMode: 1, // Outline rendering mode
  //                 lineHeight: fontSize,
  //                 lineGap: fontSize / 2,
  //                 rotation: 45,
  //                 // @ts-expect-error
  //                 rotate: { type: 'radians', angle: 45 },
  //             });
  //         });
  //
  //         // Save the modified PDF as Uint8Array
  //         const pdfBytes = await pdfDoc.save();
  //
  //         // Upload to S3 using the existing uploadFile method
  //         return await this.s3Service.uploadFile(key, pdfBytes, 'application/pdf');
  //
  //
  //     } catch (error: unknown) {
  //         const errorMessage =
  //             error instanceof Error ? error.message : 'Unknown error';
  //         throw new Error(
  //             `Failed to watermark and upload PDF with key ${key}: ${errorMessage}`,
  //         );
  //     }
  // }

  public async watermarkAndUploadPDF(
    inputPDF: Buffer | Uint8Array,
    watermarkLogo: Buffer | Uint8Array, // Logo image as Buffer
    watermarkText: string | null, // Optional text watermark
    key: string,
    options: {
      logoScale?: number; // Scale factor for logo size (default: 0.1)
      tileSpacing?: number; // Spacing between logo tiles in pixels (default: 100)
      logoOpacity?: number; // Opacity of logo watermark (default: 0.3)
      logoRotation?: number; // Rotation angle in degrees (default: 0)
    } = {}
  ): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      // Default options
      const {
        logoScale = 0.1,
        tileSpacing = 100,
        logoOpacity = 0.3,
        logoRotation = 0,
      } = options;

      // Load the PDF
      const pdfDoc = await PDFDocument.load(inputPDF);

      // Embed the logo image (assuming PNG; use embedJpg for JPEG)
      const logoImage = await pdfDoc.embedPng(watermarkLogo);

      // Embed font for optional text watermark
      const font = watermarkText
        ? await pdfDoc.embedFont(StandardFonts.Helvetica)
        : null;

      // Get all pages
      const pages = pdfDoc.getPages();

      // Add watermark to each page
      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Tile the logo in a grid pattern
        const logoDims = logoImage.scale(logoScale); // Scale logo size
        const logoWidth = logoDims.width;
        const logoHeight = logoDims.height;

        // Calculate number of tiles in x and y directions
        const tilesX = Math.ceil(width / tileSpacing);
        const tilesY = Math.ceil(height / tileSpacing);

        // Place logo at each grid position
        for (let x = 0; x < tilesX; x++) {
          for (let y = 0; y < tilesY; y++) {
            const posX = x * tileSpacing + tileSpacing / 2 - logoWidth / 2;
            const posY = y * tileSpacing + tileSpacing / 2 - logoHeight / 2;

            // Ensure logo is within page bounds
            if (posX + logoWidth > width || posY + logoHeight > height)
              continue;

            page.drawImage(logoImage, {
              x: posX,
              y: posY,
              width: logoWidth,
              height: logoHeight,
              opacity: logoOpacity,
              // @ts-ignore
              rotate: { type: 'degrees', angle: logoRotation },
            });
          }
        }

        // Add optional text watermark (centered, as before)
        if (watermarkText && font) {
          const fontSize = 50;
          page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(0.95, 0.1, 0.1), // Red color
            opacity: 0.3,
            renderingMode: 1, // Outline rendering mode
            // @ts-ignore
            rotate: { type: 'degrees', angle: 45 },
          });
        }
      });

      // Save the modified PDF as Uint8Array
      const pdfBytes = await pdfDoc.save();

      // Upload to S3
      return await this.s3Service.uploadFile(key, pdfBytes, 'application/pdf');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to watermark and upload PDF with key ${key}: ${errorMessage}`
      );
    }
  }
  /**
   * Wraps an image (PNG/JPG) in a branded PDF with header, footer, and watermark.
   * Brand: almanaquedafala.com.br | Primary: indigo-600, Accent: pink-500
   */
  public async createBrandedPDF(
    imageBuffer: Buffer | Uint8Array,
    imageType: 'png' | 'jpg',
    metadata: {
      title: string;
      phoneme: string;
      difficulty: string;
      ageRange: string;
    },
    key: string
  ): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Brand colors (indigo-600, pink-500, gray)
      const indigo = rgb(79 / 255, 70 / 255, 229 / 255);
      const gray400 = rgb(156 / 255, 163 / 255, 175 / 255);
      const gray900 = rgb(17 / 255, 24 / 255, 39 / 255);

      // Embed image
      const image =
        imageType === 'png'
          ? await pdfDoc.embedPng(imageBuffer)
          : await pdfDoc.embedJpg(imageBuffer);

      // Page layout
      const margin = 40;
      const headerHeight = 60;
      const footerHeight = 40;
      const maxWidth = 595 - margin * 2;
      const scale = Math.min(maxWidth / image.width, 1);
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;
      const pageWidth = 595;
      const pageHeight = imgHeight + headerHeight + footerHeight + margin * 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Header bar
      page.drawRectangle({
        x: 0,
        y: pageHeight - headerHeight,
        width: pageWidth,
        height: headerHeight,
        color: indigo,
      });

      page.drawText('almanaquedafala.com.br', {
        x: margin,
        y: pageHeight - 38,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText(metadata.title, {
        x: margin,
        y: pageHeight - 54,
        size: 10,
        font,
        color: rgb(1, 1, 1),
      });

      // Image centered
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = footerHeight + margin;
      page.drawImage(image, {
        x: imgX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      });

      // Footer
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: footerHeight,
        color: rgb(249 / 255, 250 / 255, 251 / 255),
      });

      page.drawLine({
        start: { x: 0, y: footerHeight },
        end: { x: pageWidth, y: footerHeight },
        thickness: 1,
        color: rgb(243 / 255, 244 / 255, 246 / 255),
      });

      const footerText = `Fonema /${metadata.phoneme}/ | ${metadata.difficulty} | ${metadata.ageRange}`;
      page.drawText(footerText, {
        x: margin,
        y: 14,
        size: 9,
        font,
        color: gray400,
      });

      page.drawText('almanaquedafala.com.br', {
        x:
          pageWidth -
          margin -
          font.widthOfTextAtSize('almanaquedafala.com.br', 9),
        y: 14,
        size: 9,
        font,
        color: gray900,
      });

      const pdfBytes = await pdfDoc.save();
      return await this.s3Service.uploadFile(key, pdfBytes, 'application/pdf');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create branded PDF: ${errorMessage}`);
    }
  }
}

export default PDFService;
