import { chromium } from 'playwright';

export interface PDFContent {
  title: string;
  description: string;
  content: string;
  category: string;
  ageGroup: string;
  tags: string[];
  downloadCount: number;
  rating: number;
  createdAt: string;
}

export async function generateResourcePDF(
  resource: PDFContent
): Promise<Buffer> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Create HTML content for the PDF
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${resource.title}</title>
      <style>
        @page {
          margin: 20mm 15mm 30mm 15mm;
          @bottom-center {
            content: "Gerado em " counter(page) " de " counter(pages) " | Almanaque da Fala | www.almanaquedafala.com.br";
            font-size: 10px;
            color: #888;
            border-top: 1px solid #ddd;
            padding-top: 5px;
          }
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px 60px 20px;
          background: white;
          position: relative;
        }
        
        /* Watermark */
        body::before {
          content: "Almanaque da Fala";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          font-weight: bold;
          color: rgba(233, 30, 99, 0.1);
          z-index: -1;
          pointer-events: none;
          white-space: nowrap;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #e91e63;
        }
        
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #e91e63;
          margin-bottom: 10px;
        }
        
        .description {
          font-size: 16px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .meta-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 14px;
          color: #888;
        }
        
        .meta-item {
          background: #f5f5f5;
          padding: 5px 12px;
          border-radius: 15px;
        }
        
        .content {
          margin-top: 30px;
        }
        
        .content h1 {
          font-size: 24px;
          color: #e91e63;
          margin: 30px 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e91e63;
        }
        
        .content h2 {
          font-size: 20px;
          color: #333;
          margin: 25px 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }
        
        .content h3 {
          font-size: 18px;
          color: #555;
          margin: 20px 0 10px 0;
        }
        
        .content p {
          margin: 12px 0;
          text-align: justify;
        }
        
        .content ul, .content ol {
          margin: 12px 0;
          padding-left: 25px;
        }
        
        .content li {
          margin: 6px 0;
        }
        
        .content strong {
          color: #e91e63;
          font-weight: bold;
        }
        
        
        .tags {
          margin: 20px 0;
          text-align: center;
        }
        
        .tag {
          display: inline-block;
          background: #e91e63;
          color: white;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          margin: 2px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${resource.title}</div>
        <div class="description">${resource.description}</div>
        <div class="meta-info">
          <span class="meta-item">📁 ${resource.category}</span>
          <span class="meta-item">👶 ${resource.ageGroup}</span>
          <span class="meta-item">⭐ ${resource.rating}/5</span>
          <span class="meta-item">📥 ${resource.downloadCount} downloads</span>
        </div>
        <div class="tags">
          ${resource.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      
      <div class="content">
        ${convertMarkdownToHTML(resource.content)}
      </div>
      
    </body>
    </html>
  `;

  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '30mm',
      left: '15mm',
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size: 10px; color: #888; text-align: center; width: 100%; border-top: 1px solid #ddd; padding-top: 5px;">
        Gerado em ${new Date().toLocaleDateString('pt-BR')} | Almanaque da Fala | www.almanaquedafala.com.br
      </div>
    `,
  });

  await browser.close();
  return pdfBuffer;
}

function convertMarkdownToHTML(markdown: string): string {
  return (
    markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')

      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Lists
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

      // Wrap list items in ul/ol
      .replace(/(<li>.*<\/li>)/gs, (match) => {
        if (match.includes('<li>') && !match.includes('<ul>')) {
          return `<ul>${match}</ul>`;
        }
        return match;
      })

      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|l]|<div|<table)/gm, '<p>')
      .replace(/<p><\/p>/g, '')

      // Clean up empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
  );
}
