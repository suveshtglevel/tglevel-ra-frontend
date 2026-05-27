'use client';

import React from 'react';
import { Pin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedAlertProps {
  message: string;
}

const PinnedAlert = ({ message }: PinnedAlertProps) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-sm shrink-0">
      <div className="flex items-center gap-3 text-slate-700 font-bold overflow-hidden">
        <Pin className="w-4 h-4 text-emerald-500 rotate-45 shrink-0" />
        {!collapsed && <span className="truncate">{message}</span>}
        {collapsed && <span className="text-slate-400 text-xs">Pinned message</span>}
      </div>
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="bg-transparent border-none cursor-pointer p-1 rounded hover:bg-slate-100 transition-colors"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </div>
  );
};

export default PinnedAlert;
