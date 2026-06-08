// Pulls the links out of a message's HTML body. Picks up both anchor hrefs
// (<a href="...">label</a>) and bare URLs typed into the text, de-duplicated
// while preserving the order they appear in the message.

export interface DetectedLink {
  url: string;
  label: string; // anchor text when available, otherwise the url itself
}

const BARE_URL = /https?:\/\/[^\s<>"']+/gi;

export function extractLinks(html: string): DetectedLink[] {
  if (!html) return [];

  const byUrl = new Map<string, string>(); // url -> label

  // Anchor tags first, so we keep their human-readable label.
  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = anchor.exec(html)) !== null) {
    const url = m[1].trim();
    const label = m[2].replace(/<[^>]+>/g, '').trim();
    if (/^https?:\/\//i.test(url) && !byUrl.has(url)) {
      byUrl.set(url, label || url);
    }
  }

  // Bare URLs in the leftover text — drop the anchor blocks and remaining tags
  // so we don't re-read hrefs from attributes.
  const text = html
    .replace(/<a\b[^>]*>.*?<\/a>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  const bare = text.match(BARE_URL);
  if (bare) {
    for (const raw of bare) {
      const url = raw.replace(/[.,;:!?)\]]+$/, ''); // trim trailing punctuation
      if (!byUrl.has(url)) byUrl.set(url, url);
    }
  }

  return Array.from(byUrl, ([url, label]) => ({ url, label }));
}

// Turns bare URLs in an HTML body into clickable anchor tags so they render as
// links. URLs already wrapped in an <a> are left untouched, and text inside any
// tag is never modified (we only rewrite text nodes outside of tags). The
// result is still passed through sanitizeHtml before rendering.
export function linkifyHtml(html: string): string {
  if (!html) return html;

  let inAnchor = 0;
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (!part) return part;
      // Tag token: track whether we're inside an <a> … </a>.
      if (part[0] === '<') {
        if (/^<a\b/i.test(part)) inAnchor++;
        else if (/^<\/a>/i.test(part)) inAnchor = Math.max(0, inAnchor - 1);
        return part;
      }
      if (inAnchor > 0) return part; // already a link
      return part.replace(BARE_URL, (raw) => {
        const trail = raw.match(/[.,;:!?)\]]+$/)?.[0] ?? '';
        const url = trail ? raw.slice(0, -trail.length) : raw;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${trail}`;
      });
    })
    .join('');
}
