/**
 * Serialize an object for <script type="application/ld+json">. JSON.stringify
 * alone lets a "</script>" inside any string end the script block early.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
