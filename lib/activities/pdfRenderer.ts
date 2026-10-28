import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { activityBrand } from './brand';
import type { CrosswordPlacement } from './validateContent';

export type ActivityContent = {
  titulo: string;
  instrucoes: string;
  phoneme: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  ageRange: string;
  items: string[];
  answers?: string[];
  grid?: string[][];
  crossword?: CrosswordPlacement[];
};

export class ActivityPDFRenderer {
  private doc!: PDFDocument;
  private page!: ReturnType<PDFDocument['addPage']>;
  private font!: Awaited<ReturnType<PDFDocument['embedFont']>>;
  private boldFont!: Awaited<ReturnType<PDFDocument['embedFont']>>;
  private width = 595;
  private height = 842;
  private y = 0;
  private margin = 50;

  async init() {
    this.doc = await PDFDocument.create();
    this.page = this.doc.addPage([this.width, this.height]);
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.boldFont = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.y = this.height - 50;
  }

  drawHeader(title: string, phoneme: string, difficulty: string) {
    const { primary, white } = activityBrand.colors;

    // Header background
    this.page.drawRectangle({
      x: 0,
      y: this.height - 80,
      width: this.width,
      height: 80,
      color: rgb(primary.r, primary.g, primary.b),
    });

    // Title
    this.page.drawText(title, {
      x: this.margin,
      y: this.height - 45,
      size: 18,
      font: this.boldFont,
      color: rgb(white.r, white.g, white.b),
    });

    // Subtitle line
    const subtitle = `Fonema /${phoneme}/ • ${difficulty} • Almanaque da Fala`;
    this.page.drawText(subtitle, {
      x: this.margin,
      y: this.height - 65,
      size: 10,
      font: this.font,
      color: rgb(0.85, 0.85, 1),
    });

    this.y = this.height - 110;
  }

  drawInstructions(text: string) {
    const { accent } = activityBrand.colors;
    // Strip non-WinAnsi characters
    const safeText = text.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');

    // Instruction box
    this.page.drawRectangle({
      x: this.margin,
      y: this.y - 45,
      width: this.width - this.margin * 2,
      height: 40,
      color: rgb(1, 0.97, 0.88),
      borderColor: rgb(accent.r, accent.g, accent.b),
      borderWidth: 1.5,
    });

    this.page.drawText(safeText.slice(0, 80), {
      x: this.margin + 10,
      y: this.y - 30,
      size: 11,
      font: this.boldFont,
      color: rgb(0.3, 0.2, 0),
    });

    this.y -= 65;
  }

  drawWordGrid(items: string[], columns = 4) {
    const cellW = (this.width - this.margin * 2) / columns;
    const cellH = 60;

    items.forEach((item, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = this.margin + col * cellW;
      const y = this.y - row * cellH;

      // Cell border
      this.page.drawRectangle({
        x: x + 4,
        y: y - cellH + 8,
        width: cellW - 8,
        height: cellH - 8,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      // Word
      const safeItem = item.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
      const textWidth = this.font.widthOfTextAtSize(safeItem, 12);
      this.page.drawText(safeItem, {
        x: x + (cellW - textWidth) / 2,
        y: y - cellH / 2 + 2,
        size: 12,
        font: this.font,
        color: rgb(0.1, 0.1, 0.3),
      });
    });

    this.y -= Math.ceil(items.length / columns) * cellH + 20;
  }

  drawWordSearch(grid: string[][]) {
    const cellSize = 28;
    const startX = this.margin + 20;

    grid.forEach((row, ri) => {
      row.forEach((letter, ci) => {
        const x = startX + ci * cellSize;
        const y = this.y - ri * cellSize;

        this.page.drawRectangle({
          x,
          y: y - cellSize,
          width: cellSize,
          height: cellSize,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 0.5,
        });

        const tw = this.boldFont.widthOfTextAtSize(letter, 14);
        this.page.drawText(letter, {
          x: x + (cellSize - tw) / 2,
          y: y - cellSize + 8,
          size: 14,
          font: this.boldFont,
          color: rgb(0.15, 0.1, 0.3),
        });
      });
    });

    this.y -= grid.length * cellSize + 30;
  }

  drawBoardGamePath(items: string[]) {
    const cols = 5;
    const cellW = (this.width - this.margin * 2) / cols;
    const cellH = 50;

    // START
    this.page.drawText('>> INICIO', {
      x: this.margin + 10,
      y: this.y,
      size: 12,
      font: this.boldFont,
      color: rgb(0.13, 0.77, 0.37),
    });
    this.y -= 25;

    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = this.margin + col * cellW;
      const y = this.y - row * cellH;

      // Numbered circle
      this.page.drawCircle({
        x: x + 20,
        y: y - 15,
        size: 18,
        borderColor: rgb(0.39, 0.4, 0.95),
        borderWidth: 1.5,
      });

      this.page.drawText(`${i + 1}`, {
        x: x + 16,
        y: y - 19,
        size: 9,
        font: this.font,
        color: rgb(0.5, 0.5, 0.5),
      });

      this.page.drawText(item, {
        x: x + 5,
        y: y - 38,
        size: 9,
        font: this.font,
        color: rgb(0.1, 0.1, 0.3),
      });
    });

    const rows = Math.ceil(items.length / cols);
    this.y -= rows * cellH + 20;

    // FINISH
    this.page.drawText('** FIM! Parabens! **', {
      x: this.margin + 10,
      y: this.y,
      size: 12,
      font: this.boldFont,
      color: rgb(0.94, 0.62, 0.04),
    });
    this.y -= 30;
  }

  drawCrossword(grid: string[][], placements: CrosswordPlacement[]) {
    const cellSize = 24;
    const startX = this.margin + 10;

    // Map of "row,col" -> number for cells that start a word.
    const numberAt = new Map<string, number>();
    for (const p of placements) {
      numberAt.set(`${p.row},${p.col}`, p.number);
    }

    grid.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (cell === '') return; // blank (no box)
        const x = startX + ci * cellSize;
        const y = this.y - ri * cellSize;

        // Empty box for the child to write the letter.
        this.page.drawRectangle({
          x,
          y: y - cellSize,
          width: cellSize,
          height: cellSize,
          borderColor: rgb(0.6, 0.6, 0.7),
          borderWidth: 0.8,
        });

        const num = numberAt.get(`${ri},${ci}`);
        if (num !== undefined) {
          this.page.drawText(`${num}`, {
            x: x + 2,
            y: y - 9,
            size: 6,
            font: this.font,
            color: rgb(0.4, 0.4, 0.5),
          });
        }
      });
    });

    this.y -= grid.length * cellSize + 20;

    // Clue lists (Horizontais / Verticais).
    const across = placements.filter((p) => p.direction === 'across');
    const down = placements.filter((p) => p.direction === 'down');

    const drawClueSection = (label: string, list: CrosswordPlacement[]) => {
      if (list.length === 0) return;
      this.page.drawText(label, {
        x: this.margin,
        y: this.y,
        size: 11,
        font: this.boldFont,
        color: rgb(0.2, 0.15, 0.4),
      });
      this.y -= 16;
      for (const p of list) {
        const clue = `${p.number}. ${p.clue}`.replace(
          /[^\x20-\x7E\xA0-\xFF]/g,
          ''
        );
        this.page.drawText(clue.slice(0, 90), {
          x: this.margin + 8,
          y: this.y,
          size: 9,
          font: this.font,
          color: rgb(0.2, 0.2, 0.3),
        });
        this.y -= 13;
      }
      this.y -= 6;
    };

    drawClueSection('Horizontais:', across);
    drawClueSection('Verticais:', down);
  }

  drawWatermark() {
    const { watermark } = activityBrand;
    const size = 48;

    this.page.drawText(watermark.text, {
      x: 100,
      y: this.height / 2 - 20,
      size,
      font: this.font,
      color: rgb(0.7, 0.7, 0.9),
      opacity: watermark.opacity,
      rotate: degrees(-35),
    });
  }

  drawFooter() {
    this.page.drawRectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: 35,
      color: rgb(0.96, 0.96, 0.98),
    });

    this.page.drawText(activityBrand.footer, {
      x: this.margin,
      y: 12,
      size: 8,
      font: this.font,
      color: rgb(0.5, 0.5, 0.6),
    });
  }

  async render(): Promise<Uint8Array> {
    this.drawWatermark();
    this.drawFooter();
    return this.doc.save();
  }

  /**
   * Orchestrates a full activity render by type. Builds the header,
   * instructions, the type-specific body, watermark and footer, and returns
   * the PDF bytes. All layout is produced deterministically here — nothing
   * about the puzzle structure comes from the AI.
   */
  static async renderActivity(
    type: 'FIND_CIRCLE' | 'WORD_SEARCH' | 'BOARD_GAME' | 'CROSSWORD',
    content: ActivityContent
  ): Promise<Uint8Array> {
    const renderer = new ActivityPDFRenderer();
    await renderer.init();

    renderer.drawHeader(content.titulo, content.phoneme, content.difficulty);
    renderer.drawInstructions(content.instrucoes);

    switch (type) {
      case 'WORD_SEARCH':
        if (content.grid) renderer.drawWordSearch(content.grid);
        renderer.drawWordGrid(content.items, 3);
        break;
      case 'BOARD_GAME':
        renderer.drawBoardGamePath(content.items);
        break;
      case 'CROSSWORD':
        if (content.grid && content.crossword) {
          renderer.drawCrossword(content.grid, content.crossword);
        }
        break;
      case 'FIND_CIRCLE':
      default:
        renderer.drawWordGrid(content.items, 4);
        break;
    }

    return renderer.render();
  }
}
