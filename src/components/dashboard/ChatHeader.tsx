'use client';

import React from 'react';
import { TrendingUp, Eye, FileSpreadsheet, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  title: string;
  members: string;
  views: string;
}

const ChatHeader = ({ title, members, views }: ChatHeaderProps) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400 font-medium">{members}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Eye className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-600">Views: {views}</span>
        </div>
        <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 gap-2 font-bold h-9">
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreVertical className="h-5 w-5 text-slate-400" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
