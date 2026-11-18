import path from 'path';
import sharp from 'sharp';

/**
 * Burns the app logo into an activity image as a tiled watermark, adds a
 * pt-BR copyright strip below it ("Todos os direitos reservados"), and keeps
 * the image format (PNG stays PNG, JPEG stays JPEG), so library previews and
 * the free samples (which need an image file) keep working.
 *
 * Subtle on purpose: the sheet must stay readable and printable.
 */
export const IMAGE_WATERMARK = {
  /** Logo width as a share of the image width. */
  logoShare: 0.16,
  minLogoWidth: 80,
  /** Gap between tiles, in logo widths / heights. */
  gapX: 1.25,
  gapY: 1.0,
  opacity: 0.1,
  rotation: -18,
};

/** Bundled with the function (next.config.js outputFileTracingIncludes):
 * serverless hosts have almost no system fonts. Inter, SIL OFL. */
const FOOTER_FONT_FILE = path.join(
  process.cwd(),
  'assets',
  'fonts',
  'Inter-Medium.ttf'
);

export const IMAGE_FOOTER = {
  /** Strip height as a share of the image width. */
  heightShare: 0.04,
  minHeight: 32,
  background: '#ffffff',
  border: '#e4e4e7', // neutral-200
  color: '#52525b', // neutral-600
};

export function copyrightText(year = new Date().getFullYear()): string {
  return `© ${year} Almanaque da Fala · Todos os direitos reservados · almanaquedafala.com.br`;
}

/** The copyright line rendered as a transparent PNG, at most `maxWidth`. */
async function renderFooterText(
  text: string,
  fontPx: number,
  maxWidth: number
) {
  const render = (px: number) =>
    sharp({
      text: {
        text: `<span foreground="${IMAGE_FOOTER.color}">${text}</span>`,
        font: `Inter Medium ${px}px`,
        fontfile: FOOTER_FONT_FILE,
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });

  let out = await render(fontPx);
  if (out.info.width > maxWidth) {
    // Narrow image: shrink the font to fit on one line.
    out = await render(
      Math.max(8, Math.floor((fontPx * maxWidth) / out.info.width))
    );
  }
  return out;
}

export type WatermarkableType = 'image/png' | 'image/jpeg';

export function isWatermarkableImage(type: string): type is WatermarkableType {
  return type === 'image/png' || type === 'image/jpeg';
}

export async function watermarkImage(
  input: Buffer | Uint8Array,
  logoPng: Buffer | Uint8Array,
  type: WatermarkableType
): Promise<Buffer> {
  // Apply EXIF orientation first, so tiles follow the visible image.
  const oriented = await sharp(input)
    .rotate()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = oriented.info;
  if (!width || !height) throw new Error('Imagem sem dimensões.');

  const logoWidth = Math.max(
    IMAGE_WATERMARK.minLogoWidth,
    Math.round(width * IMAGE_WATERMARK.logoShare)
  );

  // Logo tile: resized, faded (alpha × opacity), rotated on transparent.
  const tile = await sharp(logoPng)
    .resize({ width: logoWidth })
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([
          255,
          255,
          255,
          Math.round(255 * IMAGE_WATERMARK.opacity),
        ]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'dest-in',
      },
    ])
    .rotate(IMAGE_WATERMARK.rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const tw = tile.info.width;
  const th = tile.info.height;
  const stepX = Math.round(tw * (1 + IMAGE_WATERMARK.gapX));
  const stepY = Math.round(th * (1 + IMAGE_WATERMARK.gapY));

  // Staggered grid, kept fully inside the image.
  const overlays: sharp.OverlayOptions[] = [];
  let row = 0;
  for (let top = Math.round(th / 3); top + th <= height; top += stepY, row++) {
    const offset = row % 2 === 0 ? 0 : Math.round(stepX / 2);
    for (
      let left = Math.round(tw / 4) + offset;
      left + tw <= width;
      left += stepX
    ) {
      overlays.push({ input: tile.data, left, top });
    }
  }

  const marked = await sharp(oriented.data)
    .composite(overlays)
    .png()
    .toBuffer();

  // Copyright strip added below the activity, so it never covers content.
  const footerH = Math.max(
    IMAGE_FOOTER.minHeight,
    Math.round(width * IMAGE_FOOTER.heightShare)
  );
  const label = await renderFooterText(
    copyrightText(),
    Math.round(footerH * 0.38),
    Math.round(width * 0.94)
  );
  const border = Math.max(1, Math.round(footerH / 32));

  const out = sharp(marked)
    .extend({ bottom: footerH, background: IMAGE_FOOTER.background })
    .composite([
      {
        input: {
          create: {
            width,
            height: border,
            channels: 4,
            background: IMAGE_FOOTER.border,
          },
        },
        left: 0,
        top: height,
      },
      {
        input: label.data,
        left: Math.round((width - label.info.width) / 2),
        top: height + Math.round((footerH - label.info.height) / 2),
      },
    ]);
  // Re-encoding also drops EXIF/GPS metadata from the upload.
  return type === 'image/png'
    ? out.png({ compressionLevel: 9 }).toBuffer()
    : out.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}
