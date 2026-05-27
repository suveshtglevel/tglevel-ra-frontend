'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck } from 'lucide-react';
import ResearchCard from './ResearchCard';
import ViewedByPanel from './ViewedByPanel';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/redux/slices/messageSlice';

interface ChatFeedProps {
  analysis: any;
  views?: string;
  messages?: ChatMessage[];
}

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isSent = message.type === 'sent';

  const StatusIcon = () => {
    if (message.status === 'sent') return <Check className="w-3 h-3 text-slate-400" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
    return <CheckCheck className="w-3 h-3 text-blue-500" />;
  };

  return (
    <div className={cn("flex w-full", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[380px] rounded-2xl px-4 py-3 shadow-sm",
          isSent
            ? "bg-emerald-500 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
        )}
      >
        {!isSent && (
          <p className="text-[10px] font-bold text-emerald-600 mb-1">{message.sender}</p>
        )}
        <div
          className={cn("text-[13px] leading-relaxed", isSent ? "text-white" : "text-slate-700")}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        <div className={cn("flex items-center justify-end gap-1 mt-1", isSent ? "text-white/70" : "text-slate-400")}>
          {message.group && (
            <span className="text-[9px] font-medium mr-1 bg-white/20 px-1.5 py-0.5 rounded">{message.group}</span>
          )}
          {message.messageType && (
            <span className="text-[9px] font-medium mr-1 bg-white/20 px-1.5 py-0.5 rounded">{message.messageType}</span>
          )}
          <span className="text-[10px] font-medium">{message.timestamp}</span>
          {isSent && <StatusIcon />}
        </div>
      </div>
    </div>
  );
};

const ChatFeed = ({ analysis, views = '42', messages = [] }: ChatFeedProps) => {
  const [showViewedBy, setShowViewedBy] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages.length]);

  return (
    <div className="flex-1 flex min-h-0 relative">
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-4xl py-8 px-6 flex flex-col items-start">
          <div className="mb-8 flex items-center gap-4 w-full">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Analysis Card (first message for community 1) */}
          <ResearchCard
            analysis={analysis}
            onTickClick={() => setShowViewedBy((prev) => !prev)}
          />

          {/* Additional messages */}
          <div className="flex flex-col gap-3 w-full mt-4">
            {messages.filter((m) => m.id !== 'msg-1-1').map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Fixed ViewedBy panel */}
      {showViewedBy && (
        <div className="absolute top-4 right-4 z-50">
          <ViewedByPanel
            totalViews={views}
            onClose={() => setShowViewedBy(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatFeed;
