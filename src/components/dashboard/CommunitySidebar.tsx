'use client';

import React from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import CommunityCard from './CommunityCard';
import CommunityFilters from './CommunityFilters';
import type { FilterType } from './CommunityFilters';
import type { Community } from '@/constants/mockData';

interface CommunitySidebarProps {
  communities: Community[];
  selectedCommunityId: number;
  selectedSubCommunityId: number | null;
  onSelectCommunity: (id: number) => void;
  onSelectSubCommunity: (id: number) => void;
}

const CommunitySidebar = ({
  communities,
  selectedCommunityId,
  selectedSubCommunityId,
  onSelectCommunity,
  onSelectSubCommunity,
}: CommunitySidebarProps) => {
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<FilterType>('ALL');
  const [expandedCommunityId, setExpandedCommunityId] = React.useState<number | null>(communities[0]?.id ?? null);

  const filteredCommunities = communities.filter((comm) => {
    // Search filter
    if (search && !comm.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Type filter
    if (activeFilter === 'Free') {
      // Communities with sub-communities that have free ones, or "Free Alumini"
      const hasFree = comm.subCommunities?.some((s) => s.type === 'Free') ?? false;
      const isFreeByName = comm.name.toLowerCase().includes('free');
      return hasFree || isFreeByName;
    }
    if (activeFilter === 'Premium') {
      const hasPaid = comm.subCommunities?.some((s) => s.type === 'Paid') ?? false;
      const isPaidByName = comm.name.toLowerCase().includes('paid');
      return hasPaid || isPaidByName;
    }
    return true;
  });

  return (
    <section className="w-80 flex flex-col bg-white border-r border-slate-200 shrink-0">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
            TG
          </div>
          <h2 className="font-bold text-slate-800">TG Levels</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4 mb-4">
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

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-2 pb-4">
          {filteredCommunities.length > 0 ? (
            filteredCommunities.map((comm, index) => (
              <div key={comm.id}>
                <CommunityCard
                  community={comm}
                  active={comm.id === selectedCommunityId}
                  selectedSubCommunityId={selectedSubCommunityId}
                  initialExpanded={index === 0}
                  onSelect={() => {
                    onSelectCommunity(comm.id);
                    setExpandedCommunityId(comm.id);
                  }}
                  onSelectSubCommunity={onSelectSubCommunity}
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
  );
};

export default CommunitySidebar;
