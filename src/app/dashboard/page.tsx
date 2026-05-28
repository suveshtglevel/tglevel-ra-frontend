'use client';

import React from 'react';
import CommunitySidebar from '@/components/dashboard/CommunitySidebar';
import ChatHeader from '@/components/dashboard/ChatHeader';
import PinnedAlert from '@/components/dashboard/PinnedAlert';
import MessageComposer from '@/components/dashboard/MessageComposer';
import ChatFeed from '@/components/dashboard/ChatFeed';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const {
    communities,
    selectedCommunityId,
    selectedSubCommunityId,
    selectedCommunity,
    selectedSubCommunity,
    currentMessages,
    pinnedItems,
    checkboxTargets,
    toggleSubTarget,
    toggleCommunityTargets,
    handleSelectSubCommunity,
    handleSelectCommunity,
    handleSendMessage,
    handleSendFile,
    handleTogglePin,
  } = useDashboard();

  // Community list is an off-canvas drawer below `lg`; static side-by-side at lg+.
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const headerTitle = selectedSubCommunity ? selectedSubCommunity.name : selectedCommunity.name;
  const headerMembers = selectedSubCommunity ? `${selectedSubCommunity.members} members` : `${selectedCommunity.members} members`;

  // On mobile, picking a chat should also close the drawer.
  const selectSubCommunity = (id: number) => {
    handleSelectSubCommunity(id);
    setMobileSidebarOpen(false);
  };
  const selectCommunity = (id: number) => {
    handleSelectCommunity(id);
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <CommunitySidebar
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        selectedSubCommunityId={selectedSubCommunityId}
        targetCommunityId={checkboxTargets.communityId}
        targetSubIds={checkboxTargets.subIds}
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onSelectCommunity={selectCommunity}
        onSelectSubCommunity={selectSubCommunity}
        onToggleSubTarget={toggleSubTarget}
        onToggleCommunityTargets={toggleCommunityTargets}
      />

      {/* Main Feed Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <ChatHeader
          title={headerTitle}
          members={headerMembers}
          messages={currentMessages}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <PinnedAlert pinnedMessages={pinnedItems} />

        {/* Feed Scroll Area */}
        <ChatFeed
          views={selectedCommunity.views}
          messages={currentMessages}
          onTogglePin={handleTogglePin}
        />

        {/* Message Input Section */}
        <div className="p-3 sm:p-4 lg:p-6 bg-[#F8FAFC] shrink-0">
          <div className="max-w-[991px] mx-auto w-full">
            <MessageComposer communities={communities} onSend={handleSendMessage} onSendFile={handleSendFile} />
          </div>
        </div>
      </main>
    </>
  );
}
