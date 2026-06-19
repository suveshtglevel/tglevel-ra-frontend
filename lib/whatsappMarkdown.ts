// WhatsApp-style markdown <-> HTML.
//
// The RA composes/reads messages as HTML (TipTap + the chat renderer), but the
// backend and mobile app speak WhatsApp markdown where:
//   *text*  = bold      _text_ = italic      ~text~ = strikethrough
// So we convert HTML -> markdown when sending, and markdown -> HTML when showing
// a message that came back as markdown. Manual bold/italic/strike from the
// toolbar therefore round-trips as asterisks/underscores/tildes.

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Apply the inline markers on an already HTML-escaped line. Bold first so a
// line like "*Entry Above =* 167" keeps the trailing value outside the bold.
const inlineToHtml = (escaped: string) =>
  escaped
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    .replace(/~([^~\n]+)~/g, '<s>$1</s>');

// WhatsApp markdown text -> HTML (one <p> per line; blank lines preserved).
export function whatsappToHtml(text: string): string {
  if (!text) return '';
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  return lines
    .map((line) => {
      const html = inlineToHtml(escapeHtml(line));
      return html.length ? `<p>${html}</p>` : '<p></p>';
    })
    .join('');
}

// True when the string already contains HTML tags (legacy messages / editor
// output) so we don't double-convert it.
export function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

// Serialize an element's inline content, wrapping marks in their markdown.
function serializeInline(node: Node): string {
  let out = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent ?? '';
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const inner = serializeInline(el);
    if (tag === 'strong' || tag === 'b') out += inner ? `*${inner}*` : '';
    else if (tag === 'em' || tag === 'i') out += inner ? `_${inner}_` : '';
    else if (tag === 's' || tag === 'strike' || tag === 'del') out += inner ? `~${inner}~` : '';
    else if (tag === 'br') out += '\n';
    else out += inner; // a, u, span, etc. -> keep the text as-is
  });
  return out;
}

// HTML -> WhatsApp markdown text. Each block element becomes a line; list items
// are prefixed with "- ". Runs only in the browser (DOMParser); on the server it
// falls back to a tag strip.
export function htmlToWhatsApp(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }
  const doc = new window.DOMParser().parseFromString(html, 'text/html');
  const lines: string[] = [];
  doc.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent ?? '';
      if (t.trim()) lines.push(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      Array.from(el.children).forEach((li) => lines.push(`- ${serializeInline(li)}`));
    } else {
      lines.push(serializeInline(el)); // p / h2 / div -> a single line
    }
  });
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
}
