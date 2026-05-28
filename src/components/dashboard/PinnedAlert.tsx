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

const scrollToMessage = (id: string) => {
  document.getElementById(`feed-msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const PinnedAlert = ({ pinnedMessages }: PinnedAlertProps) => {
  const [collapsed, setCollapsed] = React.useState(false);

  // Nothing pinned -> the bar is hidden entirely.
  if (pinnedMessages.length === 0) return null;

  const count = pinnedMessages.length;

  return (
    <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-2.5 text-sm shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-slate-700 font-bold overflow-hidden min-w-0">
          <Pin className="w-4 h-4 text-emerald-500 rotate-45 shrink-0" />
          {count > 1 && (
            <span className="text-[10px] font-bold text-white bg-emerald-500 rounded-full px-1.5 py-0.5 shrink-0">
              {count}
            </span>
          )}
          {collapsed ? (
            <span className="text-slate-400 text-xs">
              {count} pinned message{count > 1 ? 's' : ''}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => scrollToMessage(pinnedMessages[0].id)}
              className="truncate text-left bg-transparent border-none p-0 cursor-pointer hover:text-emerald-600 transition-colors"
            >
              {pinnedMessages[0].preview}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="bg-transparent border-none cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Remaining pinned messages */}
      {!collapsed && count > 1 && (
        <div className="mt-1.5 ml-7 flex flex-col gap-1 items-start">
          {pinnedMessages.slice(1).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => scrollToMessage(m.id)}
              className="max-w-full truncate text-left bg-transparent border-none p-0 text-slate-500 font-medium text-xs cursor-pointer hover:text-emerald-600 transition-colors"
            >
              {m.preview}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinnedAlert;
