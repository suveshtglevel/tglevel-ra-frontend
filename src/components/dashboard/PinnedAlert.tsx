'use client';

import React from 'react';
import { Pin, ChevronDown } from 'lucide-react';

interface PinnedAlertProps {
  message: string;
}

const PinnedAlert = ({ message }: PinnedAlertProps) => {
  return (
    <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center justify-between text-sm shrink-0">
      <div className="flex items-center gap-3 text-slate-700 font-bold overflow-hidden">
        <Pin className="w-4 h-4 text-emerald-500 rotate-45 shrink-0" />
        <span className="truncate">{message}</span>
      </div>
      <ChevronDown className="w-4 h-4 text-slate-400" />
    </div>
  );
};

export default PinnedAlert;
