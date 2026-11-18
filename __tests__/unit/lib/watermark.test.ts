import { describe, expect, it } from '@jest/globals';
import sharp from 'sharp';
import {
  IMAGE_FOOTER,
  IMAGE_WATERMARK,
  copyrightText,
  isWatermarkableImage,
  watermarkImage,
} from '@/lib/images/watermark';

const solid = (w: number, h: number, format: 'png' | 'jpeg') => {
  const img = sharp({
    create: { width: w, height: h, channels: 3, background: '#ffffff' },
  });
  return (format === 'png' ? img.png() : img.jpeg()).toBuffer();
};
// Opaque red logo: easy to detect on a white sheet.
const logo = () =>
  sharp({
    create: { width: 338, height: 269, channels: 4, background: '#ff0000' },
  })
    .png()
    .toBuffer();

const redShare = async (buf: Buffer) => {
  const { data, info } = await sharp(buf)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let tinted = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 240 && data[i + 1] < 250) tinted++;
  }
  return tinted / (info.width * info.height);
};

describe('watermarkImage', () => {
  it('keeps PNG as PNG and JPEG as JPEG, same width, plus the footer strip', async () => {
    for (const fmt of ['png', 'jpeg'] as const) {
      const out = await watermarkImage(
        await solid(1200, 1600, fmt),
        await logo(),
        `image/${fmt}`
      );
      const meta = await sharp(out).metadata();
      expect(meta.format).toBe(fmt);
      expect(meta.width).toBe(1200);
      // 1200 * 4% = 48 px strip below the activity.
      expect(meta.height).toBe(1600 + 1200 * IMAGE_FOOTER.heightShare);
    }
  });

  it('adds a visible but subtle watermark', async () => {
    const out = await watermarkImage(
      await solid(1200, 1600, 'png'),
      await logo(),
      'image/png'
    );
    const share = await redShare(
      await sharp(out)
        .extract({ left: 0, top: 0, width: 1200, height: 1600 })
        .png()
        .toBuffer()
    );
    expect(share).toBeGreaterThan(0.03); // the logo is there…
    // …and faint: at 10% opacity a red pixel on white stays light pink.
    // Activity area only (the footer text below is dark on purpose).
    const { data, info } = await sharp(out)
      .extract({ left: 0, top: 0, width: 1200, height: 1600 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    let minGreen = 255;
    for (let i = 1; i < data.length; i += info.channels) {
      if (data[i] < minGreen) minGreen = data[i];
    }
    expect(minGreen).toBeGreaterThan(255 * (1 - IMAGE_WATERMARK.opacity) - 10);
  });

  it('strips EXIF metadata from the upload', async () => {
    const withExif = await sharp(await solid(800, 600, 'jpeg'))
      .withMetadata({ exif: { IFD0: { Artist: 'Pessoa Real' } } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();
    const out = await watermarkImage(withExif, await logo(), 'image/jpeg');
    expect((await sharp(out).metadata()).exif).toBeUndefined();
  });

  it('writes the pt-BR copyright line in the footer strip', async () => {
    expect(copyrightText(2026)).toBe(
      '© 2026 Almanaque da Fala · Todos os direitos reservados · almanaquedafala.com.br'
    );
    const out = await watermarkImage(
      await solid(1200, 1600, 'png'),
      await logo(),
      'image/png'
    );
    // The strip has dark text pixels; the activity area above is untouched
    // by it (the watermark there is only faint red).
    const strip = await sharp(out)
      .extract({ left: 0, top: 1600, width: 1200, height: 48 })
      .greyscale()
      .raw()
      .toBuffer();
    const dark = strip.filter((v) => v < 140).length;
    expect(dark).toBeGreaterThan(200);
  });

  it('only accepts PNG and JPEG', () => {
    expect(isWatermarkableImage('image/png')).toBe(true);
    expect(isWatermarkableImage('image/jpeg')).toBe(true);
    expect(isWatermarkableImage('image/gif')).toBe(false);
    expect(isWatermarkableImage('image/webp')).toBe(false);
  });
});
