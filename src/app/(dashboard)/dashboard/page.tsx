'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import CommunitySidebar from '@/modules/dashboard/components/CommunitySidebar';
import ChatHeader from '@/modules/dashboard/components/ChatHeader';
import PinnedAlert from '@/modules/dashboard/components/PinnedAlert';
import ChatFeed from '@/modules/dashboard/components/ChatFeed';
import type { ReplyContext } from '@/modules/dashboard/components/MessageComposer';
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard';
import type { ChatMessage } from '@/store/slices/messageSlice';

// The composer drags in TipTap/ProseMirror (a large chunk) and is below the
// fold, so load it lazily — the feed paints first and the editor streams in.
// We reserve its space with a plain (non-skeleton) frame so the layout doesn't
// jump, but show no shimmer on the composer input.
const MessageComposer = dynamic(
  () => import('@/modules/dashboard/components/MessageComposer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[1100px] min-h-[150px] bg-white border border-slate-200 shadow-sm rounded-[14px]" />
    ),
  }
);

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
    messagesLoading,
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

  // Active follow-up reply (the trade message the RA is following up on).
  const [replyTo, setReplyTo] = React.useState<ReplyContext | null>(null);

  // Build the composer's reply context from the picked message; the preview is
  // its plain text (or attachment name), capped so the banner stays one line.
  const startFollowUp = (message: ChatMessage) => {
    const text = (message.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const preview = (text || message.attachment?.name || 'Attachment').slice(0, 140);
    setReplyTo({ id: message.id, sender: message.sender, preview });
  };

  const headerTitle = selectedSubCommunity?.name ?? selectedCommunity?.name ?? '';
  const headerMembers = selectedSubCommunity
    ? `${selectedSubCommunity.members} members`
    : selectedCommunity
      ? `${selectedCommunity.members} members`
      : '';

  // On mobile, picking a chat should also close the drawer. Switching chats also
  // cancels any in-progress follow-up reply (handled here, in the event, rather
  // than in an effect that would setState on every render after a switch).
  const selectSubCommunity = (id: string) => {
    handleSelectSubCommunity(id);
    setMobileSidebarOpen(false);
    setReplyTo(null);
  };
  const selectCommunity = (id: string) => {
    handleSelectCommunity(id);
    setMobileSidebarOpen(false);
    setReplyTo(null);
  };

  // Whether the RA may post to the currently open chat.
  const canSend = Boolean(selectedCommunity?.sendable && selectedSubCommunityId);

  return (
    <>
      <CommunitySidebar
        communities={communities}
        loading={communitiesLoading}
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

        {communitiesError ? (
          <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-medium">
            Failed to load communities. Please try again.
          </div>
        ) : !communitiesLoading && communities.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">
            No communities available.
          </div>
        ) : (
          // Render the feed shell immediately; show skeleton bubbles while the
          // communities or the open chat's messages are still loading.
          <ChatFeed
            messages={currentMessages}
            loading={communitiesLoading || messagesLoading}
            onTogglePin={handleTogglePin}
            onFollowUp={startFollowUp}
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
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
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
