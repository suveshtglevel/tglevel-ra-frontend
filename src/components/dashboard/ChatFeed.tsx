'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, CheckCheck, FileText, FileSpreadsheet, File, Play, X, Download } from 'lucide-react';
import TradeCard from './TradeCard';
import ViewedByPanel from './ViewedByPanel';
import { cn } from '@/lib/utils';
import type { ChatMessage, FileAttachment } from '@/redux/slices/messageSlice';

interface ChatFeedProps {
  views?: string;
  messages?: ChatMessage[];
}

// Full-screen file viewer modal
const FileViewerModal = ({ attachment, onClose }: { attachment: FileAttachment; onClose: () => void }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
          <Download className="w-5 h-5 text-white" />
        </button>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <p className="text-white text-sm font-medium">{attachment.name}</p>
        <p className="text-white/60 text-xs">{attachment.size}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
        {attachment.fileType === 'image' && (
          <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        )}
        {attachment.fileType === 'video' && (
          <video src={attachment.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
        )}
        {attachment.fileType === 'pdf' && (
          <iframe src={attachment.url} className="w-[80vw] h-[85vh] rounded-lg bg-white" title={attachment.name} />
        )}
        {(attachment.fileType === 'doc' || attachment.fileType === 'excel' || attachment.fileType === 'file') && (
          <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              {attachment.fileType === 'excel' ? <FileSpreadsheet className="w-8 h-8 text-emerald-600" /> : <FileText className="w-8 h-8 text-blue-500" />}
            </div>
            <p className="text-lg font-bold text-slate-800">{attachment.name}</p>
            <p className="text-sm text-slate-500">{attachment.fileType.toUpperCase()} &bull; {attachment.size}</p>
            <button onClick={handleDownload} className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 cursor-pointer transition-colors">
              Download File
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FileAttachmentView = ({ attachment, isSent, onOpen }: { attachment: NonNullable<ChatMessage['attachment']>; isSent: boolean; onOpen: () => void }) => {
  if (attachment.fileType === 'image') {
    return (
      <div className="rounded-lg overflow-hidden mb-1 cursor-pointer" onClick={onOpen}>
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-w-[260px] max-h-[200px] object-cover rounded-lg hover:opacity-90 transition-opacity"
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

const MessageBubble = ({ message, onOpenFile }: { message: ChatMessage; onOpenFile: (attachment: FileAttachment) => void }) => {
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

        {/* File attachment */}
        {message.attachment && (
          <FileAttachmentView attachment={message.attachment} isSent={isSent} onOpen={() => onOpenFile(message.attachment!)} />
        )}

        {/* Text content */}
        {message.content && (
          <div
            className={cn(
              "text-[13px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:underline",
              isSent ? "text-white" : "text-slate-700"
            )}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        )}

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

const ChatFeed = ({ views = '42', messages = [] }: ChatFeedProps) => {
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
        <div className="max-w-4xl py-8 px-6 flex flex-col items-start">
          <div className="mb-8 flex items-center gap-4 w-full">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Messages — Trade-type messages render as the green research card,
              everything else renders as a normal chat bubble. */}
          <div className="flex flex-col gap-3 w-full">
            {messages.map((msg) =>
              msg.messageType === 'Trade' ? (
                <div
                  key={msg.id}
                  className={cn('flex w-full', msg.type === 'sent' ? 'justify-end' : 'justify-start')}
                >
                  <TradeCard
                    content={msg.content}
                    timestamp={msg.timestamp}
                    status={msg.status}
                    tag={msg.tradeTag}
                    refId={msg.tradeRefId}
                    onTickClick={() => setShowViewedBy((prev) => !prev)}
                  />
                </div>
              ) : (
                <MessageBubble key={msg.id} message={msg} onOpenFile={(att) => setViewingFile(att)} />
              )
            )}
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
        <FileViewerModal attachment={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
};

export default ChatFeed;
