import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exercise, metadata } = await request.json();

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    let yPosition = height - 80;

    // Header with logo area
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width: width,
      height: 60,
      color: rgb(0.4, 0.2, 0.8), // Purple header
    });

    // Title
    page.drawText('FonoSaaS - Exercício Terapêutico', {
      x: 50,
      y: height - 40,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    yPosition -= 100;

    // Exercise title
    page.drawText(exercise.titulo || 'Exercício Personalizado', {
      x: 50,
      y: yPosition,
      size: 16,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 40;

    // Metadata box
    page.drawRectangle({
      x: 50,
      y: yPosition - 60,
      width: width - 100,
      height: 60,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText(
      `Fonema: ${metadata.phoneme} | Idade: ${metadata.age} anos | Nível: ${metadata.difficulty}`,
      {
        x: 60,
        y: yPosition - 25,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    page.drawText(
      `Gerado em: ${new Date(metadata.generatedAt).toLocaleDateString('pt-BR')}`,
      {
        x: 60,
        y: yPosition - 45,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    yPosition -= 100;

    // Objective section
    page.drawText('🎯 OBJETIVO', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;
    const objectiveLines = wrapText(exercise.objetivo || '', 70);
    for (const line of objectiveLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Instructions section
    page.drawText('📋 INSTRUÇÕES', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;
    const instructions = exercise.instrucoes || [];
    instructions.forEach((instruction: string, index: number) => {
      page.drawText(`${index + 1}. ${instruction}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 20;
    });

    yPosition -= 20;

    // Materials section
    page.drawText('🧰 MATERIAIS', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 25;
    const materials = exercise.materiais || [];
    materials.forEach((material: string) => {
      page.drawText(`• ${material}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 15;
    });

    yPosition -= 20;

    // Time and observations
    if (exercise.tempo) {
      page.drawText(`⏱️ DURAÇÃO: ${exercise.tempo}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 25;
    }

    if (exercise.observacoes) {
      page.drawText('💡 OBSERVAÇÕES', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 20;

      const observationLines = wrapText(exercise.observacoes, 70);
      for (const line of observationLines) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 15;
      }
    }

    // Footer
    page.drawText('Gerado por FonoSaaS - Plataforma para Fonoaudiólogos', {
      x: 50,
      y: 50,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="exercicio-${metadata.phoneme}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}
