/**
 * Split markdown so a mid-article CTA can sit after the first section.
 * Conversion-oriented: reader has passed the intro and seen one H2 section
 * (or ~40% of the post when there is no H2), then the CTA, then the rest.
 * Client-safe.
 */

export function splitMarkdownForMidCta(markdown: string): {
  before: string;
  after: string;
} {
  const blocks = markdown
    .trim()
    .split(/\n{2,}/)
    .filter((b) => b.trim().length > 0);

  if (blocks.length <= 2) {
    return { before: markdown.trim(), after: '' };
  }

  let insertAt = -1;

  // First ## heading that is not the very first block: place CTA after that
  // heading plus the next content block (one beat of value, then ask).
  for (let i = 1; i < blocks.length - 1; i++) {
    if (/^##\s+\S/.test(blocks[i].trim())) {
      insertAt = Math.min(i + 1, blocks.length - 2);
      break;
    }
  }

  if (insertAt < 0) {
    insertAt = Math.max(
      1,
      Math.min(Math.floor(blocks.length * 0.4), blocks.length - 2)
    );
  }

  return {
    before: blocks.slice(0, insertAt + 1).join('\n\n'),
    after: blocks.slice(insertAt + 1).join('\n\n'),
  };
}
