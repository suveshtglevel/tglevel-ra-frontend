'use client';

import Sidebar from '@/components/dashboard/Sidebar';
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
    handleSelectSubCommunity,
    handleSendMessage,
    handleSendFile,
  } = useDashboard();

  const headerTitle = selectedSubCommunity ? selectedSubCommunity.name : selectedCommunity.name;
  const headerMembers = selectedSubCommunity ? `${selectedSubCommunity.members} members` : `${selectedCommunity.members} members`;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <CommunitySidebar
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        selectedSubCommunityId={selectedSubCommunityId}
        onSelectSubCommunity={handleSelectSubCommunity}
      />

      {/* Main Feed Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <ChatHeader
          title={headerTitle}
          members={headerMembers}
          views={selectedCommunity.views}
        />

        <PinnedAlert message={selectedCommunity.pinned} />

        {/* Feed Scroll Area */}
        <ChatFeed
          views={selectedCommunity.views}
          messages={currentMessages}
        />

        {/* Message Input Section */}
        <div className="p-6 bg-[#F8FAFC] shrink-0">
          <div className="max-w-[991px] mx-auto w-full">
            <MessageComposer communities={communities} onSend={handleSendMessage} onSendFile={handleSendFile} />
          </div>
        </div>
      </main>
    </div>
  );
}
