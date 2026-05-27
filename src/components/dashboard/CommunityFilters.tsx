'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterType = 'ALL' | 'Free' | 'Premium';

interface CommunityFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'Free', value: 'Free' },
  { label: 'Premium', value: 'Premium' },
];

const CommunityFilters = ({ activeFilter, onFilterChange }: CommunityFiltersProps) => {
  return (
    <div className="px-4 flex gap-2 mb-6">
      {FILTERS.map((f) => (
        <Badge
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          variant={activeFilter === f.value ? 'default' : 'outline'}
          className={cn(
            "px-4 py-1.5 rounded-lg cursor-pointer transition-colors",
            activeFilter === f.value
              ? "bg-emerald-500 hover:bg-emerald-600 border-none text-white"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          )}
        >
          {f.label}
        </Badge>
      ))}
    </div>
  );
};

export default CommunityFilters;
