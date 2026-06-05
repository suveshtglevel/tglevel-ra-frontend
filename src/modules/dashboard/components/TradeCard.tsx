'use client';

import React from 'react';
import { Check, CheckCheck, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FileAttachmentView from './FileAttachmentView';
import type { ChatMessage } from '@/store/slices/messageSlice';
import {
  isResearchAnalysis,
  parseTradeSegments,
  parseConfidence,
  splitLabeledLine,
  type TradeSegment,
  type ConfidenceLevel,
} from '@/lib/researchAnalysis';

const DOT_COLOR: Record<ConfidenceLevel, string> = {
  high: 'bg-emerald-500',
  medium: 'bg-amber-400',
  low: 'bg-red-500',
  unknown: 'bg-slate-400',
};

const bodyClass =
  'text-[13px] leading-[18.57px] font-medium space-y-1.5 break-words [&_p]:my-0 [&_b]:font-bold [&_strong]:font-bold [&_a]:text-emerald-600 [&_a]:underline [&_a]:break-all [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5';

// Renders one parsed paragraph with the design that matches its role.
const Segment = ({ segment }: { segment: TradeSegment }) => {
  switch (segment.type) {
    case 'disclaimer':
      return (
        <div className="pt-4 border-t border-emerald-200/50">
          <div
            className="text-[11px] text-slate-500 leading-relaxed font-medium [&_p]:my-0"
            dangerouslySetInnerHTML={{ __html: segment.html }}
          />
        </div>
      );
    case 'customerCare': {
      const { label, value } = splitLabeledLine(segment.text);
      return (
        <p className="text-[13px] font-medium" style={{ fontFamily: 'Inter' }}>
          <span className="text-slate-500">{label} </span>
          <span className="text-slate-800">{value}</span>
        </p>
      );
    }
    case 'rationale':
      return (
        <div
          className="text-[13px] font-medium text-slate-500 [&_a]:text-emerald-600 [&_a]:underline [&_a]:break-all [&_p]:my-0"
          style={{ fontFamily: 'Inter' }}
          dangerouslySetInnerHTML={{ __html: segment.html }}
        />
      );
    case 'confidence': {
      const { label, value, level } = parseConfidence(segment.text);
      return (
        <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3">
          <p className="text-[13px] text-slate-500">{label}</p>
          {value && (
            <p className="text-[14px] font-medium text-slate-800 flex items-center gap-2 mt-1.5">
              <span className={cn('w-3 h-3 rounded-full shrink-0', DOT_COLOR[level])} />
              {value}
            </p>
          )}
        </div>
      );
    }
    default:
      return <div className={bodyClass} style={{ fontFamily: 'Inter' }} dangerouslySetInnerHTML={{ __html: segment.html }} />;
  }
};

type MessageStatus = 'sent' | 'delivered' | 'read';

interface TradeCardProps {
  content: string; // HTML body (free text or seed analysis)
  timestamp: string;
  status?: MessageStatus;
  tag?: string;
  refId?: string;
  pinned?: boolean;
  onTickClick?: () => void;
  // The message's id and resolved type label, shown in the card footer.
  messageId?: string;
  messageType?: string;
  // Optional file attached to the trade message (image / video / document).
  attachment?: ChatMessage['attachment'];
  sequenceKey?: number;
  onOpenFile?: (attachment: NonNullable<ChatMessage['attachment']>) => void;
}

const StatusTick = ({ status }: { status: MessageStatus }) => {
  if (status === 'sent') {
    return <Check className="w-4 h-4 text-[#94A3B8]" />;
  }
  if (status === 'delivered') {
    return <CheckCheck className="w-4 h-4 text-[#94A3B8]" />;
  }
  return <CheckCheck className="w-4 h-4 text-[#3B82F6]" />;
};

// Green card used for every Trade-type message. When the content is an actual
// "RESEARCH ANALYSIS" message (matches the regex) it's parsed into the
// structured layout (disclaimer / customer care / rationale / confidence);
// otherwise the typed content is shown as-is in the green card — no header or
// structure is fabricated.
const TradeCard = ({ content, timestamp, status = 'read', tag, refId, pinned, onTickClick, messageId, sequenceKey, messageType, attachment, onOpenFile }: TradeCardProps) => {
  // Only treat the message as a structured research analysis when its text
  // actually matches the pattern; otherwise render the plain content.
  const isResearch = isResearchAnalysis(content);
  const segments = isResearch ? parseTradeSegments(content) : null;
  // Whether there's any real text to render (an attachment-only trade has none).
  const hasBody = Boolean(content && content !== '<p></p>');
  // Show the sequence key when it exists; otherwise fall back to the last 3 chars of the message id.
  const shortId = sequenceKey != null ? String(sequenceKey) : messageId ? messageId.slice(-3) : refId;

  return (
    <Card className="w-[380px] max-w-full bg-[#E6F9F3] border-[#C2EDDF] p-4 sm:p-5 rounded-3xl shadow-none">
      <div className="space-y-3 text-slate-800">
        {pinned && (
          <div className="flex justify-end">
            <Pin className="w-3.5 h-3.5 text-emerald-500 rotate-45 shrink-0" />
          </div>
        )}

        {/* Attached image / video / document, shown above the text. */}
        {attachment && (
          <FileAttachmentView
            attachment={attachment}
            isSent={false}
            onOpen={() => onOpenFile?.(attachment)}
          />
        )}

        {segments ? (
          segments.map((segment, i) => <Segment key={i} segment={segment} />)
        ) : hasBody ? (
          <div
            className={bodyClass}
            style={{ fontFamily: 'Inter' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : null}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            {shortId && <span className="text-[10px] font-bold text-slate-400">#{shortId}</span>}
            {messageType && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {messageType}
              </span>
            )}
            {tag && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5 rounded-md px-2 border-none">
                {tag}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[10px] text-slate-500">
            {timestamp}
            <button
              type="button"
              onClick={onTickClick}
              className="bg-transparent border-none p-0 cursor-pointer"
            >
              <StatusTick status={status} />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TradeCard;
