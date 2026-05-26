'use client';

import React from 'react';
import { toast } from 'react-hot-toast';
import Sidebar from '@/components/dashboard/Sidebar';
import CommunitySidebar from '@/components/dashboard/CommunitySidebar';
import ChatHeader from '@/components/dashboard/ChatHeader';
import PinnedAlert from '@/components/dashboard/PinnedAlert';
import MessageComposer from '@/components/dashboard/MessageComposer';
import ChatFeed from '@/components/dashboard/ChatFeed';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { communities, currentAnalysis, handleSendMessage } = useDashboard();

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <CommunitySidebar communities={communities} />

      {/* Main Feed Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <ChatHeader 
          title="Nifty & Bank Nifty" 
          members="12,402 members" 
          views="24.5k" 
        />
        
        <PinnedAlert message="Bank Nifty 44200 CE Buy Above 250" />

        {/* Feed Scroll Area */}
        <ChatFeed analysis={currentAnalysis} />

        {/* Message Input Section */}
        <div className="p-6 bg-[#F8FAFC] shrink-0">
          <div className="max-w-[991px] mx-auto w-full">
            <MessageComposer onSend={handleSendMessage} />
          </div>
        </div>
      </main>
    </div>
  );
}
