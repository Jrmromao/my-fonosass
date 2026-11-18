import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// The legal pages once shipped invented company data (CNPJ, address, phones,
// a fictitious DPO) and the structured data a fake rating. Company data now
// lives only in lib/legal/company.ts; these files must never invent it.

const ROOT = path.join(__dirname, '..', '..', '..');
const FILES = [
  'app/privacidade/page.tsx',
  'app/termos/page.tsx',
  'app/lgpd/page.tsx',
  'app/dpo/page.tsx',
  'app/cookies/page.tsx',
  'components/legal/LegalPage.tsx',
  'components/seo/StructuredData.tsx',
  'lib/legal/company.ts',
];

const FORBIDDEN: { label: string; pattern: RegExp }[] = [
  { label: 'fake CNPJ', pattern: /12\.345\.678\/0001-90/ },
  { label: 'fake address', pattern: /Rua das Flores/i },
  { label: 'fake CEP', pattern: /01234-567/ },
  { label: 'fake phone', pattern: /9{4,}-?9{4}|8{4,}-?8{4}|3017-8888/ },
  { label: 'fictitious DPO', pattern: /Carlos Silva/i },
  { label: 'invented company name', pattern: /Tecnologia Ltda/i },
  { label: 'fake rating', pattern: /aggregateRating/ },
];

describe('legal pages: no invented data', () => {
  for (const file of FILES) {
    it(`${file} has no placeholder company data`, () => {
      const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const found = FORBIDDEN.filter((f) => f.pattern.test(text)).map(
        (f) => f.label
      );
      expect(found).toEqual([]);
    });
  }
});

describe('company data', () => {
  it('leaves unknown identification fields empty instead of inventing them', async () => {
    const { COMPANY } = await import('@/lib/legal/company');
    for (const key of ['legalName', 'cnpj', 'address', 'dpoName'] as const) {
      const value = COMPANY[key];
      expect(value === null || value.trim().length > 0).toBe(true);
    }
    expect(COMPANY.contactEmail).toMatch(/@almanaquedafala\.com\.br$/);
    expect(COMPANY.privacyEmail).toMatch(/@almanaquedafala\.com\.br$/);
  });
});
