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
    const isChild = metadata.age <= 12;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const { width, height } = page.getSize();
    let yPosition = height - 80;

    // Premium gradient header
    const headerHeight = 80;
    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width: width,
      height: headerHeight,
      color: rgb(0.3, 0.1, 0.7), // Deep purple
    });

    // Header accent line
    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width: width,
      height: 4,
      color: rgb(0.9, 0.3, 0.6), // Pink accent
    });

    // Premium title with larger font
    page.drawText('Almanaque da Fala', {
      x: 50,
      y: height - 35,
      size: 24,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText('Exercicio Terapeutico Personalizado', {
      x: 50,
      y: height - 55,
      size: 12,
      font: italicFont,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Watermark - diagonal text across page
    page.drawText('ALMANAQUEDAFALA.COM.BR', {
      x: width / 2 - 120,
      y: height / 2,
      size: 50,
      font: boldFont,
      color: rgb(0.95, 0.95, 0.95),
      rotate: { type: 'degrees', angle: -45 },
    });

    yPosition -= 120;

    // Premium exercise title with background
    const titleBg = exercise.titulo || 'Exercicio Personalizado';
    page.drawRectangle({
      x: 40,
      y: yPosition - 25,
      width: width - 80,
      height: 35,
      color: isChild ? rgb(1, 0.95, 0.8) : rgb(0.95, 0.95, 1), // Warm yellow for kids, light blue for adults
    });

    page.drawText(titleBg, {
      x: 50,
      y: yPosition - 10,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    yPosition -= 60;

    // Premium metadata box with rounded corners effect
    page.drawRectangle({
      x: 50,
      y: yPosition - 70,
      width: width - 100,
      height: 70,
      color: rgb(0.98, 0.98, 0.98),
    });

    page.drawRectangle({
      x: 50,
      y: yPosition - 70,
      width: width - 100,
      height: 3,
      color: rgb(0.3, 0.1, 0.7),
    });

    // Child-friendly or professional metadata
    const ageLabel = isChild
      ? `Crianca de ${metadata.age} anos`
      : `${metadata.age} anos`;
    page.drawText(
      `Fonema: ${metadata.phoneme} | Idade: ${ageLabel} | Nivel: ${metadata.difficulty}`,
      {
        x: 60,
        y: yPosition - 25,
        size: 11,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      }
    );

    page.drawText(
      `Gerado em: ${new Date(metadata.generatedAt).toLocaleDateString('pt-BR')}`,
      {
        x: 60,
        y: yPosition - 45,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      }
    );

    page.drawText('Powered by Inteligencia Artificial', {
      x: 60,
      y: yPosition - 60,
      size: 9,
      font: italicFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    yPosition -= 100;

    // Premium section headers with colored backgrounds
    const drawSectionHeader = (
      title: string,
      color: [number, number, number]
    ) => {
      page.drawRectangle({
        x: 45,
        y: yPosition - 20,
        width: 150,
        height: 25,
        color: rgb(color[0], color[1], color[2]),
      });

      page.drawText(title, {
        x: 50,
        y: yPosition - 10,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      yPosition -= 35;
    };

    // Objective section
    drawSectionHeader('OBJETIVO', [0.2, 0.6, 0.8]);
    const objectiveLines = wrapText(exercise.objetivo || '', 70);
    for (const line of objectiveLines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 16;
    }
    yPosition -= 15;

    // Instructions section
    drawSectionHeader('INSTRUCOES', [0.8, 0.4, 0.2]);
    const instructions = exercise.instrucoes || [];
    instructions.forEach((instruction: string, index: number) => {
      const wrappedInstruction = wrapText(`${index + 1}. ${instruction}`, 65);
      wrappedInstruction.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: lineIndex === 0 ? 50 : 65,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 15;
      });
      yPosition -= 5;
    });

    // Materials section
    drawSectionHeader('MATERIAIS', [0.2, 0.7, 0.4]);
    const materials = exercise.materiais || [];
    materials.forEach((material: string) => {
      page.drawText(`• ${material}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 16;
    });
    yPosition -= 15;

    // Child-specific sections
    if (isChild && exercise.brincadeira) {
      drawSectionHeader('BRINCADEIRA', [0.9, 0.5, 0.1]);
      const brincadeiraLines = wrapText(exercise.brincadeira, 70);
      for (const line of brincadeiraLines) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 15;
      }
      yPosition -= 15;
    }

    if (isChild && exercise.recompensa) {
      drawSectionHeader('RECOMPENSA', [0.8, 0.2, 0.6]);
      const recompensaLines = wrapText(exercise.recompensa, 70);
      for (const line of recompensaLines) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= 15;
      }
      yPosition -= 15;
    }

    // Time and observations
    if (exercise.tempo) {
      page.drawText(`DURACAO: ${exercise.tempo}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 25;
    }

    if (exercise.observacoes) {
      drawSectionHeader('OBSERVACOES', [0.5, 0.5, 0.5]);
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

    // Premium footer with border
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 60,
      color: rgb(0.98, 0.98, 0.98),
    });

    page.drawRectangle({
      x: 0,
      y: 56,
      width: width,
      height: 4,
      color: rgb(0.3, 0.1, 0.7),
    });

    page.drawText(
      'Gerado por Almanaque da Fala - Plataforma Premium para Fonoaudiologos',
      {
        x: 50,
        y: 35,
        size: 10,
        font: boldFont,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    page.drawText(
      'www.almanaquedafala.com.br | Exercicios personalizados com IA',
      {
        x: 50,
        y: 20,
        size: 8,
        font: italicFont,
        color: rgb(0.6, 0.6, 0.6),
      }
    );

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
