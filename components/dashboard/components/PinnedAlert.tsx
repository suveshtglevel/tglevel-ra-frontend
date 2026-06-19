'use client';

import React from 'react';
import { Pin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedItem {
  id: string;
  preview: string;
}

interface PinnedAlertProps {
  pinnedMessages: PinnedItem[];
}

// Ask the feed to jump to a message. The feed owns this because the target may
// be older than its rendered window — it reveals the history first, then scrolls
// and flashes the row.
const scrollToMessage = (id: string) => {
  window.dispatchEvent(new CustomEvent('feed:jump', { detail: id }));
};

const PinnedAlert = ({ pinnedMessages }: PinnedAlertProps) => {
  // Collapsed by default: show only the latest pinned message until expanded.
  const [expanded, setExpanded] = React.useState(false);

  // Nothing pinned -> the bar is hidden entirely.
  if (pinnedMessages.length === 0) return null;

  const count = pinnedMessages.length;
  // pinnedMessages[0] is the most recently pinned. Collapsed shows just it.
  const visible = expanded ? pinnedMessages : pinnedMessages.slice(0, 1);

  return (
    <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-2 text-sm shrink-0">
      <div className="flex flex-col gap-1.5">
        {visible.map((m, idx) => {
          // The first row doubles as the expand/collapse control (clicking the
          // row/box or the arrow toggles the list) when there is more than one
          // pinned message. Clicking the text itself jumps to the message.
          const toggleable = idx === 0 && count > 1;
          return (
            <div
              key={m.id}
              role={toggleable ? 'button' : undefined}
              tabIndex={toggleable ? 0 : undefined}
              onClick={toggleable ? () => setExpanded((prev) => !prev) : undefined}
              onKeyDown={
                toggleable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpanded((prev) => !prev);
                      }
                    }
                  : undefined
              }
              className={cn(
                'flex items-center gap-3 rounded-lg',
                toggleable && 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-0.5'
              )}
            >
              <Pin className="w-4 h-4 text-emerald-500 rotate-45 shrink-0" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToMessage(m.id);
                }}
                className="flex-1 min-w-0 truncate text-left bg-transparent border-none p-0 text-slate-700 font-medium cursor-pointer hover:text-emerald-600 transition-colors"
              >
                {m.preview}
              </button>
              {toggleable && (
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0',
                    expanded && 'rotate-180'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedAlert;
