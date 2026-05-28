'use client';

import React from 'react';
import { Check, CheckCheck, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DISCLAIMER } from '@/constants/mockData';

type MessageStatus = 'sent' | 'delivered' | 'read';

interface TradeCardProps {
  content: string; // HTML body (free text or seed analysis)
  timestamp: string;
  status?: MessageStatus;
  tag?: string;
  refId?: string;
  pinned?: boolean;
  onTickClick?: () => void;
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

// Green "RESEARCH ANALYSIS" card used for every Trade-type message —
// both seed cards and free-text trades RA sends. The body is whatever
// HTML was typed/seeded; the header, disclaimer and footer are fixed chrome.
const TradeCard = ({ content, timestamp, status = 'read', tag, refId, pinned, onTickClick }: TradeCardProps) => {
  return (
    <Card className="w-[380px] max-w-full bg-[#E6F9F3] border-[#C2EDDF] p-4 sm:p-5 rounded-3xl shadow-none">
      <div className="space-y-3 text-slate-800">
        <div className="font-bold flex items-center justify-between gap-2 text-[14px] sm:text-[15px]">
          <span>✅*RESEARCH ANALYSIS✅</span>
          {pinned && <Pin className="w-3.5 h-3.5 text-emerald-500 rotate-45 shrink-0" />}
        </div>

        <div
          className="text-[13px] leading-[18.57px] font-medium space-y-1.5 break-words [&_p]:my-0 [&_b]:font-bold [&_strong]:font-bold [&_a]:text-emerald-600 [&_a]:underline [&_a]:break-all [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5"
          style={{ fontFamily: 'Inter' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <div className="pt-4 border-t border-emerald-200/50">
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
            {DISCLAIMER}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {refId && <span className="text-[10px] font-bold text-slate-400">#{refId}</span>}
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
