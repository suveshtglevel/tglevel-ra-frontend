'use client';

import React from 'react';
import { Users, ChevronDown, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CommunityVM, SubCommunityVM } from '@/types/dashboard';

// Infer a sub-community's plan from its name (e.g. NF1 = Free, NP1 = Paid): the
// letter immediately before the trailing number is F (free) or P (paid).
const subPlanFromName = (name: string): 'Free' | 'Paid' | null => {
  const letter = name.match(/([a-z])\s*\d+\s*$/i)?.[1]?.toLowerCase();
  if (letter === 'f') return 'Free';
  if (letter === 'p') return 'Paid';
  return null;
};

interface CommunityCardProps {
  community: CommunityVM;
  active: boolean;
  selectedSubCommunityId: string | null;
  targetSubIds: string[];
  // When set (Free/Paid), only sub-communities of this type are shown; the
  // community itself stays visible regardless.
  subTypeFilter?: string | null;
  initialExpanded?: boolean;
  onSelectCommunity: (id: string) => void;
  onSelectSubCommunity: (id: string) => void;
  onToggleSubTarget: (communityId: string, subId: string) => void;
  onToggleCommunityTargets: (communityId: string, allSubIds: string[]) => void;
}

const CheckCircle = ({ checked, onClick }: { checked: boolean; onClick?: (e: React.MouseEvent) => void }) => (
  <button
    type="button"
    aria-label="Toggle selection"
    aria-pressed={checked}
    onClick={onClick}
    className={cn(
      "w-[16px] h-[16px] rounded-full border-1 flex items-center justify-center transition-colors shrink-0 cursor-pointer",
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
  sub: SubCommunityVM;
  checked: boolean;
  isSelected: boolean;
  sendable: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const SubCommunityRow = ({ sub, checked, isSelected, sendable, onToggle, onSelect }: SubCommunityRowProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      // Double-click anywhere on the row toggles its selection (same as the
      // check-circle) — a bigger, easier target than the 16px circle. Stops
      // propagation so it doesn't also hit the community's "select all".
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (sendable) onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }
      }}
      className={cn(
        "flex items-center h-[48px] px-4 bg-[#F8FAFC] rounded-[12px] cursor-pointer transition-all hover:bg-emerald-100/30",
        isSelected && "bg-emerald-100 border border-emerald-300"
      )}
    >
      <span className={cn("text-[13px] font-bold w-[50px]", isSelected ? "text-emerald-600" : "text-[#0F172A]")}>
        {sub.name}
      </span>
      <div className="flex items-center gap-1 ml-2 flex-1">
        <Users className={cn("w-3 h-3", isSelected ? "text-emerald-600" : "text-[#94A3B8]")} />
        <span className={cn("text-[11px] font-medium", isSelected ? "text-emerald-600" : "text-[#94A3B8]")}>
          {sub.members}
        </span>
      </div>
      <span className={cn("text-[12px] font-medium mr-3", isSelected ? "text-emerald-600" : "text-[#64748B]")}>
        {sub.type}
      </span>
      {sendable ? (
        <CheckCircle
          checked={checked}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        />
      ) : (
        <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
      )}
    </div>
  );
};

const CommunityCard = ({ community, active, selectedSubCommunityId, targetSubIds, subTypeFilter, initialExpanded = false, onSelectCommunity, onSelectSubCommunity, onToggleSubTarget, onToggleCommunityTargets }: CommunityCardProps) => {
  const [expanded, setExpanded] = React.useState(initialExpanded);
  const allSubCommunities = community.subCommunities ?? [];
  // The card keeps the same design as the unfiltered list (arrow, master
  // checkbox, structure) based on the FULL sub-community list; the Free/Paid
  // filter only narrows which sub-rows are shown when expanded. Matching is
  // case-insensitive so it works with whatever casing the API returns.
  const hasSubCommunities = allSubCommunities.length > 0;
  const subCommunities = subTypeFilter
    ? allSubCommunities.filter((s) => subPlanFromName(s.name) === subTypeFilter)
    : allSubCommunities;
  const toggleExpanded = () => setExpanded((prev) => !prev);

  // Clicking the community header: if it has sub-communities, toggle the list
  // AND open the first visible one's chat. If it has none (e.g. Free/Paid
  // Alumini), open the community's own chat directly.
  const handleHeaderClick = () => {
    if (hasSubCommunities) {
      toggleExpanded();
      onSelectSubCommunity((subCommunities[0] ?? allSubCommunities[0]).id);
    } else {
      onSelectCommunity(community.id);
    }
  };

  // Checked state is driven by the parent (one community selectable at a time).
  // Counts/“all selected” track the currently-visible (filtered) sub-rows.
  const selectedCount = subCommunities.filter((s) => targetSubIds.includes(s.id)).length;
  const allSelected = subCommunities.length > 0 && selectedCount === subCommunities.length;
  // Communities without sub-communities are targeted by their own id.
  const selfSelected = targetSubIds.includes(community.id);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleHeaderClick}
      // Double-click the community selects all of its sub-communities at once
      // (or the community itself when it has none) — the same action as the
      // master check-circle. Locked (non-sendable) communities are skipped.
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!community.sendable) return;
        onToggleCommunityTargets(
          community.id,
          hasSubCommunities ? subCommunities.map((s) => s.id) : [community.id]
        );
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleHeaderClick();
        }
      }}
      className={cn(
        "w-full flex flex-col px-3 bg-[#FDFDFD] border-[#E2E8F0] shadow-none rounded-[14px] cursor-pointer transition-all hover:border-emerald-200 relative group overflow-hidden",
        active && "border-emerald-200 bg-emerald-50/30"
      )}
    >
      {/* Header Row */}
      <div className="flex items-center h-[74px] shrink-0">
        {/* Left Icon Container — community icon when available, else fallback SVG. */}
        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0 overflow-hidden">
          {community.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={community.iconUrl}
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5.25H19.5V9.75" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.5 5.25L13.125 11.625L9.375 7.875L4.5 12.75" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
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
          {hasSubCommunities && selectedCount > 0 && (
            <div className="mt-1 w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{selectedCount}</span>
            </div>
          )}
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-[15px]">
          {hasSubCommunities ? (
            <>
              {/* Master checkbox: selects/clears all sub-communities. The RA can
                  only target communities it is assigned to (others are locked). */}
              {community.sendable ? (
                <CheckCircle
                  checked={allSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCommunityTargets(community.id, subCommunities.map((s) => s.id));
                  }}
                />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-300" />
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
          ) : community.sendable ? (
            <CheckCircle
              checked={selfSelected}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCommunityTargets(community.id, [community.id]);
              }}
            />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-300" />
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
              checked={targetSubIds.includes(sub.id)}
              isSelected={selectedSubCommunityId === sub.id}
              sendable={community.sendable}
              onToggle={() => onToggleSubTarget(community.id, sub.id)}
              onSelect={() => onSelectSubCommunity(sub.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default CommunityCard;
