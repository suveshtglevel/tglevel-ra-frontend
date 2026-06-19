import * as React from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

interface SafeHtmlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dangerouslySetInnerHTML'> {
  // Raw HTML to render. It is always run through `sanitizeHtml` first, so callers
  // can never accidentally inject unsanitized markup.
  html: string | null | undefined;
}

// Drop-in replacement for `<div dangerouslySetInnerHTML={{ __html }} />` that
// sanitizes the markup. Use this instead of `dangerouslySetInnerHTML` anywhere
// backend-/user-supplied HTML is rendered. Sanitizing is memoized on the input
// so re-renders (e.g. of a long message feed) don't re-run DOMPurify needlessly.
export function SafeHtml({ html, ...rest }: SafeHtmlProps) {
  const clean = React.useMemo(() => sanitizeHtml(html), [html]);
  return <div {...rest} dangerouslySetInnerHTML={{ __html: clean }} />;
}
