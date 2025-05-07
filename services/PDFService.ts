

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
            const font = watermarkText ? await pdfDoc.embedFont(StandardFonts.Helvetica) : null;

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
                        if (posX + logoWidth > width || posY + logoHeight > height) continue;

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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to watermark and upload PDF with key ${key}: ${errorMessage}`);
        }
    }
}


export default PDFService;
