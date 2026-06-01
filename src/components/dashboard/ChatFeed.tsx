'use client';

import React from 'react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, FileSpreadsheet, File, Play, MoreVertical, Pin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TradeCard from './TradeCard';
import ViewedByPanel from './ViewedByPanel';
import FileViewer from './FileViewer';
import { cn } from '@/lib/utils';
import { isResearchAnalysis } from '@/lib/researchAnalysis';
import type { ChatMessage, FileAttachment } from '@/redux/slices/messageSlice';

interface ChatFeedProps {
  views?: string;
  communityTag?: string; // shown on trade cards instead of the message type
  messages?: ChatMessage[];
  onTogglePin?: (messageId: string) => void;
}

// Three-dots menu overlaid at the top-right of every message; offers pin/unpin.
const MessageMenu = ({ pinned, onTogglePin }: { pinned: boolean; onTogglePin: () => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Message options"
        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/90 text-slate-500 border border-slate-200 shadow-sm hover:bg-white hover:text-slate-700 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity cursor-pointer"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-40 p-1 rounded-xl border border-slate-200 shadow-lg" align="end" side="bottom" sideOffset={4}>
      <button
        type="button"
        onClick={onTogglePin}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
      >
        <Pin className={cn("w-4 h-4", pinned ? "text-emerald-500 rotate-45" : "text-slate-400")} />
        {pinned ? 'Unpin message' : 'Pin message'}
      </button>
    </PopoverContent>
  </Popover>
);

const FileAttachmentView = ({ attachment, isSent, onOpen }: { attachment: NonNullable<ChatMessage['attachment']>; isSent: boolean; onOpen: () => void }) => {
  if (attachment.fileType === 'image') {
    return (
      <div className="rounded-lg overflow-hidden mb-1 cursor-pointer" onClick={onOpen}>
        <Image
          src={attachment.url}
          alt={attachment.name}
          width={260}
          height={200}
          className="max-w-[260px] max-h-[200px] object-cover rounded-lg hover:opacity-90 transition-opacity"
          unoptimized
        />
        <p className={cn("text-[11px] mt-1 font-medium", isSent ? "text-white/70" : "text-slate-400")}>
          {attachment.name} &bull; {attachment.size}
        </p>
      </div>
    );
  }

  if (attachment.fileType === 'video') {
    return (
      <div className="rounded-lg overflow-hidden mb-1 cursor-pointer" onClick={onOpen}>
        <div className="relative max-w-[260px]">
          <video
            src={attachment.url}
            className="max-w-[260px] max-h-[180px] rounded-lg object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg hover:bg-black/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-slate-700 ml-0.5" fill="currentColor" />
            </div>
          </div>
        </div>
        <p className={cn("text-[11px] mt-1 font-medium", isSent ? "text-white/70" : "text-slate-400")}>
          {attachment.name} &bull; {attachment.size}
        </p>
      </div>
    );
  }

  // PDF, Doc, Excel, generic file
  const iconMap = {
    pdf: { icon: <FileText className="w-5 h-5 text-red-500" />, bg: 'bg-red-50' },
    doc: { icon: <File className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
    excel: { icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50' },
    file: { icon: <File className="w-5 h-5 text-slate-500" />, bg: 'bg-slate-100' },
  };
  const { icon, bg } = iconMap[attachment.fileType] || iconMap.file;

  return (
    <div
      onClick={onOpen}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl mb-1 min-w-[220px] cursor-pointer hover:opacity-90 transition-opacity",
        isSent ? "bg-emerald-600/30" : "bg-slate-50 border border-slate-200"
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isSent ? "bg-white/20" : bg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[12px] font-bold truncate", isSent ? "text-white" : "text-slate-800")}>
          {attachment.name}
        </p>
        <p className={cn("text-[10px] font-medium", isSent ? "text-white/60" : "text-slate-400")}>
          {attachment.fileType.toUpperCase()} &bull; {attachment.size}
        </p>
      </div>
    </div>
  );
};

// Every message renders as a left-aligned post (like the seed messages),
// regardless of who sent it or its type.
const MessageBubble = ({ message, communityTag, onOpenFile }: { message: ChatMessage; communityTag?: string; onOpenFile: (attachment: FileAttachment) => void }) => {
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

      <div className="flex items-center justify-end gap-1 mt-1 text-slate-400">
        {message.group && (
          <span className="text-[9px] font-medium mr-1 bg-slate-100 px-1.5 py-0.5 rounded">{message.group}</span>
        )}
        {communityTag && (
          <span className="text-[9px] font-medium mr-1 bg-slate-100 px-1.5 py-0.5 rounded">{communityTag}</span>
        )}
        <span className="text-[10px] font-medium">{message.timestamp}</span>
      </div>
    </div>
  );
};

const ChatFeed = ({ views = '42', communityTag, messages = [], onTogglePin }: ChatFeedProps) => {
  const [showViewedBy, setShowViewedBy] = React.useState(false);
  const [viewingFile, setViewingFile] = React.useState<FileAttachment | null>(null);
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
        <div className="w-full max-w-4xl py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-start">
          <div className="mb-6 sm:mb-8 flex items-center gap-4 w-full">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Messages — Trade-type messages render as the green research card,
              everything else renders as a normal chat bubble. Each row carries
              a three-dots menu for pinning. */}
          <div className="flex flex-col gap-3 w-full">
            {messages.map((msg) => (
              <div key={msg.id} id={`feed-msg-${msg.id}`} className="group relative w-fit max-w-full scroll-mt-4">
                {msg.messageType === 'Trade' || (!msg.attachment && isResearchAnalysis(msg.content)) ? (
                  <TradeCard
                    content={msg.content}
                    timestamp={msg.timestamp}
                    status={msg.status}
                    tag={communityTag ?? msg.tradeTag}
                    refId={msg.tradeRefId}
                    pinned={msg.pinned}
                    onTickClick={() => setShowViewedBy((prev) => !prev)}
                  />
                ) : (
                  <MessageBubble message={msg} communityTag={communityTag} onOpenFile={(att) => setViewingFile(att)} />
                )}
                <MessageMenu pinned={!!msg.pinned} onTogglePin={() => onTogglePin?.(msg.id)} />
              </div>
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

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewer attachment={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
};

export default ChatFeed;
