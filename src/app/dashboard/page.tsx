'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import CommunitySidebar from '@/components/dashboard/CommunitySidebar';
import ChatHeader from '@/components/dashboard/ChatHeader';
import PinnedAlert from '@/components/dashboard/PinnedAlert';
import MessageComposer from '@/components/dashboard/MessageComposer';
import ChatFeed from '@/components/dashboard/ChatFeed';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const {
    communities,
    communitiesLoading,
    communitiesError,
    messageTypes,
    bundles,
    handleCreateBundle,
    creatingBundle,
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
    handleTogglePin,
  } = useDashboard();

  // Community list is an off-canvas drawer below `lg`; static side-by-side at lg+.
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const headerTitle = selectedSubCommunity?.name ?? selectedCommunity?.name ?? '';
  const headerMembers = selectedSubCommunity
    ? `${selectedSubCommunity.members} members`
    : selectedCommunity
      ? `${selectedCommunity.members} members`
      : '';

  // On mobile, picking a chat should also close the drawer.
  const selectSubCommunity = (id: string) => {
    handleSelectSubCommunity(id);
    setMobileSidebarOpen(false);
  };
  const selectCommunity = (id: string) => {
    handleSelectCommunity(id);
    setMobileSidebarOpen(false);
  };

  // Whether the RA may post to the currently open chat.
  const canSend = Boolean(selectedCommunity?.sendable && selectedSubCommunityId);

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

        {communitiesLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading communities…
          </div>
        ) : communitiesError ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-medium">
            Failed to load communities. Please try again.
          </div>
        ) : communities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
            No communities available.
          </div>
        ) : (
          <ChatFeed
            views={selectedCommunity?.views}
            messages={currentMessages}
            onTogglePin={handleTogglePin}
          />
        )}

        {/* Message Input Section */}
        <div className="p-3 sm:p-4 lg:p-6 bg-[#F8FAFC] shrink-0">
          <div className="max-w-[991px] mx-auto w-full">
            {canSend ? (
              <MessageComposer
                communities={communities}
                messageTypes={messageTypes}
                bundles={bundles}
                creatingBundle={creatingBundle}
                onCreateBundle={handleCreateBundle}
                onSend={handleSendMessage}
              />
            ) : selectedSubCommunityId ? (
              <p className="text-center text-[13px] font-semibold text-slate-400 py-3 bg-slate-100/50 rounded-xl border border-slate-200">
                You are not assigned to this community — viewing only.
              </p>
            ) : (
              <p className="text-center text-[13px] font-semibold text-slate-400 py-3 bg-slate-100/50 rounded-xl border border-slate-200">
                Select a sub-community to send a message.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
