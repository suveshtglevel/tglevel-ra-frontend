'use client';

import React from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Community } from '@/constants/mockData';

interface CommunityCardProps {
  community: Community;
  active: boolean;
  onSelect: () => void;
}

const CommunityCard = ({ community, active, onSelect }: CommunityCardProps) => {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-[287px] h-[74px] flex items-center px-3 bg-[#FDFDFD] border-[#E2E8F0] shadow-none rounded-[14px] cursor-pointer transition-all hover:border-emerald-200 relative group",
        active && "border-emerald-200 bg-emerald-50/30"
      )}
    >
        {/* Left Icon Container */}
        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5.25H19.5V9.75" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.5 5.25L13.125 11.625L9.375 7.875L4.5 12.75" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Center Content */}
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-[13px] font-bold text-[#0F172A] truncate leading-tight">
            {community.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-[#64748B]" />
            <span className="text-[11px] font-medium text-[#64748B]">{community.members}</span>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex flex-col items-end h-10 pr-10">
          <span className="text-[10px] font-medium text-[#64748B]">{community.time}</span>
        </div>

        {/* Top Right Controls (Status Circle + Arrow) */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-[15px]">
          <div className="w-[15px] h-[15px] rounded-full border border-[#E2E8F0] bg-white" />
          <ChevronDown className="w-4 h-4 text-[#64748B] mt-1" />
        </div>
      </Card>
  );
};


export default CommunityCard;
