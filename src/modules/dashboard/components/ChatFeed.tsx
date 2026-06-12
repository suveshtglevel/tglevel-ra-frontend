'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreVertical, Pin, Check, CheckCheck, Link as LinkIcon, ChevronLeft, Reply } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TradeCard from './TradeCard';
import FileAttachmentView from './FileAttachmentView';

// Both only render after a user action (clicking the seen tick / opening a
// file), so defer their code until then instead of shipping it with the feed.
const ViewedByPanel = dynamic(() => import('./ViewedByPanel'), { ssr: false });
const FileViewer = dynamic(() => import('./FileViewer'), { ssr: false });
import { cn } from '@/lib/utils';
import { extractLinks, linkifyHtml, type DetectedLink } from '@/lib/extractLinks';
import { SafeHtml } from '@/components/ui/safe-html';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChatMessage, FileAttachment } from '@/store/slices/messageSlice';

interface ChatFeedProps {
  communityTag?: string; // shown on trade cards instead of the message type
  messages?: ChatMessage[];
  // True while the open chat's messages are being fetched (and none are cached
  // yet); drives the skeleton placeholders.
  loading?: boolean;
  onTogglePin?: (messageId: string) => void;
  // Start a follow-up reply to a (trade) message — opens the composer's reply
  // context with this message as the parent.
  onFollowUp?: (message: ChatMessage) => void;
}

// Placeholder message bubbles shown while a chat's messages load, alternating
// width/alignment so the feed reads as "loading content" rather than frozen.
const ChatFeedSkeleton = () => (
  <div className="flex flex-col gap-3 w-full px-3 sm:px-6">
    {[60, 80, 45, 70, 55, 75].map((w, i) => (
      <div key={i} className="w-full">
        <div className="max-w-[380px] rounded-2xl rounded-bl-sm px-4 py-3 bg-white border border-slate-200 space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-3 w-full" style={{ maxWidth: `${w}%` }} />
          <Skeleton className="h-3" style={{ width: `${Math.max(30, w - 20)}%` }} />
        </div>
      </div>
    ))}
  </div>
);

// Three-dots menu overlaid at the top-right of every message; offers pin/unpin
// and — when the message contains links — a "Links" tab that lists every link
// detected in the card. Controlled so it closes itself right after an action.
const triggerClass =
  'absolute top-2 right-2 z-10 p-1 text-slate-500 hover:text-slate-700 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity cursor-pointer';

type MessageMenuHandle = { open: () => void };

const MessageMenu = React.forwardRef<
  MessageMenuHandle,
  { pinned: boolean; onTogglePin: () => void; links: DetectedLink[]; onFollowUp?: () => void }
>(function MessageMenu({ pinned, onTogglePin, links, onFollowUp }, ref) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<'menu' | 'links'>('menu');
  // Defer the (heavy) Radix Popover until the menu is first opened. Until then
  // each row renders just a plain button, so a feed of many messages doesn't pay
  // for a Popper tree per row — the dominant per-row cost on first render.
  const [activated, setActivated] = React.useState(false);

  // Let the parent open this menu from a right-click anywhere on the card (see
  // MessageRow's onContextMenu) — activates + opens the popover, exactly as
  // clicking the three-dots button does.
  React.useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setActivated(true);
        setOpen(true);
      },
    }),
    []
  );

  // Reset to the main menu as the popover closes (never leave the links tab open
  // for next time) — done in the event, not an effect.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setView('menu');
  };

  if (!activated) {
    return (
      <button
        type="button"
        aria-label="Message options"
        className={triggerClass}
        onClick={() => {
          setActivated(true);
          setOpen(true);
        }}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Message options" className={triggerClass}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1 rounded-xl border-white bg-white shadow-lg" align="end" side="right" sideOffset={4}>
        {view === 'menu' ? (
          <>
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
            {onFollowUp && (
              <button
                type="button"
                onClick={() => {
                  onFollowUp();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Reply className="w-4 h-4 text-slate-400" />
                Follow up message
              </button>
            )}
            {links.length > 0 && (
              <button
                type="button"
                onClick={() => setView('links')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <LinkIcon className="w-4 h-4 text-slate-400" />
                Links
                <span className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {links.length}
                </span>
              </button>
            )}
          </>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setView('menu')}
              className="w-full flex items-center gap-1.5 px-2 py-2 rounded-lg text-[12px] font-semibold text-slate-500 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Links ({links.length})
            </button>
            <div className="max-h-60 overflow-y-auto mt-0.5">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="text-[12px] font-medium text-slate-700 truncate">{link.label}</span>
                  <span className="text-[10px] text-emerald-600 underline truncate">{link.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
MessageMenu.displayName = 'MessageMenu';

// Numeric backend message type -> display label.
const MESSAGE_TYPE_LABELS: Record<number, string> = {
  1: 'Trade',
  2: 'Promotion',
  3: 'Followup',
  4: 'Feedback',
  5: 'Flaunt',
};

// Scroll to a message and briefly flash its container, matching the pinned-jump
// highlight so the RA can spot the message the reply points at.
const scrollToMessage = (id: string) => {
  const el = document.getElementById(`feed-msg-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.remove('pinned-flash');
  // Force reflow so the animation restarts even on repeated clicks.
  void el.offsetWidth;
  el.classList.add('pinned-flash');
  window.setTimeout(() => el.classList.remove('pinned-flash'), 1800);
};

// Short plain-text preview from a message's HTML body (for the reply quote).
const plainPreview = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// First sentence of a message, with a trailing ellipsis when there's more —
// the WhatsApp-style truncated snippet for a reply quote.
const firstSentence = (text: string) => {
  const clean = text.trim();
  if (!clean) return '';
  const match = clean.match(/^.*?[.!?](?=\s|$)/);
  let snippet = (match ? match[0] : clean).trim();
  if (snippet.length > 80) snippet = snippet.slice(0, 80).trim();
  return snippet.length < clean.length ? `${snippet} …` : snippet;
};

// WhatsApp-style quoted reply shown at the top of a follow-up message: the
// parent's sender + the first sentence of its content. Clicking it scrolls to
// the parent.
const QuotedReply = ({ parent, parentId }: { parent?: ChatMessage; parentId: string }) => {
  const preview = parent
    ? firstSentence(plainPreview(parent.content) || parent.attachment?.name || '')
    : '';
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('feed:jump', { detail: parentId }))}
      className="w-full text-left mb-2 rounded-lg border-l-4 border-emerald-500 bg-emerald-50/70 px-2.5 py-1.5 hover:bg-emerald-100/70 transition-colors cursor-pointer"
    >
      <p className="text-[10px] font-bold text-emerald-700 truncate">{parent?.sender ?? 'Trade message'}</p>
      {preview && <p className="text-[11px] text-slate-500 truncate">{preview}</p>}
    </button>
  );
};

// Every message renders as a left-aligned post (like the seed messages),
// regardless of who sent it or its type.
const MessageBubble = ({ message, status, communityTag, parentMessage, onOpenFile, onTickClick }: { message: ChatMessage; status: ChatMessage['status']; communityTag?: string; parentMessage?: ChatMessage; onOpenFile: (attachment: FileAttachment) => void; onTickClick: () => void }) => {
  const typeLabel = message.messageTypeId != null ? MESSAGE_TYPE_LABELS[message.messageTypeId] : undefined;
  const shortId = message.sequenceKey != null ? String(message.sequenceKey) : message.id ? message.id.slice(-3) : '';
  return (
    <div className="max-w-[380px] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm bg-white border border-slate-200 text-slate-800">
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-[10px] font-bold text-emerald-600">{message.sender}</p>
        {message.pinned && <Pin className="w-3 h-3 text-emerald-500 rotate-45 shrink-0" />}
      </div>

      {/* Follow-up reply quote — only for messages that follow up on another. A
          direct follow-up (no parent) keeps the plain white bubble. */}
      {message.parentMessageId && (
        <QuotedReply parent={parentMessage} parentId={message.parentMessageId} />
      )}

      {/* File attachment */}
      {message.attachment && (
        <FileAttachmentView attachment={message.attachment} isSent={false} onOpen={() => onOpenFile(message.attachment!)} />
      )}

      {/* Text content */}
      {message.content && (
        <SafeHtml
          className="text-[13px] leading-relaxed text-slate-700 break-words whitespace-pre-wrap [&_p:empty]:min-h-[1em] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-blue-600 [&_a]:underline [&_a]:break-all"
          html={linkifyHtml(message.content)}
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

// One message row. The delivery tick reflects the message's own status; the
// seen-by stats API is NOT called here. Previously every row eagerly fetched its
// stats just to colour the tick, which fired one request per message on open and
// tripped the backend rate limiter. Those stats are now fetched on demand only,
// inside ViewedByPanel, when the tick is actually clicked.
const MessageRow = React.memo(function MessageRow({
  msg,
  communityTag,
  parentMessage,
  onTogglePin,
  onOpenFile,
  onShowStats,
  onFollowUp,
}: {
  msg: ChatMessage;
  communityTag?: string;
  parentMessage?: ChatMessage;
  onTogglePin?: (messageId: string) => void;
  onOpenFile: (attachment: FileAttachment) => void;
  onShowStats: (messageId: string) => void;
  onFollowUp?: (message: ChatMessage) => void;
}) {
  const status = msg.status;
  // Imperative handle so a right-click on the card opens the three-dots menu.
  const menuRef = React.useRef<MessageMenuHandle>(null);

  // Only render the green research/trade card for messages the backend marks as
  // Trade (type label or numeric id 1). A message whose text merely matches the
  // research-analysis pattern is not necessarily a trade, so we no longer infer
  // the type from the content.
  const isTrade = msg.messageType === 'Trade' || msg.messageTypeId === 1;

  // Links detected in this message's body, surfaced via the three-dots menu.
  const links = React.useMemo(() => extractLinks(msg.content), [msg.content]);

  return (
    // Full-width row carries the scroll/highlight target so the pinned
    // flash spans the whole width; the bubble stays inset & content-width.
    <div id={`feed-msg-${msg.id}`} className="w-full scroll-mt-4 px-3 sm:px-6 py-1">
      <div
        className="group relative w-fit max-w-full"
        // Right-click anywhere on the card opens the three-dots menu instead of
        // the browser's native context menu.
        onContextMenu={(e) => {
          e.preventDefault();
          menuRef.current?.open();
        }}
      >
        {isTrade ? (
          <TradeCard
            content={msg.content}
            sender={msg.sender}
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
            parentMessage={parentMessage}
            onOpenFile={onOpenFile}
            onTickClick={() => onShowStats(msg.id)}
          />
        )}
        <MessageMenu
          ref={menuRef}
          pinned={!!msg.pinned}
          onTogglePin={() => onTogglePin?.(msg.id)}
          links={links}
          // Follow-up replies target trade messages.
          onFollowUp={isTrade && onFollowUp ? () => onFollowUp(msg) : undefined}
        />
      </div>
    </div>
  );
});

// How many of the most recent messages render initially, and how many more each
// "load earlier" reveals. A full chat can hold hundreds of messages; rendering
// them all at once (each row is a card + sanitized HTML + a popover) is what
// made opening a chat take several seconds. The RA is auto-scrolled to the
// bottom, so only the tail is ever visible.
const MESSAGE_WINDOW_STEP = 40;

const ChatFeed = ({ communityTag, messages = [], loading = false, onTogglePin, onFollowUp }: ChatFeedProps) => {
  // Lookup (over ALL messages, not just the visible window) so a follow-up can
  // resolve and quote its parent even when the parent is above the fold.
  const messageById = React.useMemo(() => {
    const map = new Map<string, ChatMessage>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  // Only render the most recent `visibleCount` messages; "load earlier" grows it.
  const [visibleCount, setVisibleCount] = React.useState(MESSAGE_WINDOW_STEP);
  const visibleMessages =
    visibleCount >= messages.length ? messages : messages.slice(messages.length - visibleCount);
  const hasOlder = messages.length > visibleMessages.length;

  // Message id whose "Viewed by" panel is open (null = closed).
  const [statsMessageId, setStatsMessageId] = React.useState<string | null>(null);
  const [viewingFile, setViewingFile] = React.useState<FileAttachment | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Stable handlers so memoized rows don't re-render when the stats/file panels
  // toggle (those are ChatFeed-local state changes, unrelated to the rows).
  const handleShowStats = React.useCallback(
    (messageId: string) =>
      setStatsMessageId((current) => (current === messageId ? null : messageId)),
    []
  );
  const handleOpenFile = React.useCallback((att: FileAttachment) => setViewingFile(att), []);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages.length]);

  // Central jump-to-message handler (pinned bar / reply quote dispatch this). If
  // the target is older than the rendered window it isn't in the DOM yet, so we
  // reveal the full history first, then scroll + flash once it has rendered.
  React.useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!id) return;
      if (!document.getElementById(`feed-msg-${id}`)) {
        setVisibleCount(Number.MAX_SAFE_INTEGER);
      }
      // Defer so the (possibly just-revealed) row is in the DOM before scrolling.
      setTimeout(() => scrollToMessage(id), 0);
    };
    window.addEventListener('feed:jump', handler);
    return () => window.removeEventListener('feed:jump', handler);
  }, []);

  // Render older messages in chunks as the RA scrolls toward the top, and stash
  // the pre-load scroll metrics so we can keep the viewport anchored (prepending
  // rows would otherwise shove the content down).
  const viewportRef = React.useRef<HTMLElement | null>(null);
  const anchorRef = React.useRef<{ height: number; top: number } | null>(null);

  React.useEffect(() => {
    const viewport = scrollRef.current?.querySelector<HTMLElement>(
      '[data-radix-scroll-area-viewport]'
    );
    if (!viewport) return;
    viewportRef.current = viewport;
    const onScroll = () => {
      if (viewport.scrollTop <= 120 && !anchorRef.current && visibleCount < messages.length) {
        anchorRef.current = { height: viewport.scrollHeight, top: viewport.scrollTop };
        setVisibleCount((c) => c + MESSAGE_WINDOW_STEP);
      }
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [visibleCount, messages.length]);

  // After a chunk is prepended, restore the scroll so the row the RA was looking
  // at stays put (offset by however much taller the content became).
  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const anchor = anchorRef.current;
    if (viewport && anchor) {
      viewport.scrollTop = anchor.top + (viewport.scrollHeight - anchor.height);
      anchorRef.current = null;
    }
  }, [visibleCount]);

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
              a three-dots menu for pinning. While the chat is still loading and
              nothing is cached yet, show skeleton bubbles instead of a blank gap. */}
          {loading && messages.length === 0 ? (
            <ChatFeedSkeleton />
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {hasOlder && (
                <div className="flex justify-center py-1">
                  <button
                    type="button"
                    onClick={() => {
                      const viewport = viewportRef.current;
                      if (viewport) anchorRef.current = { height: viewport.scrollHeight, top: viewport.scrollTop };
                      setVisibleCount((c) => c + MESSAGE_WINDOW_STEP);
                    }}
                    className="text-[12px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    Load earlier messages
                  </button>
                </div>
              )}
              {visibleMessages.map((msg) => (
                <MessageRow
                  key={msg.id}
                  msg={msg}
                  communityTag={communityTag}
                  parentMessage={msg.parentMessageId ? messageById.get(msg.parentMessageId) : undefined}
                  onTogglePin={onTogglePin}
                  onOpenFile={handleOpenFile}
                  onShowStats={handleShowStats}
                  onFollowUp={onFollowUp}
                />
              ))}
            </div>
          )}
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