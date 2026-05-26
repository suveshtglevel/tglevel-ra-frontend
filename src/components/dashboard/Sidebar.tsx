'use client';

import React from 'react';
import { MessageSquare, MonitorPlay, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  return (
    <aside className="w-16 flex flex-col items-center py-6 bg-white border-r border-slate-200 gap-8 shrink-0">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
        <MessageSquare className="w-6 h-6" />
      </div>
      <nav className="flex flex-col gap-6 flex-1">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <MonitorPlay className="w-6 h-6" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs cursor-pointer">
          TJ
        </div>
      </nav>
      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
        <Settings className="w-6 h-6" />
      </Button>
    </aside>
  );
};

export default Sidebar;
