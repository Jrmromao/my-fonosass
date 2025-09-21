import PDFService from '@/services/PDFService';
import React from 'react';

// Mock S3Service
const mockUploadFile = jest.fn();
jest.mock('@/services/S3Service', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      uploadFile: mockUploadFile
    }))
  }
}));

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(),
  Document: ({ children }: { children: React.ReactNode }) => children,
  Page: ({ children }: { children: React.ReactNode }) => children,
  Text: ({ children }: { children: React.ReactNode }) => children,
  View: ({ children }: { children: React.ReactNode }) => children,
  Image: ({ src }: { src: string }) => src,
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  Font: {
    register: jest.fn(),
  },
}));

// Mock pdf-lib
jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(() => ({
      addPage: jest.fn(),
      getPageCount: jest.fn(() => 1),
      save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
    })),
    load: jest.fn(() => Promise.resolve({
      addPage: jest.fn(),
      getPageCount: jest.fn(() => 1),
      save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
      embedPng: jest.fn(() => ({
        scale: jest.fn(() => ({ width: 100, height: 100 })),
      })),
      embedFont: jest.fn(() => ({})),
      getPages: jest.fn(() => [{
        getSize: jest.fn(() => ({ width: 800, height: 600 })),
        drawImage: jest.fn(),
        drawText: jest.fn(),
      }]),
    })),
  },
  rgb: jest.fn(() => ({ r: 0, g: 0, b: 0 })),
  StandardFonts: {
    Helvetica: 'Helvetica',
  },
}));

describe('PDFService', () => {
  let pdfService: PDFService;

  beforeEach(() => {
    pdfService = PDFService.getInstance();
    jest.clearAllMocks();
  });

  describe('watermarkAndUploadPDF', () => {
    it('should watermark and upload PDF successfully', async () => {
      const inputPDF = new Uint8Array([1, 2, 3, 4]);
      const watermarkLogo = new Uint8Array([5, 6, 7, 8]);
      const watermarkText = 'FonoSaaS';
      const key = 'test.pdf';
      
      const mockS3Response = { ETag: 'test-etag', Location: 'test-location' };
      mockUploadFile.mockResolvedValue(mockS3Response);

      const result = await pdfService.watermarkAndUploadPDF(inputPDF, watermarkLogo, watermarkText, key);

      expect(result).toEqual(mockS3Response);
      expect(mockUploadFile).toHaveBeenCalledWith(key, expect.any(Uint8Array), 'application/pdf');
    });

    it('should handle watermark errors', async () => {
      const inputPDF = new Uint8Array([1, 2, 3, 4]);
      const watermarkLogo = new Uint8Array([5, 6, 7, 8]);
      const watermarkText = 'FonoSaaS';
      const key = 'test.pdf';
      
      // Mock PDFDocument.load to throw an error
      const { PDFDocument } = require('pdf-lib');
      PDFDocument.load.mockRejectedValue(new Error('PDF load failed'));

      await expect(pdfService.watermarkAndUploadPDF(inputPDF, watermarkLogo, watermarkText, key))
        .rejects.toThrow('Failed to watermark and upload PDF with key test.pdf: PDF load failed');
    });

    it('should handle S3 upload errors', async () => {
      const inputPDF = new Uint8Array([1, 2, 3, 4]);
      const watermarkLogo = new Uint8Array([5, 6, 7, 8]);
      const watermarkText = 'FonoSaaS';
      const key = 'test.pdf';
      
      // Reset PDFDocument.load to success for this test
      const { PDFDocument } = require('pdf-lib');
      PDFDocument.load.mockResolvedValue({
        addPage: jest.fn(),
        getPageCount: jest.fn(() => 1),
        save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
        embedPng: jest.fn(() => ({
          scale: jest.fn(() => ({ width: 100, height: 100 })),
        })),
        embedFont: jest.fn(() => ({})),
        getPages: jest.fn(() => [{
          getSize: jest.fn(() => ({ width: 800, height: 600 })),
          drawImage: jest.fn(),
          drawText: jest.fn(),
        }]),
      });
      
      mockUploadFile.mockRejectedValue(new Error('S3 upload failed'));

      await expect(pdfService.watermarkAndUploadPDF(inputPDF, watermarkLogo, watermarkText, key))
        .rejects.toThrow('Failed to watermark and upload PDF with key test.pdf: S3 upload failed');
    });

    it('should work without text watermark', async () => {
      const inputPDF = new Uint8Array([1, 2, 3, 4]);
      const watermarkLogo = new Uint8Array([5, 6, 7, 8]);
      const key = 'test.pdf';
      
      // Reset PDFDocument.load to success for this test
      const { PDFDocument } = require('pdf-lib');
      PDFDocument.load.mockResolvedValue({
        addPage: jest.fn(),
        getPageCount: jest.fn(() => 1),
        save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
        embedPng: jest.fn(() => ({
          scale: jest.fn(() => ({ width: 100, height: 100 })),
        })),
        embedFont: jest.fn(() => ({})),
        getPages: jest.fn(() => [{
          getSize: jest.fn(() => ({ width: 800, height: 600 })),
          drawImage: jest.fn(),
          drawText: jest.fn(),
        }]),
      });
      
      const mockS3Response = { ETag: 'test-etag', Location: 'test-location' };
      mockUploadFile.mockResolvedValue(mockS3Response);

      const result = await pdfService.watermarkAndUploadPDF(inputPDF, watermarkLogo, null, key);

      expect(result).toEqual(mockS3Response);
      expect(mockUploadFile).toHaveBeenCalledWith(key, expect.any(Uint8Array), 'application/pdf');
    });

    it('should use custom options', async () => {
      const inputPDF = new Uint8Array([1, 2, 3, 4]);
      const watermarkLogo = new Uint8Array([5, 6, 7, 8]);
      const watermarkText = 'FonoSaaS';
      const key = 'test.pdf';
      const options = {
        logoScale: 0.2,
        tileSpacing: 150,
        logoOpacity: 0.5,
        logoRotation: 30
      };
      
      // Reset PDFDocument.load to success for this test
      const { PDFDocument } = require('pdf-lib');
      PDFDocument.load.mockResolvedValue({
        addPage: jest.fn(),
        getPageCount: jest.fn(() => 1),
        save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4]))),
        embedPng: jest.fn(() => ({
          scale: jest.fn(() => ({ width: 100, height: 100 })),
        })),
        embedFont: jest.fn(() => ({})),
        getPages: jest.fn(() => [{
          getSize: jest.fn(() => ({ width: 800, height: 600 })),
          drawImage: jest.fn(),
          drawText: jest.fn(),
        }]),
      });
      
      const mockS3Response = { ETag: 'test-etag', Location: 'test-location' };
      mockUploadFile.mockResolvedValue(mockS3Response);

      const result = await pdfService.watermarkAndUploadPDF(inputPDF, watermarkLogo, watermarkText, key, options);

      expect(result).toEqual(mockS3Response);
      expect(mockUploadFile).toHaveBeenCalledWith(key, expect.any(Uint8Array), 'application/pdf');
    });
  });
});
