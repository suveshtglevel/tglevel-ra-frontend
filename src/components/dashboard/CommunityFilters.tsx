'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

const CommunityFilters = () => {
  return (
    <div className="px-4 flex gap-2 mb-6">
      <Badge className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-lg border-none">ALL</Badge>
      <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">Free</Badge>
      <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">Premium</Badge>
    </div>
  );
};

export default CommunityFilters;
