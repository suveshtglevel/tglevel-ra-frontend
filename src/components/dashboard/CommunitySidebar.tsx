'use client';

import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CommunityCard from './CommunityCard';
import CommunityFilters from './CommunityFilters';

interface Community {
  id: number;
  name: string;
  members: string;
  time: string;
  active: boolean;
}

interface CommunitySidebarProps {
  communities: Community[];
}

const CommunitySidebar = ({ communities }: CommunitySidebarProps) => {
  return (
    <section className="w-80 flex flex-col bg-white border-r border-slate-200 shrink-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
            TG
          </div>
          <h2 className="font-bold text-slate-800">TG Levels</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search For Community" 
            className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-sm"
          />
        </div>
      </div>

      <CommunityFilters />

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-2 pb-4">
          {communities.map((comm) => (
            <CommunityCard key={comm.id} community={comm} />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};


export default CommunitySidebar;
