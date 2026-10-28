/**
 * Renders a SortActivity to a print-ready A4 PDF via headless Chromium.
 *
 * Why HTML/CSS -> PDF (not pdf-lib): the professional reference worksheets rely
 * on rounded banner headers, confetti, colored category pills, dashed cut
 * lines, and layered illustrations — all trivial in CSS and painful in pdf-lib.
 * All TEXT is written by code here, so spelling is always correct; the image
 * model only supplies the per-card clip-art (passed in as PNG buffers).
 */
import type { SortActivity } from './sortActivity';

/** Rotating palette for zones/cards — mirrors the reference's bright borders. */
const PALETTE = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#a855f7', // purple
  '#f59e0b', // amber
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type CardImages = Map<string, string>; // UPPERCASE word -> data URI

/** Build the full HTML document for a sort activity. */
export function buildSortHtml(
  activity: SortActivity,
  cardImages: CardImages
): string {
  const zoneColor = (i: number) => PALETTE[i % PALETTE.length];

  // Destination zones: colored pill + icon, with blank dashed paste-slots.
  const zonesHtml = activity.zones
    .map((z, i) => {
      const color = zoneColor(i);
      const cardsInZone = activity.cards.filter(
        (c) => c.category === z.key
      ).length;
      const slots = Array.from({ length: Math.max(cardsInZone, 2) })
        .map(() => `<div class="slot"></div>`)
        .join('');
      return `
        <div class="zone" style="border-color:${color}">
          <div class="zone-pill" style="background:${color}">
            ${escapeHtml(z.label)} <span class="zone-icon">${z.icon}</span>
          </div>
          <div class="zone-slots">${slots}</div>
        </div>`;
    })
    .join('');

  // Cut-out cards: numbered badge, clip-art (or placeholder), word label.
  const cardsHtml = activity.cards
    .map((c, i) => {
      const color = zoneColor(i);
      const img = cardImages.get(c.word.toUpperCase());
      const pic = img
        ? `<img class="card-img" src="${img}" alt="" />`
        : `<div class="card-img card-img--empty"></div>`;
      return `
        <div class="card" style="border-color:${color}">
          <span class="scissors">&#9986;</span>
          <div class="card-num" style="border-color:${color}">${c.number}</div>
          ${pic}
          <div class="card-word">${escapeHtml(c.word.toLocaleUpperCase('pt-BR'))}</div>
        </div>`;
    })
    .join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Nunito', 'Baloo 2', 'Segoe UI', system-ui, sans-serif;
    width: 210mm; height: 297mm; overflow: hidden;
    background:
      radial-gradient(circle at 8% 6%, #fde68a55 0 6px, transparent 7px),
      radial-gradient(circle at 92% 5%, #fca5a555 0 6px, transparent 7px),
      radial-gradient(circle at 15% 3%, #a5b4fc55 0 5px, transparent 6px),
      #ffffff;
    padding: 8mm 8mm 0;
    color: #1e293b;
  }
  /* Header banner */
  .banner {
    background: #14b8a6;
    border-radius: 28px;
    padding: 10px;
    margin-bottom: 6px;
    box-shadow: 0 4px 0 #0d9488;
  }
  .banner-inner {
    background: #fde047;
    border-radius: 20px;
    text-align: center;
    padding: 10px 16px;
  }
  .banner h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.5px;
    color: #1e3a8a;
    text-shadow: 2px 2px 0 #ffffff;
    text-transform: uppercase;
  }
  .subtitle {
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    color: #1e3a8a;
    margin: 5px 0 8px;
  }
  /* Destination zones */
  .zones {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 8px;
  }
  .zone {
    border: 3px solid;
    border-radius: 14px;
    padding: 5px;
    min-height: 92px;
  }
  .zone-pill {
    color: #fff;
    font-weight: 900;
    font-size: 14px;
    border-radius: 10px;
    padding: 4px 9px;
    display: inline-block;
    margin-bottom: 5px;
    text-shadow: 1px 1px 0 rgba(0,0,0,0.15);
  }
  .zone-icon { font-size: 13px; }
  .zone-slots { display: flex; flex-wrap: wrap; gap: 5px; }
  .slot {
    flex: 1 1 42%;
    min-width: 42%;
    height: 50px;
    border: 2px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
  }
  /* Cut strip divider */
  .cut-strip {
    display: flex; align-items: center; justify-content: space-between;
    background: #bbf7d0;
    border-radius: 10px;
    padding: 3px 12px;
    font-weight: 800; font-size: 12px; color: #166534;
    margin: 2px 0 8px;
  }
  /* Cards */
  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .card {
    position: relative;
    border: 3px dashed;
    border-radius: 14px;
    background: #fff;
    padding: 6px 4px 4px;
    text-align: center;
  }
  .scissors { position: absolute; top: 3px; right: 5px; font-size: 12px; color: #94a3b8; }
  .card-num {
    position: absolute; top: 5px; left: 6px;
    width: 20px; height: 20px; line-height: 18px;
    border: 2px solid; border-radius: 50%;
    background: #fff; font-weight: 900; font-size: 11px;
  }
  .card-img {
    display: block; margin: 4px auto 2px;
    width: 72px; height: 72px; object-fit: contain;
  }
  .card-img--empty { background: transparent; }
  .card-word {
    font-weight: 900; font-size: 15px; color: #1e3a8a;
    letter-spacing: 0.3px;
  }
  /* Footer tip */
  .footer {
    margin-top: 8px;
    background: #ef4444;
    color: #fff;
    border-radius: 12px;
    text-align: center;
    font-weight: 800; font-size: 13px;
    padding: 7px 12px;
  }
  .footer .star { color: #fde047; }
  .brand { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 5px; }
</style>
</head>
<body>
  <div class="banner"><div class="banner-inner"><h1>${escapeHtml(activity.title)}</h1></div></div>
  <div class="subtitle">${escapeHtml(activity.instructions)}</div>
  <div class="zones">${zonesHtml}</div>
  <div class="cut-strip"><span>RECORTE AQUI</span><span>&#9986;</span></div>
  <div class="cards">${cardsHtml}</div>
  <div class="footer"><span class="star">&#9733;</span> ${escapeHtml(activity.footer)}</div>
  <div class="brand">almanaquedafala.com.br &bull; Exerc&iacute;cio gerado por IA, validado por fonoaudi&oacute;logo</div>
</body>
</html>`;
}

/**
 * Render the HTML to PDF bytes using Playwright Chromium. Lazy-imports
 * playwright so environments that never render a sort activity don't pay for
 * the browser launch at module load.
 */
export async function renderSortPdf(
  activity: SortActivity,
  cardImages: CardImages
): Promise<Buffer> {
  const { chromium } = await import('playwright');
  const html = buildSortHtml(activity, cardImages);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
