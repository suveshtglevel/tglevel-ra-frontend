// Detection + parsing helpers for RA trade-message content. The RA always sends
// the same structure, so we classify each paragraph by keyword (typo-tolerant)
// and let the TradeCard style it — no text is hardcoded in the component.

// "RESEARCH ANALYSIS" with misspellings (reserch, resarch, reaserch, analisis…).
export const RESEARCH_ANALYSIS_REGEX = /re[ea]*s[ea]*r?ch[\s*_~-]*anal[yi]?s[ei]s/i;

const DISCLAIMER_RE = /dis?cla?i?m[ae]r/i;
const CUSTOMER_CARE_RE = /customer\s*care/i;
const RATIONALE_RE = /rationale/i;
const CONFIDENCE_RE = /confidence/i;
// The "Confidence … Trade" label itself, so we can isolate the value after it.
const CONFIDENCE_LABEL_RE = /confidence[\s\S]*?trade/i;

const stripTags = (content: string) => content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function isResearchAnalysis(content: string): boolean {
  return RESEARCH_ANALYSIS_REGEX.test(stripTags(content));
}

export type TradeSegmentType = 'body' | 'disclaimer' | 'customerCare' | 'rationale' | 'confidence';

export interface TradeSegment {
  type: TradeSegmentType;
  html: string; // original block HTML (rendered for body/disclaimer/rationale)
  text: string; // plain text (used for the structured segments)
}

function classify(text: string): TradeSegmentType {
  if (DISCLAIMER_RE.test(text)) return 'disclaimer';
  if (CUSTOMER_CARE_RE.test(text)) return 'customerCare';
  if (RATIONALE_RE.test(text)) return 'rationale';
  if (CONFIDENCE_RE.test(text)) return 'confidence';
  return 'body';
}

// The text that follows the "Confidence … Trade" label in the same paragraph
// (i.e. the probability), with any leading separators removed.
function confidenceValue(text: string): string {
  const m = text.match(CONFIDENCE_LABEL_RE);
  if (!m) return '';
  return text
    .slice((m.index ?? 0) + m[0].length)
    .replace(/^[\s:=\-–—]+/, '')
    .trim();
}

// Splits content into paragraph blocks and tags each by the keyword it contains.
// Consecutive plain paragraphs are grouped so normal body spacing is preserved.
export function parseTradeSegments(content: string): TradeSegment[] {
  const blocks = content.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
  if (!blocks || blocks.length === 0) {
    return [{ type: 'body', html: content, text: stripTags(content) }];
  }

  const segments: TradeSegment[] = [];
  let body = '';
  const flushBody = () => {
    if (body) {
      segments.push({ type: 'body', html: body, text: stripTags(body) });
      body = '';
    }
  };

  for (let i = 0; i < blocks.length; i++) {
    const html = blocks[i];
    const text = stripTags(html);
    const type = classify(text);

    if (type === 'body') {
      body += html;
      continue;
    }

    flushBody();

    if (type === 'confidence') {
      // The probability may be in the same paragraph ("…Trade: Medium") or in
      // the paragraph directly below it — pull it in either way.
      let value = confidenceValue(text);
      let mergedHtml = html;
      if (!value && i + 1 < blocks.length) {
        const nextHtml = blocks[i + 1];
        if (classify(stripTags(nextHtml)) === 'body') {
          value = stripTags(nextHtml);
          mergedHtml += nextHtml;
          i += 1;
        }
      }
      const label = (text.match(CONFIDENCE_LABEL_RE)?.[0] ?? 'Confidence Level Trade').trim();
      segments.push({ type: 'confidence', html: mergedHtml, text: value ? `${label}: ${value}` : label });
      continue;
    }

    segments.push({ type, html, text });
  }
  flushBody();
  return segments;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface ConfidenceParts {
  label: string;
  value: string; // empty when no probability was found
  level: ConfidenceLevel;
}

// Splits the normalised "label: value" confidence text. The probability words
// aren't assumed — we colour the dot only when high/medium/low is recognised.
export function parseConfidence(text: string): ConfidenceParts {
  let label = 'Confidence Level Trade';
  let value = '';

  const colonIdx = text.indexOf(':');
  if (colonIdx >= 0) {
    label = text.slice(0, colonIdx).trim() || label;
    value = text.slice(colonIdx + 1).trim();
  } else {
    label = text.trim() || label;
  }

  const level: ConfidenceLevel = /high/i.test(value)
    ? 'high'
    : /low/i.test(value)
      ? 'low'
      : /medium|moderate/i.test(value)
        ? 'medium'
        : 'unknown';

  return { label, value, level };
}

export interface LabeledLine {
  label: string;
  value: string;
}

// Splits a "Label:- value" line into label + value. Prefers the first digit
// (e.g. a phone number), then falls back to the ":" / "=" separator.
export function splitLabeledLine(text: string): LabeledLine {
  const digit = text.match(/\d/);
  if (digit && digit.index !== undefined && digit.index > 0) {
    return { label: text.slice(0, digit.index).trim(), value: text.slice(digit.index).trim() };
  }
  const sep = text.search(/[:=]/);
  if (sep >= 0) {
    return { label: text.slice(0, sep + 1).trim(), value: text.slice(sep + 1).trim() };
  }
  return { label: text, value: '' };
}
