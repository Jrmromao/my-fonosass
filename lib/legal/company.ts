import { DPO_EMAIL, PRIVACY_RESPONSE_TIME } from '@/lib/privacy';

/**
 * Who runs the service, as shown on the legal pages (/privacidade, /termos,
 * /lgpd, /dpo, /cookies). Single source: edit here, every page follows.
 *
 * `null` = not defined yet. Pages leave the field out instead of showing an
 * invented value. Fill these in before launch:
 *  - legalName, cnpj: razão social and CNPJ (or the full name of the person
 *    responsible if there is no company yet; never publish a CPF).
 *  - address: commercial or virtual address.
 *  - dpoName: the Encarregado. Small businesses (ME, EPP, MEI, startups) may
 *    skip naming one (Resolução CD/ANPD nº 2/2022, art. 11) as long as the
 *    privacy channel below works.
 */
export const COMPANY = {
  brandName: 'Almanaque da Fala',
  site: 'https://www.almanaquedafala.com.br',
  legalName: 'TALK FONOAUDIOLOGIA LTDA' as string | null,
  cnpj: '35.562.629/0001-00' as string | null,
  address: null as string | null,
  dpoName: null as string | null,
  /** General contact (support, billing, terms). Must be a real, read inbox. */
  contactEmail: 'contato@almanaquedafala.com.br',
  /** Privacy and LGPD requests. Must be a real, read inbox. */
  privacyEmail: DPO_EMAIL,
  privacyResponseTime: PRIVACY_RESPONSE_TIME,
} as const;

/** Date of the current version of the legal pages. Update on every change. */
export const LEGAL_LAST_UPDATED = '18 de novembro de 2026';

/** True when all identification fields are filled in. */
export function isCompanyInfoComplete(): boolean {
  return Boolean(COMPANY.legalName && COMPANY.cnpj && COMPANY.address);
}
