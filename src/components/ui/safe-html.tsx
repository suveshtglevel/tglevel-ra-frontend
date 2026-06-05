import * as React from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

interface SafeHtmlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dangerouslySetInnerHTML'> {
  // Raw HTML to render. It is always run through `sanitizeHtml` first, so callers
  // can never accidentally inject unsanitized markup.
  html: string | null | undefined;
}

// Drop-in replacement for `<div dangerouslySetInnerHTML={{ __html }} />` that
// sanitizes the markup. Use this instead of `dangerouslySetInnerHTML` anywhere
// backend-/user-supplied HTML is rendered.
export function SafeHtml({ html, ...rest }: SafeHtmlProps) {
  return <div {...rest} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
