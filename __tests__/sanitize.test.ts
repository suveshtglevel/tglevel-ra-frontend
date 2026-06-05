import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('returns an empty string for nullish input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('keeps allowed formatting tags', () => {
    const html = '<p>Hello <strong>world</strong> and <em>more</em></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('keeps safe links with their attributes', () => {
    const out = sanitizeHtml('<a href="https://example.com" target="_blank" rel="noopener">link</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('link');
  });

  it('strips <script> tags entirely', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
    expect(out).toContain('<p>ok</p>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('alert(1)');
  });

  it('removes inline event handlers', () => {
    const out = sanitizeHtml('<p onclick="steal()">click</p>');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('steal');
    expect(out).toContain('click');
  });

  it('neutralizes the classic img onerror XSS payload', () => {
    const out = sanitizeHtml('<img src=x onerror="alert(document.cookie)">');
    expect(out).not.toContain('onerror');
    expect(out).not.toContain('alert');
  });

  it('blocks javascript: URLs on links', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('drops disallowed tags like iframe', () => {
    const out = sanitizeHtml('<iframe src="https://evil.test"></iframe><p>safe</p>');
    expect(out).not.toContain('iframe');
    expect(out).toContain('<p>safe</p>');
  });
});
