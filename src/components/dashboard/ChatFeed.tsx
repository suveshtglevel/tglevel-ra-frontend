'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ResearchCard from './ResearchCard';

interface ChatFeedProps {
  analysis: any;
}

const ChatFeed = ({ analysis }: ChatFeedProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="max-w-4xl py-8 px-6 flex flex-col items-start">
        <div className="mb-8 flex items-center gap-4 w-full">
          <div className="flex-1 h-[1px] bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</span>
          <div className="flex-1 h-[1px] bg-slate-200" />
        </div>

        <ResearchCard analysis={analysis} />
      </div>
    </ScrollArea>
  );
};

export default ChatFeed;
