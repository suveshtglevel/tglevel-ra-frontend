'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import CommunityCard from './CommunityCard';
import CommunityFilters from './CommunityFilters';
import type { FilterType } from './CommunityFilters';
import type { CommunityVM } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface CommunitySidebarProps {
  communities: CommunityVM[];
  selectedCommunityId: string | null;
  selectedSubCommunityId: string | null;
  targetCommunityId: string | null;
  targetSubIds: string[];
  open: boolean;
  onClose: () => void;
  onSelectCommunity: (id: string) => void;
  onSelectSubCommunity: (id: string) => void;
  onToggleSubTarget: (communityId: string, subId: string) => void;
  onToggleCommunityTargets: (communityId: string, allSubIds: string[]) => void;
}

const CommunitySidebar = ({
  communities,
  selectedCommunityId,
  selectedSubCommunityId,
  targetCommunityId,
  targetSubIds,
  open,
  onClose,
  onSelectCommunity,
  onSelectSubCommunity,
  onToggleSubTarget,
  onToggleCommunityTargets,
}: CommunitySidebarProps) => {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('ALL');

  // The Free/Premium filter no longer hides whole communities — every community
  // stays visible (subject to search) and the filter is applied to the
  // sub-communities shown inside each card instead.
  const subTypeFilter =
    activeFilter === 'Free' ? 'Free' : activeFilter === 'Premium' ? 'Paid' : null;

  const filteredCommunities = communities.filter((comm) => {
    // Search filter (debounced)
    if (debouncedSearch && !comm.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
      return false;
    }
    // The Premium filter hides the Free/Paid Alumni communities (the spelling
    // varies — "Alumni"/"Alumini" — so match the common "alum" stem).
    if (activeFilter === 'Premium' && /alum/i.test(comm.name)) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <section
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[320px] flex flex-col bg-white border-r border-slate-200 shrink-0 transition-transform duration-300 ease-in-out",
          "lg:static lg:z-auto lg:w-80 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
              TG
            </div>
            <h2 className="font-bold text-slate-800">TG Levels</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-2 -mr-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search For Community"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-sm"
            />
          </div>
        </div>

        <CommunityFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <ScrollArea className="flex-1 min-h-0 px-4">
          <div className="flex flex-col gap-2 pb-4">
            {filteredCommunities.length > 0 ? (
              filteredCommunities.map((comm, index) => (
                <div key={comm.id}>
                  <CommunityCard
                    community={comm}
                    active={comm.id === selectedCommunityId}
                    selectedSubCommunityId={selectedSubCommunityId}
                    targetSubIds={targetCommunityId === comm.id ? targetSubIds : []}
                    subTypeFilter={subTypeFilter}
                    initialExpanded={index === 0}
                    onSelectCommunity={onSelectCommunity}
                    onSelectSubCommunity={onSelectSubCommunity}
                    onToggleSubTarget={onToggleSubTarget}
                    onToggleCommunityTargets={onToggleCommunityTargets}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No communities found
              </div>
            )}
          </div>
        </ScrollArea>
      </section>
    </>
  );
};

export default CommunitySidebar;
