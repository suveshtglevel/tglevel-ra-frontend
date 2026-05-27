'use client';

import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import CommunitySidebar from '@/components/dashboard/CommunitySidebar';
import ChatHeader from '@/components/dashboard/ChatHeader';
import PinnedAlert from '@/components/dashboard/PinnedAlert';
import MessageComposer from '@/components/dashboard/MessageComposer';
import type { FilePreviewData } from '@/components/dashboard/MessageComposer';
import ChatFeed from '@/components/dashboard/ChatFeed';
import FilePreviewScreen from '@/components/dashboard/FilePreviewScreen';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const {
    communities,
    selectedCommunityId,
    selectedCommunity,
    currentAnalysis,
    currentMessages,
    handleSelectCommunity,
    handleSendMessage,
    handleSendFile,
  } = useDashboard();

  const [filePreview, setFilePreview] = React.useState<FilePreviewData | null>(null);

  const handleFilePreviewSend = (file: FilePreviewData, caption?: string) => {
    handleSendFile(file, caption);
    setFilePreview(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <CommunitySidebar
        communities={communities}
        selectedCommunityId={selectedCommunityId}
        onSelectCommunity={handleSelectCommunity}
      />

      {/* Main Feed Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        <ChatHeader
          title={selectedCommunity.name}
          members={`${selectedCommunity.members} members`}
          views={selectedCommunity.views}
        />

        <PinnedAlert message={selectedCommunity.pinned} />

        {filePreview ? (
          /* Full-screen file preview replaces chat + input */
          <FilePreviewScreen
            file={filePreview}
            onSend={handleFilePreviewSend}
            onCancel={() => setFilePreview(null)}
          />
        ) : (
          <>
            {/* Feed Scroll Area */}
            <ChatFeed
              analysis={currentAnalysis}
              views={selectedCommunity.views}
              messages={currentMessages}
            />

            {/* Message Input Section */}
            <div className="p-6 bg-[#F8FAFC] shrink-0">
              <div className="max-w-[991px] mx-auto w-full">
                <MessageComposer
                  onSend={handleSendMessage}
                  onSendFile={handleSendFile}
                  onFileSelect={(file) => setFilePreview(file)}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
