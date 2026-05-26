'use client';

import React from 'react';
import { TrendingUp, Users, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Community {
  id: number;
  name: string;
  members: string;
  time: string;
  active: boolean;
}

interface CommunityCardProps {
  community: Community;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
  return (
    <Card 
      className={cn(
        "p-4 border-slate-100 shadow-none rounded-2xl cursor-pointer transition-all hover:border-emerald-200",
        community.active && "border-emerald-200 bg-emerald-50/30"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-emerald-500 border border-slate-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">{community.name}</h3>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3 h-3" />
              <span className="text-[11px] font-medium">{community.members}</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-medium text-slate-400">{community.time}</span>
      </div>
      <div className="flex justify-end mt-2">
        <ChevronDown className="w-4 h-4 text-slate-300" />
      </div>
    </Card>
  );
};

export default CommunityCard;
