import sanitize from 'sanitize-html';

/**
 * Sanitize HTML before it goes into dangerouslySetInnerHTML. Allow-list based:
 * strips scripts, event-handler attributes, javascript: URLs, iframes/forms,
 * inline styles, etc. Use for ANY HTML derived from markdown, CMS/S3 content
 * or user input. Pure JS (no jsdom), so it runs on server and client.
 */
const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    ...sanitize.defaults.allowedTags,
    'img',
    'h1',
    'h2',
    'del',
    'ins',
    'sup',
    'sub',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    code: ['class'],
    '*': ['class', 'id'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  transformTags: {
    // Links opening a new tab must not get window.opener access.
    a: (tagName, attribs) => ({
      tagName,
      attribs:
        attribs.target === '_blank'
          ? { ...attribs, rel: 'noopener noreferrer' }
          : attribs,
    }),
  },
};

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, OPTIONS);
}
