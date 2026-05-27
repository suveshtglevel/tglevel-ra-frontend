'use client';

import React from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Community, SubCommunity } from '@/constants/mockData';

interface CommunityCardProps {
  community: Community;
  active: boolean;
  onSelect: () => void;
}

const CheckCircle = ({ checked, onClick }: { checked: boolean; onClick?: (e: React.MouseEvent) => void }) => (
  <button
    type="button"
    aria-label="Toggle selection"
    aria-pressed={checked}
    onClick={onClick}
    className={cn(
      "w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
      checked
        ? "border-emerald-500 bg-emerald-500"
        : "border-[#D1D5DB] bg-white"
    )}
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
);

interface SubCommunityRowProps {
  sub: SubCommunity;
  checked: boolean;
  onToggle: () => void;
}

const SubCommunityRow = ({ sub, checked, onToggle }: SubCommunityRowProps) => {
  return (
    <div className="flex items-center h-[48px] px-4 bg-[#F8FAFC] rounded-[12px]">
      <span className="text-[13px] font-bold text-[#0F172A] w-[50px]">{sub.name}</span>
      <div className="flex items-center gap-1 ml-2 flex-1">
        <Users className="w-3 h-3 text-[#94A3B8]" />
        <span className="text-[11px] font-medium text-[#94A3B8]">{sub.members}</span>
      </div>
      <span className="text-[12px] font-medium text-[#64748B] mr-3">
        {sub.type}
      </span>
      <CheckCircle
        checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      />
    </div>
  );
};

const CommunityCard = ({ community, active, onSelect }: CommunityCardProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const subCommunities = community.subCommunities ?? [];

  // Track checked state per sub-community (default: Free = checked)
  const [checkedMap, setCheckedMap] = React.useState<Record<number, boolean>>(() => {
    const map: Record<number, boolean> = {};
    subCommunities.forEach((s) => {
      map[s.id] = s.type === 'Free';
    });
    return map;
  });

  const selectedCount = Object.values(checkedMap).filter(Boolean).length;

  const toggleSub = (subId: number) => {
    setCheckedMap((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

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
        "w-[287px] flex flex-col px-3 bg-[#FDFDFD] border-[#E2E8F0] shadow-none rounded-[14px] cursor-pointer transition-all hover:border-emerald-200 relative group overflow-hidden",
        active && "border-emerald-200 bg-emerald-50/30"
      )}
    >
      {/* Header Row */}
      <div className="flex items-center h-[74px] shrink-0">
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

        {/* Top Right Controls */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-[15px]">
          {subCommunities.length > 0 ? (
            <>
              {/* Selected count badge */}
              {selectedCount > 0 && (
                <div className="w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{selectedCount}</span>
                </div>
              )}
              {selectedCount === 0 && (
                <div className="w-[15px] h-[15px] rounded-full border border-[#E2E8F0] bg-white" />
              )}
              <button
                type="button"
                aria-label="Toggle dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((prev) => !prev);
                }}
                className="p-0 bg-transparent border-none cursor-pointer"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-[#64748B] mt-1 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
              </button>
            </>
          ) : (
            <div className="w-[15px] h-[15px] rounded-full border border-[#E2E8F0] bg-white" />
          )}
        </div>
      </div>

      {/* Expanded Sub-Communities Dropdown */}
      {expanded && subCommunities.length > 0 && (
        <div className="flex flex-col gap-2 pb-3">
          {subCommunities.map((sub) => (
            <SubCommunityRow
              key={sub.id}
              sub={sub}
              checked={checkedMap[sub.id] ?? false}
              onToggle={() => toggleSub(sub.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default CommunityCard;
