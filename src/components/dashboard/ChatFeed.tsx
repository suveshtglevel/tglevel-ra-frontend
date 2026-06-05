'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Pin, Check, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TradeCard from './TradeCard';
import ViewedByPanel from './ViewedByPanel';
import FileViewer from './FileViewer';
import FileAttachmentView from './FileAttachmentView';
import { cn } from '@/lib/utils';
import { useMessageStats } from '@/hooks/useMessageStats';
import type { ChatMessage, FileAttachment } from '@/redux/slices/messageSlice';

// Backend-issued message ids look like "msg_<uuid>"; optimistic locally-sent
// ones use "msg-<community>-<ts>". Only the former have seen-by stats.
const isBackendMessageId = (id: string) => /^msg_/.test(id);

interface ChatFeedProps {
  communityTag?: string; // shown on trade cards instead of the message type
  messages?: ChatMessage[];
  onTogglePin?: (messageId: string) => void;
}

// Three-dots menu overlaid at the top-right of every message; offers pin/unpin.
// Controlled so it closes itself right after the action (no extra click needed).
const MessageMenu = ({ pinned, onTogglePin }: { pinned: boolean; onTogglePin: () => void }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Message options"
          className="absolute top-2 right-2 z-10 p-1 text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1 rounded-xl border-white bg-white shadow-lg" align="end" side="right" sideOffset={4}>
        <button
          type="button"
          onClick={() => {
            onTogglePin();
            setOpen(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <Pin className={cn("w-4 h-4", pinned ? "text-emerald-500 rotate-45" : "text-slate-400")} />
          {pinned ? 'Unpin message' : 'Pin message'}
        </button>
      </PopoverContent>
    </Popover>
  );
};

// Numeric backend message type -> display label.
const MESSAGE_TYPE_LABELS: Record<number, string> = {
  1: 'Trade',
  2: 'Promotion',
  3: 'Followup',
  4: 'Feedback',
  5: 'Flaunt',
};

// Every message renders as a left-aligned post (like the seed messages),
// regardless of who sent it or its type.
const MessageBubble = ({ message, status, communityTag, onOpenFile, onTickClick }: { message: ChatMessage; status: ChatMessage['status']; communityTag?: string; onOpenFile: (attachment: FileAttachment) => void; onTickClick: () => void }) => {
  const typeLabel = message.messageTypeId != null ? MESSAGE_TYPE_LABELS[message.messageTypeId] : undefined;
  const shortId = message.sequenceKey != null ? String(message.sequenceKey) : message.id ? message.id.slice(-3) : '';
  return (
    <div className="max-w-[380px] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm bg-white border border-slate-200 text-slate-800">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[10px] font-bold text-emerald-600">{message.sender}</p>
        {message.pinned && <Pin className="w-3 h-3 text-emerald-500 rotate-45 shrink-0" />}
      </div>

      {/* File attachment */}
      {message.attachment && (
        <FileAttachmentView attachment={message.attachment} isSent={false} onOpen={() => onOpenFile(message.attachment!)} />
      )}

      {/* Text content */}
      {message.content && (
        <div
          className="text-[13px] leading-relaxed text-slate-700 break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      )}

      <div className="flex items-center justify-between gap-2 mt-1 text-slate-400">
        {/* Bottom-left: #<last 3 of msg id> and the message-type label. */}
        <div className="flex items-center gap-1.5 min-w-0">
          {shortId && <span className="text-[9px] font-bold text-slate-400">#{shortId}</span>}
          {typeLabel && (
            <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{typeLabel}</span>
          )}
        </div>
        {/* Bottom-right: group/community tags, then the time just left of the
            delivery ticks. */}
        <div className="flex items-center gap-1 shrink-0">
          {message.group && (
            <span className="text-[9px] font-medium mr-1 bg-slate-100 px-1.5 py-0.5 rounded">{message.group}</span>
          )}
          {communityTag && (
            <span className="text-[9px] font-medium mr-1 bg-slate-100 px-1.5 py-0.5 rounded">{communityTag}</span>
          )}
          <span className="text-[10px] font-medium">{message.timestamp}</span>
          <button
            type="button"
            onClick={onTickClick}
            aria-label="View who saw this message"
            className="bg-transparent border-none p-0 cursor-pointer"
          >
            {status === 'read' ? (
              <CheckCheck className="w-3 h-3 text-sky-500" />
            ) : status === 'delivered' ? (
              <CheckCheck className="w-3 h-3 text-slate-400" />
            ) : (
              <Check className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// One message row: fetches the seen-by stats (for backend messages) to drive
// the delivery tick — single tick when no one has seen it, double tick once any
// user has — and opens the "Viewed by" panel when the tick is clicked.
const MessageRow = ({
  msg,
  communityTag,
  onTogglePin,
  onOpenFile,
  onShowStats,
}: {
  msg: ChatMessage;
  communityTag?: string;
  onTogglePin?: (messageId: string) => void;
  onOpenFile: (attachment: FileAttachment) => void;
  onShowStats: (messageId: string) => void;
}) => {
  const hasStats = isBackendMessageId(msg.id);
  const { data: stats } = useMessageStats(msg.id, hasStats);
  // Seen by at least one user -> read (double tick); otherwise fall back to the
  // message's own status (a freshly sent message shows a single tick).
  const status: ChatMessage['status'] = stats
    ? stats.total_seen > 0
      ? 'read'
      : 'sent'
    : msg.status;

  // Only render the green research/trade card for messages the backend marks as
  // Trade (type label or numeric id 1). A message whose text merely matches the
  // research-analysis pattern is not necessarily a trade, so we no longer infer
  // the type from the content.
  const isTrade = msg.messageType === 'Trade' || msg.messageTypeId === 1;

  return (
    // Full-width row carries the scroll/highlight target so the pinned
    // flash spans the whole width; the bubble stays inset & content-width.
    <div id={`feed-msg-${msg.id}`} className="w-full scroll-mt-4 px-3 sm:px-6 py-1">
      <div className="group relative w-fit max-w-full">
        {isTrade ? (
          <TradeCard
            content={msg.content}
            timestamp={msg.timestamp}
            status={status}
            tag={communityTag ?? msg.tradeTag}
            refId={msg.tradeRefId}
            messageId={msg.id}
            sequenceKey={msg.sequenceKey}
            messageType={msg.messageType ?? (msg.messageTypeId != null ? MESSAGE_TYPE_LABELS[msg.messageTypeId] : undefined)}
            attachment={msg.attachment}
            onOpenFile={onOpenFile}
            pinned={msg.pinned}
            onTickClick={() => onShowStats(msg.id)}
          />
        ) : (
          <MessageBubble
            message={msg}
            status={status}
            communityTag={communityTag}
            onOpenFile={onOpenFile}
            onTickClick={() => onShowStats(msg.id)}
          />
        )}
        <MessageMenu pinned={!!msg.pinned} onTogglePin={() => onTogglePin?.(msg.id)} />
      </div>
    </div>
  );
};

const ChatFeed = ({ communityTag, messages = [], onTogglePin }: ChatFeedProps) => {
  // Message id whose "Viewed by" panel is open (null = closed).
  const [statsMessageId, setStatsMessageId] = React.useState<string | null>(null);
  const [viewingFile, setViewingFile] = React.useState<FileAttachment | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Toggle the panel: clicking the same message's tick again closes it.
  const handleShowStats = (messageId: string) =>
    setStatsMessageId((current) => (current === messageId ? null : messageId));

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
        <div className="w-full py-4 sm:py-8 flex flex-col items-stretch">
          <div className="mb-6 sm:mb-8 flex items-center gap-4 w-full px-3 sm:px-6">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Messages — Trade-type messages render as the green research card,
              everything else renders as a normal chat bubble. Each row carries
              a three-dots menu for pinning. */}
          <div className="flex flex-col gap-3 w-full">
            {messages.map((msg) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                communityTag={communityTag}
                onTogglePin={onTogglePin}
                onOpenFile={(att) => setViewingFile(att)}
                onShowStats={handleShowStats}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Fixed ViewedBy panel — shows the seen-by users for the clicked message. */}
      {statsMessageId && (
        <div className="absolute top-4 right-4 z-50">
          <ViewedByPanel
            messageId={statsMessageId}
            onClose={() => setStatsMessageId(null)}
          />
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer attachment={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
};

export default ChatFeed;