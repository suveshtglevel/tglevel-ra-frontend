import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization for any backend-/user-supplied markup that we render via
// `dangerouslySetInnerHTML`. Messages are composed as WhatsApp-style markdown
// and converted to HTML, so we only ever need a small formatting whitelist —
// anything outside it (scripts, event handlers, iframes, styles, etc.) is
// stripped. This is the single chokepoint guarding against stored XSS.

// Inline/text formatting + links and lists. Deliberately no media, no <style>,
// no <script>, no form/embed tags.
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'div',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
  'a', 'ul', 'ol', 'li', 'h2', 'h3',
];

// `class` is allowed so our Tailwind `[&_x]` content styles keep working; link
// attributes are allowed but URLs are constrained by ALLOWED_URI_REGEXP below.
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

// Only safe link schemes — blocks `javascript:`, `data:`, etc.
const ALLOWED_URI_REGEXP = /^(?:https?:|mailto:|tel:|#|\/)/i;

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    // Drop the contents of disallowed tags too (e.g. <script>…</script>),
    // rather than keeping the inner text.
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  });
}
