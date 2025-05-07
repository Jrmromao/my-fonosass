

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {CompleteMultipartUploadCommandOutput} from "@aws-sdk/client-s3";
import S3Service from "@/services/S3Service";

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

    // New method to watermark PDF and upload to S3
    public async watermarkAndUploadPDF(
        inputPDF: Buffer | Uint8Array,
        watermarkText: string,
        key: string,
    ): Promise<CompleteMultipartUploadCommandOutput> {
        try {
            // Load the PDF
            const pdfDoc = await PDFDocument.load(inputPDF);

            // Embed the font
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Get all pages
            const pages = pdfDoc.getPages();

            // Add watermark to each page
            pages.forEach((page) => {
                const { width, height } = page.getSize();
                const fontSize = 50;

                page.drawText(watermarkText, {
                    x: width / 4,
                    y: height / 2,
                    size: fontSize,
                    font,
                    color: rgb(0.95, 0.1, 0.1), // Red color
                    opacity: 0.3, // Semi-transparent
                    renderingMode: 1, // Outline rendering mode
                    lineHeight: fontSize,
                    lineGap: fontSize / 2,
                    rotation: 45,
                    // @ts-expect-error
                    rotate: { type: 'radians', angle: 45 },
                });
            });

            // Save the modified PDF as Uint8Array
            const pdfBytes = await pdfDoc.save();

            // Upload to S3 using the existing uploadFile method
            return await this.s3Service.uploadFile(key, pdfBytes, 'application/pdf');


        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            throw new Error(
                `Failed to watermark and upload PDF with key ${key}: ${errorMessage}`,
            );
        }
    }
}

export default PDFService;
