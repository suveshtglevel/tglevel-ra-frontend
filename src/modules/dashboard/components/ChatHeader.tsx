'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, MoreVertical, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/store/slices/messageSlice';

// Opened only from the header menu, so defer its code (incl. the file viewer)
// until the RA actually opens it.
const MediaDocsPanel = dynamic(() => import('./MediaDocsPanel'), { ssr: false });

interface ChatHeaderProps {
  title: string;
  members: string;
  messages?: ChatMessage[];
  onMenuClick?: () => void;
}

const ChatHeader = ({ title, members, messages = [], onMenuClick }: ChatHeaderProps) => {
  const [showPanel, setShowPanel] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!showPanel) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-800 text-sm sm:text-base truncate">{title}</h1>
          <p className="text-xs text-slate-400 font-medium truncate">{members}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={() => setShowPanel((prev) => !prev)}
          >
            <MoreVertical className="h-5 w-5 text-slate-400" />
          </Button>

          {showPanel && (
            <div className="absolute top-12 right-0 z-50 shadow-xl rounded-2xl overflow-hidden">
              <MediaDocsPanel
                title={title}
                messages={messages}
                onClose={() => setShowPanel(false)}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
