import { z } from 'zod';

/**
 * Zod 4 probes `new Function('')` once to decide whether it can JIT-compile
 * parsers. Under our CSP (no 'unsafe-eval') that probe is blocked: harmless
 * (zod falls back), but it logs a violation and fires a CSP report on every
 * page that validates a form. `jitless` skips the probe. Parsing speed for
 * form-sized inputs is unaffected.
 *
 * Imported once from components/Providers.tsx so it runs before any parse in
 * the browser.
 */
z.config({ jitless: true });
