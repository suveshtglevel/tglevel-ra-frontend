'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import AuthBootstrap from '@/modules/auth/components/AuthBootstrap';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  // Ctrl/Cmd+A should only select-all inside the chat message list (marked with
  // `data-select-all`) — everywhere else it would blue-highlight the whole UI.
  // Editable fields (inputs / textareas / the rich-text composer) keep their
  // native select-all; outside them we suppress the browser default and, when
  // the chat is on screen, select just its contents instead.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || (e.key !== 'a' && e.key !== 'A')) return;

      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.isContentEditable)
      ) {
        return; // let the field/editor handle its own select-all
      }

      e.preventDefault();
      const chat = document.querySelector('[data-select-all]');
      const selection = window.getSelection();
      if (chat && selection) {
        const range = document.createRange();
        range.selectNodeContents(chat);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
