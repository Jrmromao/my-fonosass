// Client-safe: used by the image footer (lib/images/watermark.ts) and the
// printed instructions sheet, so both carry the same notice.

export function copyrightText(year = new Date().getFullYear()): string {
  return `© ${year} Almanaque da Fala · Todos os direitos reservados · almanaquedafala.com.br`;
}
